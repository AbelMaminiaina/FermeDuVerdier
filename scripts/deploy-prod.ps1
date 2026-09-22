<#
.SYNOPSIS
    Deploie (met a jour) la Ferme du Vardier en PRODUCTION sur le VPS Contabo, par SSH.

.DESCRIPTION
    Meme principe que scripts/deploy-demo.ps1 du projet ecommerceNew :
    - envoie scripts/remote-deploy.sh au serveur par SSH et l'execute dans /opt/FermeDuVardier ;
    - verifie les secrets de .env.production, sauvegarde la base, met a jour le code depuis GitHub
      (en conservant les reglages locaux du serveur), reconstruit les conteneurs, applique les
      migrations, attend que le site reponde, controle la securite de l'API et le certificat SSL.
    - Le code deploye est celui de GitHub (branche -Branch) : poussez (git push) avant de deployer.

.EXAMPLE
    .\scripts\deploy-prod.ps1                        # deploiement
.EXAMPLE
    .\scripts\deploy-prod.ps1 -Action status         # etat, version, SSL
.EXAMPLE
    .\scripts\deploy-prod.ps1 -Action rollback       # revenir a la version precedente
.EXAMPLE
    .\scripts\deploy-prod.ps1 -Action setup-key      # ne plus taper le mot de passe SSH
#>
[CmdletBinding()]
param(
    [string]$Server = '167.86.111.192',
    [string]$User = 'root',
    [int]$Port = 22,
    # Cle privee SSH (sinon : cle par defaut / mot de passe)
    [string]$KeyPath,
    # deploy ; status ; logs ; backup ; rollback ; ssl-check ; ssl-renew ; server-diff ; setup-key
    [ValidateSet('deploy', 'status', 'logs', 'backup', 'rollback', 'ssl-check', 'ssl-renew', 'server-diff', 'setup-key')]
    [string]$Action = 'deploy',
    [string]$Branch = 'main',
    [string]$RemoteDir = '/opt/FermeDuVardier',
    [string]$Domain = 'fermeduvardier.com',
    # Ne pas demander de confirmation
    [switch]$Yes
)

$ErrorActionPreference = 'Stop'

function Write-Step([string]$Message) { Write-Host "`n==> $Message" -ForegroundColor Cyan }
function Stop-Deploy([string]$Message) { Write-Host "`nERREUR : $Message" -ForegroundColor Red; exit 1 }

# --- Prerequis locaux ---------------------------------------------------------------------------
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Stop-Deploy "Le client SSH est introuvable. Activez 'Client OpenSSH' (Parametres > Applications > Fonctionnalites facultatives)."
}
$remoteScriptPath = Join-Path $PSScriptRoot 'remote-deploy.sh'
if (-not (Test-Path $remoteScriptPath)) { Stop-Deploy "Fichier introuvable : $remoteScriptPath" }
if ($Server -notmatch '^[A-Za-z0-9._-]+$') { Stop-Deploy "Adresse de serveur invalide : $Server" }
if ($RemoteDir -notmatch '^/[A-Za-z0-9._/-]+$') { Stop-Deploy "RemoteDir invalide : $RemoteDir" }
if ($Branch -notmatch '^[A-Za-z0-9._/-]+$') { Stop-Deploy "Nom de branche invalide : $Branch" }
if ($Domain -notmatch '^[A-Za-z0-9.-]+$') { Stop-Deploy "Domaine invalide : $Domain" }

$target = "$User@$Server"
$sshArgs = @('-p', $Port, '-o', 'StrictHostKeyChecking=accept-new', '-o', 'ServerAliveInterval=30')
if ($KeyPath) {
    if (-not (Test-Path $KeyPath)) { Stop-Deploy "Cle SSH introuvable : $KeyPath" }
    $sshArgs += @('-i', $KeyPath)
}

function ConvertTo-ShellQuoted([string]$Value) { "'" + ($Value -replace "'", "'\''") + "'" }

# --- Cle SSH : un seul mot de passe a taper, puis plus jamais ------------------------------------
if ($Action -eq 'setup-key') {
    $keyFile = Join-Path $HOME '.ssh\id_ed25519'
    if (-not (Test-Path $keyFile)) {
        Write-Step "Creation d'une cle SSH ($keyFile)"
        New-Item -ItemType Directory -Force (Split-Path $keyFile) | Out-Null
        & ssh-keygen -t ed25519 -f $keyFile -N '""' -C "deploy-fermeduvardier"
        if ($LASTEXITCODE -ne 0) { Stop-Deploy "ssh-keygen a echoue." }
    }
    Write-Step "Installation de la cle sur $target (mot de passe demande une derniere fois)"
    $pub = (Get-Content -Raw "$keyFile.pub").Trim()
    # Ajoute la cle puis dedoublonne (sans guillemets imbriques, fragiles avec PowerShell 5.1)
    $pub | & ssh @sshArgs $target 'umask 077; mkdir -p ~/.ssh; cat >> ~/.ssh/authorized_keys; sort -u -o ~/.ssh/authorized_keys ~/.ssh/authorized_keys'
    if ($LASTEXITCODE -ne 0) { Stop-Deploy "Installation de la cle impossible." }
    Write-Host "Cle installee. Les prochains deploiements ne demanderont plus de mot de passe." -ForegroundColor Green
    exit 0
}

# Le script distant, avec fins de ligne Unix
$remoteScript = ((Get-Content -Raw -Path $remoteScriptPath) -replace "`r`n", "`n")

# --- Verifications sur le depot local (le serveur deploie ce qui est sur GitHub) ------------------
if ($Action -eq 'deploy') {
    try {
        $repoRoot = Split-Path $PSScriptRoot -Parent
        if (Get-Command git -ErrorAction SilentlyContinue) {
            $dirty = git -C $repoRoot status --porcelain --untracked-files=no 2>$null
            $localHead = (git -C $repoRoot rev-parse HEAD 2>$null)
            $remoteLine = (git -C $repoRoot ls-remote origin $Branch 2>$null)
            $remoteHead = if ($remoteLine) { ($remoteLine -split '\s+')[0] } else { $null }
            if ($dirty) {
                Write-Host "Attention : des modifications locales ne sont pas commitees. Le serveur deploiera la version GitHub, sans elles." -ForegroundColor Yellow
            }
            if ($localHead -and $remoteHead -and $localHead -ne $remoteHead) {
                Write-Host "Attention : votre commit local ($($localHead.Substring(0,7))) n'est pas celui de origin/$Branch ($($remoteHead.Substring(0,7))). Faites 'git push' pour deployer votre derniere version." -ForegroundColor Yellow
            }
            elseif ($remoteHead) {
                Write-Host "Version qui sera deployee : $($remoteHead.Substring(0,7)) $(git -C $repoRoot log -1 --format='%s' $remoteHead 2>$null)"
            }
        }
    }
    catch { }
}

# --- Confirmation pour les actions qui touchent la prod ------------------------------------------
if ($Action -in @('deploy', 'rollback', 'ssl-renew') -and -not $Yes) {
    Write-Host ""
    Write-Host "  Serveur  : $target   Dossier : $RemoteDir"
    Write-Host "  Site     : https://$Domain  (PRODUCTION)"
    switch ($Action) {
        'deploy'    { Write-Host "  Action   : mise a jour depuis GitHub ($Branch), base sauvegardee avant" }
        'rollback'  { Write-Host "  Action   : retour a la version precedente (base sauvegardee avant)" }
        'ssl-renew' { Write-Host "  Action   : renouvellement du certificat HTTPS (site coupe ~20 s)" }
    }
    if ((Read-Host "Continuer ? (o/N)") -notmatch '^[oOyY]') { Stop-Deploy "Annule." }
}

# --- Execution sur le serveur ------------------------------------------------------------------
$envPrefix = @(
    "APP_DIR=$(ConvertTo-ShellQuoted $RemoteDir)",
    "BRANCH=$(ConvertTo-ShellQuoted $Branch)",
    "DOMAIN=$(ConvertTo-ShellQuoted $Domain)"
) -join ' '

Write-Step "$Action sur $target$(if ($Action -eq 'deploy') { ' (la reconstruction dure plusieurs minutes)' })"
$remoteScript | & ssh @sshArgs $target "env $envPrefix bash -s -- $Action"
$code = $LASTEXITCODE
if ($code -eq 255) { Stop-Deploy "Connexion SSH impossible (adresse, mot de passe ou cle). Astuce : -Action setup-key" }
if ($code -ne 0) { Stop-Deploy "L'action '$Action' a echoue (code $code). Voir les messages ci-dessus." }

if ($Action -eq 'deploy') {
    Write-Host "`nTermine. Commandes utiles :" -ForegroundColor Green
    Write-Host "  .\scripts\deploy-prod.ps1 -Action status      (etat, version, SSL)"
    Write-Host "  .\scripts\deploy-prod.ps1 -Action logs"
    Write-Host "  .\scripts\deploy-prod.ps1 -Action rollback    (revenir a la version precedente)"
    Write-Host "  .\scripts\deploy-prod.ps1 -Action ssl-renew   (avant le 21 decembre 2026)"
}
