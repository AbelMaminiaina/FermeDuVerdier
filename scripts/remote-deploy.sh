#!/usr/bin/env bash
# Execute SUR LE SERVEUR par scripts/deploy-prod.ps1 (envoye par SSH sur l'entree standard).
# Deploiement de PRODUCTION de la Ferme du Vardier (fermeduvardier.com, ports 80/443).
# Fichier volontairement ASCII (transite par stdin depuis PowerShell).
#
# Usage : bash -s -- <deploy|status|logs|backup|rollback|ssl-check|ssl-renew|ssl-auto|server-diff>
# Variables d'environnement lues : APP_DIR BRANCH DOMAIN
#
# Particularite du serveur : il porte des reglages locaux non commites (ex. docker-compose.prod.yml
# qui monte /etc/letsencrypt). Le deploiement les PRESERVE : sauvegarde en patch, git stash,
# mise a jour, puis re-application. En cas de conflit, tout est remis comme avant.
#
# .env.production (secrets de prod) n'est JAMAIS ecrit : seulement lu, et copie en sauvegarde.
# Verrou : son empreinte est prise au debut et reverifiee apres chaque etape ; s'il a change,
# il est restaure depuis la copie et le script s'arrete.
set -euo pipefail

ACTION="${1:-deploy}"
APP_DIR="${APP_DIR:-/opt/FermeDuVardier}"
BRANCH="${BRANCH:-main}"
DOMAIN="${DOMAIN:-fermeduvardier.com}"
REQUIRED_ENV="POSTGRES_PASSWORD REDIS_PASSWORD NEXTAUTH_SECRET ADMIN_PASSWORD"
STAMP="$(date +%Y%m%d_%H%M%S)"

say()  { printf '\n==> %s\n' "$*"; }
warn() { printf 'ATTENTION : %s\n' "$*"; }
fail() { printf '\nERREUR: %s\n' "$*" >&2; exit 1; }

compose() { docker compose -f docker-compose.prod.yml --env-file .env.production "$@"; }

env_value() { grep -m1 "^$1=" .env.production 2>/dev/null | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//' || true; }

check_prereqs() {
  say "Verification du serveur"
  command -v docker >/dev/null 2>&1 || fail "Docker n'est pas installe."
  docker compose version >/dev/null 2>&1 || fail "Le plugin 'docker compose' est absent."
  command -v git >/dev/null 2>&1 || fail "git n'est pas installe."
  command -v curl >/dev/null 2>&1 || fail "curl n'est pas installe."
  docker info >/dev/null 2>&1 || fail "Le daemon Docker n'est pas joignable."
  [ -d "$APP_DIR/.git" ] || fail "$APP_DIR n'est pas un depot git (mauvais dossier ? le site tourne depuis /opt/FermeDuVardier)."
  cd "$APP_DIR"
  [ -f .env.production ] || fail ".env.production introuvable dans $APP_DIR."
}

# Les secrets obligatoires doivent exister et ne pas etre vides (valeurs jamais affichees)
check_env() {
  say "Verification de .env.production"
  local missing="" key
  for key in $REQUIRED_ENV; do
    [ -n "$(env_value "$key")" ] || missing="$missing $key"
  done
  if [ -n "$missing" ]; then
    fail "Variables manquantes ou vides dans .env.production :$missing
  NEXTAUTH_SECRET : meme valeur que celle du frontend (sinon l'admin ne peut plus rien modifier).
  ADMIN_PASSWORD  : mot de passe admin (sinon la connexion admin est refusee en production).
  Ajoutez-les puis relancez. Aucun changement n'a ete fait."
  fi
  echo "OK ($REQUIRED_ENV)"
}

backup_db() {
  say "Sauvegarde de la base de donnees"
  mkdir -p backups/db
  local user db file
  user="$(env_value POSTGRES_USER)"; user="${user:-fermeduvardier}"
  db="$(env_value POSTGRES_DB)"; db="${db:-fermeduvardier}"
  file="backups/db/backup_${STAMP}.sql.gz"
  compose exec -T postgres pg_dump -U "$user" "$db" | gzip > "$file" \
    || { rm -f "$file"; fail "pg_dump a echoue : deploiement annule (base non sauvegardee)."; }
  [ "$(gzip -dc "$file" | head -c 100 | wc -c)" -gt 0 ] || { rm -f "$file"; fail "Sauvegarde vide : deploiement annule."; }
  echo "Sauvegarde : $APP_DIR/$file ($(du -h "$file" | cut -f1))"
  # Garder les 15 dernieres
  ls -1t backups/db/backup_*.sql.gz 2>/dev/null | tail -n +16 | xargs -r rm --
  LAST_BACKUP="$file"
}

backup_env() {
  mkdir -p backups/env
  cp .env.production "backups/env/env.production.${STAMP}.bak"
  ls -1t backups/env/env.production.*.bak 2>/dev/null | tail -n +21 | xargs -r rm --
}

# --- Verrou sur .env.production ----------------------------------------------------------------
env_hash() { sha256sum .env.production | cut -d' ' -f1; }

lock_env() {
  # Un .env.production suivi par git pourrait etre ecrase par une mise a jour : on refuse
  if git ls-files --error-unmatch .env.production >/dev/null 2>&1; then
    fail ".env.production est suivi par git sur le serveur : une mise a jour pourrait l'ecraser.
  Retirez-le du suivi (sans le supprimer) : git rm --cached .env.production ; puis relancez."
  fi
  git check-ignore -q .env.production     || warn ".env.production n'est pas dans .gitignore sur le serveur (il reste protege par ce script)."
  ENV_HASH="$(env_hash)"
  ENV_COPY="backups/env/env.production.${STAMP}.bak"
  [ -f "$ENV_COPY" ] || fail "Copie de sauvegarde de .env.production absente."
}

verify_env() {
  [ -n "${ENV_HASH:-}" ] || return 0
  if [ ! -f .env.production ] || [ "$(env_hash)" != "$ENV_HASH" ]; then
    cp "$ENV_COPY" .env.production
    chmod 600 .env.production
    fail ".env.production a ete modifie pendant l'etape '$1' : il a ete RESTAURE a l'identique
  depuis $APP_DIR/$ENV_COPY. Deploiement arrete."
  fi
  echo "OK  .env.production intact ($1)"
}

# Execute une operation git (mise a jour ou retour arriere) en preservant les reglages locaux
# du serveur : patch de sauvegarde + stash, operation, puis re-application. En cas d'echec ou de
# conflit, le serveur est remis exactement dans son etat d'avant.
move_code_preserving_local() {
  local label="$1"; shift
  local before stashed=0
  before="$(git rev-parse HEAD)"

  if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
    mkdir -p backups/server-changes
    git diff > "backups/server-changes/local_${STAMP}.patch"
    echo "Reglages locaux du serveur detectes (conserves) :"
    git status --short --untracked-files=no | sed 's/^/    /'
    echo "  copie : backups/server-changes/local_${STAMP}.patch"
    git stash push --quiet -m "deploy-${STAMP}" || fail "git stash impossible."
    stashed=1
  fi

  restore() {
    git reset --quiet --hard
    git checkout --quiet "$ORIG_REF" 2>/dev/null || true
    git reset --quiet --hard "$before"
    if [ "$stashed" = "1" ]; then git stash pop --quiet || true; fi
  }

  ORIG_REF="$(git symbolic-ref --quiet --short HEAD || echo "$before")"
  if ! "$@"; then
    restore
    fail "$label impossible. Rien n'a change."
  fi

  if [ "$stashed" = "1" ] && ! git stash pop --quiet; then
    echo "Conflit en re-appliquant les reglages locaux :"
    git status --short | sed 's/^/    /'
    restore
    fail "Conflit sur des fichiers modifies localement sur le serveur. Le serveur est revenu a l'etat
  d'avant (commit $(git rev-parse --short HEAD), reglages locaux remis). Rien n'a ete reconstruit.
  Envoyez la sortie de : .\scripts\deploy-prod.ps1 -Action server-diff"
  fi
}

update_to_branch() {
  git checkout --quiet "$BRANCH" && git merge --ff-only --quiet "origin/$BRANCH"
}

fetch_code() {
  say "Mise a jour du code ($BRANCH)"
  PREV_COMMIT="$(git rev-parse HEAD)"
  git fetch --quiet origin "$BRANCH" || fail "git fetch impossible (acces GitHub ?)."
  move_code_preserving_local "Mise a jour (avance rapide sur origin/$BRANCH)" update_to_branch
  # Enregistre seulement apres succes : c'est la cible d'un eventuel retour arriere
  mkdir -p backups/deploy
  echo "$PREV_COMMIT" > backups/deploy/previous_commit
  echo "Version : $(git log -1 --format='%h %s')  (avant : ${PREV_COMMIT:0:7})"
}

# Construit les nouvelles images PENDANT que l'ancien site continue de tourner ; les conteneurs
# ne sont remplaces qu'une fois le build reussi (coupure de quelques secondes seulement).
# Si le build echoue, le site en ligne n'est pas touche.
# Pas de --remove-orphans : ne jamais supprimer un conteneur que ce fichier compose ne decrit pas.
build_and_restart() {
  say "Construction des nouvelles images (le site actuel reste en ligne, plusieurs minutes)"
  compose build || fail "Le build a echoue : le site en ligne n'a PAS ete modifie (ancienne version toujours active).
  Le code sur disque est deja a jour : corrigez puis relancez le deploiement, ou remettez le code
  d'avant avec -Action rollback."
  say "Remplacement des conteneurs modifies (coupure de quelques secondes)"
  compose up -d
}

reload_nginx() {
  compose exec -T nginx nginx -t >/dev/null 2>&1 && compose exec -T nginx nginx -s reload >/dev/null 2>&1 \
    || compose restart nginx >/dev/null 2>&1 || true
}

# Le site repond-il en HTTPS, via le nginx local ? (-k : la validite du certificat est controlee a part)
https_ok() {
  curl -kfsS -o /dev/null -m 10 --resolve "${DOMAIN}:443:127.0.0.1" "https://${DOMAIN}$1" 2>/dev/null
}

wait_ready() {
  say "Attente du demarrage du site (1 a 3 minutes)"
  local i
  for i in $(seq 1 90); do
    if https_ok /api/health && https_ok /; then
      echo "Site pret."
      return 0
    fi
    sleep 2
  done
  compose ps || true
  compose logs --tail 40 backend frontend nginx || true
  fail "Le site ne repond pas en HTTPS apres 3 minutes (logs ci-dessus).
  Pour revenir a la version precedente : .\scripts\deploy-prod.ps1 -Action rollback"
}

smoke_tests() {
  say "Controles apres deploiement"
  local code
  code="$(curl -ks -o /dev/null -w '%{http_code}' -m 10 --resolve "${DOMAIN}:443:127.0.0.1" "https://${DOMAIN}/api/checkout/orders" || true)"
  if [ "$code" = "401" ]; then
    echo "OK  API admin protegee (liste des commandes -> 401 sans connexion)"
  else
    warn "la liste des commandes repond $code sans connexion (attendu 401) : l'API admin n'est PAS protegee."
  fi
  code="$(curl -ks -o /dev/null -w '%{http_code}' -m 10 --resolve "${DOMAIN}:443:127.0.0.1" "https://${DOMAIN}/api/products" || true)"
  [ "$code" = "200" ] && echo "OK  catalogue public (200)" || warn "catalogue : code $code (attendu 200)"
  code="$(curl -ks -o /dev/null -w '%{http_code}' -m 10 --resolve "${DOMAIN}:443:127.0.0.1" "https://${DOMAIN}/suivi-commande" || true)"
  [ "$code" = "200" ] && echo "OK  page suivi de commande (200)" || warn "suivi de commande : code $code (attendu 200)"
}

ssl_days_left() {
  local end
  end="$(echo | openssl s_client -connect 127.0.0.1:443 -servername "$DOMAIN" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)"
  [ -n "$end" ] || { echo "?"; return; }
  echo $(( ( $(date -d "$end" +%s) - $(date +%s) ) / 86400 ))
}

ssl_check() {
  local days
  days="$(ssl_days_left)"
  if [ "$days" = "?" ]; then
    warn "certificat SSL illisible."
  elif [ "$days" -lt 0 ]; then
    warn "certificat SSL EXPIRE (site bloque par les navigateurs) : deploy-prod.ps1 -Action ssl-renew"
  elif [ "$days" -lt 30 ]; then
    warn "certificat SSL : plus que $days jours. Renouvelez : deploy-prod.ps1 -Action ssl-renew"
  else
    echo "OK  certificat SSL valide encore $days jours"
  fi
}

do_deploy() {
  check_prereqs
  check_env
  backup_env
  lock_env
  backup_db
  fetch_code
  verify_env "mise a jour du code"

  build_and_restart
  verify_env "reconstruction"

  say "Migrations de la base"
  compose exec -T backend npx prisma migrate deploy \
    || warn "prisma migrate deploy a echoue (le backend les rejoue aussi au demarrage). Voir: -Action logs"

  reload_nginx
  wait_ready
  smoke_tests
  ssl_check
  verify_env "fin du deploiement"
  ssl_auto_status

  say "Etat des conteneurs"
  compose ps

  echo
  echo "================================================================"
  echo " DEPLOIEMENT TERMINE : https://${DOMAIN}"
  echo " Version        : $(git log -1 --format='%h %s')"
  echo " Sauvegarde BDD : $APP_DIR/$LAST_BACKUP"
  echo " .env.production: inchange (copie : $APP_DIR/$ENV_COPY)"
  echo " Retour arriere : deploy-prod.ps1 -Action rollback  (revient a ${PREV_COMMIT:0:7})"
  echo "================================================================"
}

do_rollback() {
  check_prereqs
  [ -f backups/deploy/previous_commit ] || fail "Aucun deploiement precedent enregistre."
  local target
  target="$(cat backups/deploy/previous_commit)"
  say "Retour a la version ${target:0:7}"
  backup_env
  lock_env
  backup_db
  move_code_preserving_local "Retour a ${target:0:7}" git checkout --quiet "$target"
  verify_env "retour arriere"
  build_and_restart
  verify_env "reconstruction"
  reload_nginx
  wait_ready
  echo "Revenu a : $(git log -1 --format='%h %s')"
  echo "NB : les migrations de base deja appliquees ne sont pas annulees."
  echo "     Restaurer la base si besoin : gunzip -c $APP_DIR/<sauvegarde>.sql.gz | docker compose -f docker-compose.prod.yml exec -T postgres psql -U <user> <db>"
  echo "     Pour revenir ensuite sur $BRANCH : relancez un deploiement."
}

# Renouvellement SSL : nginx coupe ~20 s (certbot a besoin du port 80), toujours relance ensuite
do_ssl_renew() {
  check_prereqs
  local nginx_id le_dir
  nginx_id="$(compose ps -q nginx)"
  [ -n "$nginx_id" ] || fail "Conteneur nginx introuvable."
  le_dir="$(docker inspect -f '{{range .Mounts}}{{if eq .Destination "/etc/letsencrypt"}}{{.Source}}{{end}}{{end}}' "$nginx_id")"
  [ -n "$le_dir" ] || fail "Dossier des certificats introuvable (aucun montage /etc/letsencrypt sur nginx)."
  say "Renouvellement du certificat ($le_dir) - site coupe quelques secondes"
  docker stop "$nginx_id" >/dev/null
  trap 'docker start "$nginx_id" >/dev/null' EXIT
  docker run --rm --network host -v "$le_dir:/etc/letsencrypt" certbot/certbot \
    renew --standalone --no-random-sleep-on-renew || warn "certbot a signale une erreur (voir ci-dessus)."
  docker start "$nginx_id" >/dev/null
  trap - EXIT
  sleep 3
  ssl_check
}

# --- Renouvellement automatique du certificat (cron sur le serveur) ------------------------------
RENEW_BIN=/usr/local/bin/fermeduvardier-ssl-renew.sh
RENEW_CRON=/etc/cron.d/fermeduvardier-ssl
RENEW_LOG=/var/log/fermeduvardier-ssl.log

write_renew_script() {
  cat > "$RENEW_BIN" <<'RENEW'
#!/usr/bin/env bash
# Installe par : deploy-prod.ps1 -Action ssl-auto   (ne pas modifier ici : reinstaller)
# Lance par cron 2 fois par jour. certbot ne renouvelle que si le certificat expire dans < 30 jours :
# le reste du temps, ce script ne fait rien.
# 1) mode "webroot" : sans coupure (nginx sert /.well-known/acme-challenge/ depuis /var/www/certbot)
# 2) si echec : mode "standalone" (nginx coupe ~20 s), uniquement si un certificat est a renouveler
set -uo pipefail
NGINX=fermeduvardier-nginx
log() { echo "$(date '+%F %T') $*"; }
mount_src() { docker inspect -f "{{range .Mounts}}{{if eq .Destination \"$1\"}}{{.Source}}{{end}}{{end}}" "$NGINX" 2>/dev/null; }

LE_DIR="$(mount_src /etc/letsencrypt)"; LE_DIR="${LE_DIR:-/etc/letsencrypt}"
WEBROOT="$(mount_src /var/www/certbot)"
FLAG="$LE_DIR/.renewed-by-cron"
HOOK="touch /etc/letsencrypt/.renewed-by-cron"
rm -f "$FLAG"

needs_renewal() {
  local cert
  for cert in "$LE_DIR"/live/*/fullchain.pem; do
    [ -f "$cert" ] || continue
    openssl x509 -checkend $((30 * 86400)) -noout -in "$cert" >/dev/null 2>&1 || return 0
  done
  return 1
}

done_ok=1
if [ -n "$WEBROOT" ]; then
  if docker run --rm -v "$LE_DIR:/etc/letsencrypt" -v "$WEBROOT:/var/www/certbot" certbot/certbot \
       renew --webroot -w /var/www/certbot --no-random-sleep-on-renew --deploy-hook "$HOOK"; then
    done_ok=0
  else
    log "webroot : echec"
  fi
fi

if [ "$done_ok" -ne 0 ] && needs_renewal; then
  log "bascule en mode standalone (nginx coupe quelques secondes)"
  docker stop "$NGINX" >/dev/null
  trap 'docker start "$NGINX" >/dev/null' EXIT
  docker run --rm --network host -v "$LE_DIR:/etc/letsencrypt" certbot/certbot \
    renew --standalone --no-random-sleep-on-renew --deploy-hook "$HOOK" || log "standalone : echec"
  docker start "$NGINX" >/dev/null
  trap - EXIT
fi

if [ -f "$FLAG" ]; then
  rm -f "$FLAG"
  if docker exec "$NGINX" nginx -s reload; then
    log "certificat renouvele, nginx recharge"
  else
    docker restart "$NGINX" >/dev/null && log "certificat renouvele, nginx redemarre"
  fi
fi

for cert in "$LE_DIR"/live/*/fullchain.pem; do
  [ -f "$cert" ] || continue
  end="$(openssl x509 -noout -enddate -in "$cert" | cut -d= -f2)"
  log "$(basename "$(dirname "$cert")") : expire le $end"
done
RENEW
  chmod 755 "$RENEW_BIN"
}

do_ssl_auto() {
  check_prereqs
  [ "$(id -u)" = "0" ] || fail "Il faut etre root pour installer la tache automatique."
  command -v openssl >/dev/null 2>&1 || fail "openssl n'est pas installe (apt install openssl)."
  [ -d /etc/cron.d ] || fail "cron n'est pas installe (apt install cron)."
  local nginx_id
  nginx_id="$(compose ps -q nginx)"
  [ -n "$nginx_id" ] || fail "Conteneur nginx introuvable."

  say "Installation du script de renouvellement ($RENEW_BIN)"
  write_renew_script

  say "Test a blanc du mode sans coupure (webroot, serveur de test Let's Encrypt)"
  local le_dir webroot
  le_dir="$(docker inspect -f '{{range .Mounts}}{{if eq .Destination "/etc/letsencrypt"}}{{.Source}}{{end}}{{end}}' "$nginx_id")"
  webroot="$(docker inspect -f '{{range .Mounts}}{{if eq .Destination "/var/www/certbot"}}{{.Source}}{{end}}{{end}}' "$nginx_id")"
  echo "Certificats : ${le_dir:-?}   Dossier ACME : ${webroot:-aucun}"
  if [ -n "$webroot" ] && docker run --rm -v "${le_dir:-/etc/letsencrypt}:/etc/letsencrypt" -v "$webroot:/var/www/certbot" \
       certbot/certbot renew --dry-run --webroot -w /var/www/certbot --no-random-sleep-on-renew >/tmp/fdv-ssl-dryrun.log 2>&1; then
    echo "OK  le renouvellement se fera SANS coupure du site."
  else
    tail -5 /tmp/fdv-ssl-dryrun.log 2>/dev/null || true
    warn "le mode sans coupure ne fonctionne pas sur ce serveur : le renouvellement utilisera le mode"
    echo "    standalone (site coupe ~20 s, une fois tous les 2 mois environ, a 3h17 ou 15h17)."
  fi
  rm -f /tmp/fdv-ssl-dryrun.log

  say "Planification : tous les jours a 3h17 et 15h17 ($RENEW_CRON)"
  cat > "$RENEW_CRON" <<CRON
# Renouvellement automatique du certificat HTTPS de ${DOMAIN} (installe par deploy-prod.ps1 -Action ssl-auto)
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
17 3,15 * * * root $RENEW_BIN >> $RENEW_LOG 2>&1
CRON
  chmod 644 "$RENEW_CRON"
  if command -v systemctl >/dev/null 2>&1; then
    systemctl enable --now cron >/dev/null 2>&1 || systemctl enable --now crond >/dev/null 2>&1 || true
  fi

  cat > /etc/logrotate.d/fermeduvardier-ssl <<LOGROTATE
$RENEW_LOG {
  monthly
  rotate 6
  compress
  missingok
  notifempty
}
LOGROTATE

  say "Premier passage (ne renouvelle que si necessaire)"
  "$RENEW_BIN" 2>&1 | tee -a "$RENEW_LOG" | tail -5
  ssl_check
  echo
  echo "Renouvellement automatique installe. Journal : $RENEW_LOG"
}

ssl_auto_status() {
  if [ -f "$RENEW_CRON" ] && [ -x "$RENEW_BIN" ]; then
    echo "OK  renouvellement automatique du certificat installe (3h17 et 15h17)"
    [ -f "$RENEW_LOG" ] && { echo "    Derniers passages :"; tail -3 "$RENEW_LOG" | sed 's/^/      /'; }
  else
    warn "renouvellement automatique du certificat NON installe : deploy-prod.ps1 -Action ssl-auto"
  fi
}

do_server_diff() {
  check_prereqs
  say "Reglages locaux du serveur (non commites)"
  git log -1 --format='Version : %h %s'
  git status --short
  git diff --stat
  git diff
}

case "$ACTION" in
  deploy)      do_deploy ;;
  status)      check_prereqs; git log -1 --format='Version : %h %s (%cr)'; compose ps; ssl_check; ssl_auto_status ;;
  logs)        check_prereqs; compose logs --tail 100 ;;
  backup)      check_prereqs; backup_db ;;
  rollback)    do_rollback ;;
  ssl-check)   check_prereqs; ssl_check ;;
  ssl-renew)   do_ssl_renew ;;
  ssl-auto)    do_ssl_auto ;;
  server-diff) do_server_diff ;;
  *)           fail "Action inconnue: $ACTION" ;;
esac
exit 0
