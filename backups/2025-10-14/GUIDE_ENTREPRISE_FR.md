# Guide de Déploiement pour l'Entreprise

## Prérequis

- Serveur avec Node.js 16+ installé
- MySQL 8.0+ installé et en cours d'exécution
- Accès administrateur à la base de données
- Port 3000 (ou celui configuré) accessible

## 1. Configuration de la Base de Données

1. Connectez-vous au serveur MySQL avec un utilisateur disposant des privilèges d'administration :
   ```bash
   mysql -u root -p
   ```

2. Exécutez le script de configuration de la base de données :
   ```bash
   mysql -u root -p < database/Eb_SimWeb_setup.sql
   ```

3. Vérifiez que la base de données a été créée correctement :
   ```sql
   SHOW DATABASES LIKE 'Eb_SimWeb';
   USE Eb_SimWeb;
   SHOW TABLES;
   ```

## 2. Configuration de l'Environnement

1. Copiez le fichier `.env.example` vers `.env` dans le répertoire racine :
   ```bash
   cp .env.example .env
   ```

2. Modifiez le fichier `.env` avec les valeurs de votre environnement de production :
   ```env
   # Configuration de la base de données
   DB_HOST=localhost
   DB_USER=utilisateur_db
   DB_PASSWORD=mot_de_passe_securise
   DB_NAME=Eb_SimWeb
   
   # Configuration de sécurité
   JWT_SECRET=generer_une_cle_secrete_ici
   
   # Configuration CORS
   ALLOWED_ORIGINS=https://votredomaine.com,https://api.votredomaine.com
   
   # Configuration des cookies
   COOKIE_DOMAIN=.votredomaine.com
   
   # Environnement
   NODE_ENV=production
   PORT=3000
   ```

## 3. Installation des Dépendances

1. Installez les dépendances de production :
   ```bash
   npm install --production
   ```

## 4. Configuration du Serveur Web (Exemple avec Nginx)

1. Installez Nginx s'il n'est pas déjà installé :
   ```bash
   # Sur Ubuntu/Debian
   sudo apt update
   sudo apt install nginx
   ```

2. Créez un fichier de configuration pour votre application :
   ```bash
   sudo nano /etc/nginx/sites-available/eb-simweb
   ```

3. Configurez Nginx en tant que proxy inverse :
   ```nginx
   server {
       listen 80;
       server_name votre-domaine.com www.votre-domaine.com;
       
       # Redirection vers HTTPS
       return 301 https://$host$request_uri;
   }
   
   server {
       listen 443 ssl http2;
       server_name votre-domaine.com www.votre-domaine.com;
       
       # Configuration SSL (obtenez des certificats avec Let's Encrypt)
       ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;
       
       # Configuration de sécurité SSL
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384';
       ssl_prefer_server_ciphers on;
       ssl_session_cache shared:SSL:10m;
       
       # Configuration du proxy inverse
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
       
       # Configuration de sécurité supplémentaire
       add_header X-Frame-Options "SAMEORIGIN";
       add_header X-XSS-Protection "1; mode=block";
       add_header X-Content-Type-Options "nosniff";
       add_header Referrer-Policy "strict-origin-when-cross-origin";
       
       # Configuration du cache pour les fichiers statiques
       location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
           expires 30d;
           add_header Cache-Control "public, no-transform";
       }
   }
   ```

4. Activez le site et rechargez Nginx :
   ```bash
   sudo ln -s /etc/nginx/sites-available/eb-simweb /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## 5. Configuration de PM2 (Gestionnaire de Processus)

1. Installez PM2 globalement :
   ```bash
   sudo npm install -g pm2
   ```

2. Démarrez l'application avec PM2 :
   ```bash
   NODE_ENV=production pm2 start server.js --name "eb-simweb"
   ```

3. Configurez PM2 pour qu'il démarre automatiquement :
   ```bash
   pm2 startup
   pm2 save
   ```

## 6. Configuration du Pare-feu

```bash
# Installer UFW s'il n'est pas installé
sudo apt install ufw

# Autoriser SSH, HTTP et HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'

# Activer le pare-feu
sudo ufw enable
```

## 7. Surveillance et Maintenance

1. Vérifiez l'état de l'application :
   ```bash
   pm2 status
   ```

2. Consultez les journaux :
   ```bash
   pm2 logs eb-simweb
   ```

3. Configurez des sauvegardes de la base de données (exemple avec crontab) :
   ```bash
   # Éditer le crontab
   crontab -e
   
   # Ajouter cette ligne pour effectuer une sauvegarde quotidienne à 2h du matin
   0 2 * * * /usr/bin/mysqldump -u root -p'votre_mot_de_passe' Eb_SimWeb > /chemin/backups/eb_simweb_$(date +\%Y\%m\%d).sql
   ```

## 8. Mises à Jour

Pour mettre à jour l'application en production :

```bash
# Arrêter l'application
pm2 stop eb-simweb

# Récupérer les dernières modifications
git pull origin main

# Installer les nouvelles dépendances (si nécessaire)
npm install --production

# Exécuter les migrations (si nécessaire)
# node scripts/run-migrations.js

# Redémarrer l'application
NODE_ENV=production pm2 restart eb-simweb --update-env
```

## 9. Sécurité Supplémentaire

1. **Configuration des Certificats SSL** :
   ```bash
   # Installer Certbot pour Let's Encrypt
   sudo apt install certbot python3-certbot-nginx
   
   # Obtenir un certificat SSL
   sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
   
   # Renouvellement automatique des certificats
   sudo certbot renew --dry-run
   ```

2. **Protection contre les attaques par force brute** :
   ```bash
   # Installer fail2ban
   sudo apt install fail2ban
   
   # Créer une configuration personnalisée pour Nginx
   sudo nano /etc/fail2ban/jail.d/nginx-http-auth.conf
   ```
   
   Ajoutez la configuration suivante :
   ```
   [nginx-http-auth]
   enabled = true
   filter = nginx-http-auth
   port    = http,https
   logpath = /var/log/nginx/error.log
   maxretry = 3
   bantime = 3600
   findtime = 600
   ```

## 10. Surveillance des Performances

1. **Installer des outils de surveillance** :
   ```bash
   # Installer PM2 monit
   pm2 install pm2-server-monit
   
   # Installer la rotation des journaux PM2
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 10M
   pm2 set pm2-logrotate:retain 7
   ```

2. **Configurer des alertes (optionnel)** :
   ```bash
   # Installer le module d'alertes PM2
   pm2 install pm2-slack
   
   # Configurer le webhook Slack
   pm2 set pm2-slack:slack_url https://hooks.slack.com/services/...
   pm2 set pm2-slack:start true
   pm2 set pm2-slack:stop true
   pm2 set pm2-slack:restart true
   ```

## 11. Tests de Charge (Optionnel)

Pour vous assurer que l'application peut gérer la charge attendue :

```bash
# Installer Artillery pour les tests de charge
npm install -g artillery

# Exécuter un test de charge de base
artillery quick --count 50 -n 20 http://localhost:3000/api/health
```

## 12. Documentation de l'API

La documentation de l'API est disponible à l'adresse :
- `http://votre-domaine.com/api-docs` (si vous utilisez Swagger/OpenAPI)
- Ou dans le fichier `API_DOCUMENTATION.md`

## Support

Pour tout problème ou question, contactez l'équipe de développement ou ouvrez un ticket dans le dépôt.

---

**Dernière mise à jour :** Octobre 2023
