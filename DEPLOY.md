# Guide de Deploiement - Ferme du Vardier

Deploiement sur VPS Contabo avec Docker.

## Prerequisites sur le VPS

### 1. Installer Docker et Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose plugin
sudo apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

### 2. Installer Git

```bash
sudo apt install git -y
```

### 3. Configurer le Firewall

```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

## Deploiement

### 1. Cloner le repository

```bash
cd /opt
sudo git clone https://github.com/YOUR_USERNAME/FermeDuVardier.git
cd FermeDuVardier
sudo chown -R $USER:$USER .
```

### 2. Configurer les variables d'environnement

```bash
# Copier le template
cp .env.production.example .env.production

# Editer avec vos valeurs
nano .env.production
```

**Variables importantes a configurer:**

| Variable | Description |
|----------|-------------|
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL (fort) |
| `REDIS_PASSWORD` | Mot de passe Redis |
| `DOMAIN` | Votre nom de domaine |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `ADMIN_PASSWORD` | Mot de passe admin |

### 3. Lancer le deploiement

```bash
# Rendre le script executable
chmod +x deploy.sh

# Deployer (premiere fois)
./deploy.sh deploy
```

### 4. Configurer SSL (Let's Encrypt)

```bash
# Assurez-vous que votre domaine pointe vers le VPS
./deploy.sh ssl
```

## Commandes Utiles

```bash
# Voir les logs
./deploy.sh logs

# Logs backend seulement
./deploy.sh logs-backend

# Status des containers
./deploy.sh status

# Redemarrer les services
./deploy.sh restart

# Arreter les services
./deploy.sh stop

# Mise a jour (pull + rebuild)
./deploy.sh update

# Backup de la base de donnees
mkdir -p backups
./deploy.sh backup

# Seeder la base de donnees
./deploy.sh seed

# Acceder au shell PostgreSQL
./deploy.sh shell-db
```

## Architecture Docker

```
                    [Internet]
                         |
                    [Nginx:80/443]
                    /          \
           [Frontend:3000]  [Backend:3001]
                                 |
                    [PostgreSQL:5432] + [Redis:6379]
```

## Structure des fichiers

```
FermeDuVardier/
├── docker-compose.prod.yml   # Orchestration production
├── .env.production           # Variables d'environnement
├── deploy.sh                 # Script de deploiement
├── nginx/
│   ├── nginx.conf           # Config Nginx avec SSL
│   └── nginx.conf.http-only # Config sans SSL (initial)
├── certbot/                  # Certificats SSL
├── backend/
│   └── Dockerfile
└── frontend/
    └── Dockerfile
```

## Mise a jour de l'application

```bash
# Sur le VPS
cd /opt/FermeDuVardier
git pull origin main
./deploy.sh update
```

## Monitoring

### Verifier l'etat des services

```bash
docker compose -f docker-compose.prod.yml ps
```

### Verifier les ressources

```bash
docker stats
```

### Verifier les logs d'erreur

```bash
docker compose -f docker-compose.prod.yml logs --tail=100 backend
docker compose -f docker-compose.prod.yml logs --tail=100 frontend
```

## Backup et Restore

### Backup manuel

```bash
# Backup base de donnees
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U fermeduvardier fermeduvardier > backup_$(date +%Y%m%d).sql

# Backup volumes Docker
docker run --rm -v fermeduvardier-postgres-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres_data_backup.tar.gz /data
```

### Restore

```bash
# Restore base de donnees
cat backup.sql | docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U fermeduvardier fermeduvardier
```

## Troubleshooting

### Les containers ne demarrent pas

```bash
# Verifier les logs
docker compose -f docker-compose.prod.yml logs

# Reconstruire les images
docker compose -f docker-compose.prod.yml up -d --build --force-recreate
```

### Probleme de connexion a la base de donnees

```bash
# Verifier que PostgreSQL est healthy
docker compose -f docker-compose.prod.yml exec postgres pg_isready

# Verifier les credentials
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U fermeduvardier -d fermeduvardier -c "SELECT 1"
```

### Probleme de certificat SSL

```bash
# Renouveler le certificat
docker compose -f docker-compose.prod.yml run --rm certbot renew

# Restart nginx
docker compose -f docker-compose.prod.yml restart nginx
```

### Nettoyer l'espace disque

```bash
# Supprimer les images inutilisees
docker system prune -a

# Supprimer les volumes orphelins
docker volume prune
```

## Securite

1. **Changez tous les mots de passe par defaut**
2. **Activez le firewall** (ufw)
3. **Configurez fail2ban** pour SSH
4. **Mettez a jour regulierement** le systeme et les images Docker
5. **Sauvegardez regulierement** la base de donnees

```bash
# Installer fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
```

## Support

Pour tout probleme, verifiez:
1. Les logs Docker: `./deploy.sh logs`
2. L'etat des containers: `./deploy.sh status`
3. L'espace disque: `df -h`
4. La memoire: `free -m`
