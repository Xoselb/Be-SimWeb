# Guía de Despliegue para la Empresa

## Requisitos Previos

- Servidor con Node.js 16+ instalado
- MySQL 8.0+ instalado y en ejecución
- Acceso de administrador a la base de datos
- Puerto 3000 (o el configurado) accesible

## 1. Configuración de la Base de Datos

1. Conéctate al servidor MySQL con un usuario con privilegios de administrador:
   ```bash
   mysql -u root -p
   ```

2. Ejecuta el script de configuración de la base de datos:
   ```bash
   mysql -u root -p < database/Eb_SimWeb_setup.sql
   ```

3. Verifica que la base de datos se ha creado correctamente:
   ```sql
   SHOW DATABASES LIKE 'Eb_SimWeb';
   USE Eb_SimWeb;
   SHOW TABLES;
   ```

## 2. Configuración del Entorno

1. Copia el archivo `.env.example` a `.env` en el directorio raíz:
   ```bash
   cp .env.example .env
   ```

2. Edita el archivo `.env` con los valores de tu entorno de producción:
   ```env
   # Configuración de la base de datos
   DB_HOST=localhost
   DB_USER=usuario_db
   DB_PASSWORD=contraseña_segura
   DB_NAME=Eb_SimWeb
   
   # Configuración de seguridad
   JWT_SECRET=genera_un_secreto_seguro_aqui
   
   # Configuración de CORS
   ALLOWED_ORIGINS=https://tudominio.com,https://api.tudominio.com
   
   # Configuración de cookies
   COOKIE_DOMAIN=.tudominio.com
   
   # Entorno
   NODE_ENV=production
   PORT=3000
   ```

## 3. Instalación de Dependencias

1. Instala las dependencias de producción:
   ```bash
   npm install --production
   ```

## 4. Configuración del Servidor Web (Nginx como ejemplo)

1. Instala Nginx si no está instalado:
   ```bash
   # En Ubuntu/Debian
   sudo apt update
   sudo apt install nginx
   ```

2. Crea un archivo de configuración para tu aplicación:
   ```bash
   sudo nano /etc/nginx/sites-available/eb-simweb
   ```

3. Configura Nginx como proxy inverso:
   ```nginx
   server {
       listen 80;
       server_name tu-dominio.com www.tu-dominio.com;
       
       # Redirigir a HTTPS
       return 301 https://$host$request_uri;
   }
   
   server {
       listen 443 ssl http2;
       server_name tu-dominio.com www.tu-dominio.com;
       
       # Configuración SSL (obtén certificados con Let's Encrypt)
       ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;
       
       # Configuración de seguridad SSL
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384';
       ssl_prefer_server_ciphers on;
       ssl_session_cache shared:SSL:10m;
       
       # Configuración del proxy inverso
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
       
       # Configuración de seguridad adicional
       add_header X-Frame-Options "SAMEORIGIN";
       add_header X-XSS-Protection "1; mode=block";
       add_header X-Content-Type-Options "nosniff";
       add_header Referrer-Policy "strict-origin-when-cross-origin";
       
       # Configuración de caché para archivos estáticos
       location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
           expires 30d;
           add_header Cache-Control "public, no-transform";
       }
   }
   ```

4. Habilita el sitio y recarga Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/eb-simweb /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## 5. Configuración de PM2 (Gestor de Procesos)

1. Instala PM2 globalmente:
   ```bash
   sudo npm install -g pm2
   ```

2. Inicia la aplicación con PM2:
   ```bash
   NODE_ENV=production pm2 start server.js --name "eb-simweb"
   ```

3. Configura PM2 para que se inicie automáticamente:
   ```bash
   pm2 startup
   pm2 save
   ```

## 6. Configuración de Firewall

```bash
# Instalar UFW si no está instalado
sudo apt install ufw

# Permitir SSH, HTTP y HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'

# Habilitar el firewall
sudo ufw enable
```

## 7. Monitoreo y Mantenimiento

1. Verifica el estado de la aplicación:
   ```bash
   pm2 status
   ```

2. Verifica los logs:
   ```bash
   pm2 logs eb-simweb
   ```

3. Configura copias de seguridad de la base de datos (ejemplo con crontab):
   ```bash
   # Editar el crontab
   crontab -e
   
   # Añadir esta línea para hacer backup diario a las 2 AM
   0 2 * * * /usr/bin/mysqldump -u root -p'tu_contraseña' Eb_SimWeb > /ruta/backups/eb_simweb_$(date +\%Y\%m\%d).sql
   ```

## 8. Actualizaciones

Para actualizar la aplicación en producción:

```bash
# Detener la aplicación
pm2 stop eb-simweb

# Obtener los últimos cambios
git pull origin main

# Instalar nuevas dependencias (si las hay)
npm install --production

# Ejecutar migraciones (si es necesario)
# node scripts/run-migrations.js

# Reiniciar la aplicación
NODE_ENV=production pm2 restart eb-simweb --update-env
```
## 9. Seguridad Adicional

1. **Configuración de Certificados SSL**:
   ```bash
   # Instalar Certbot para Let's Encrypt
   sudo apt install certbot python3-certbot-nginx
   
   # Obtener certificado SSL
   sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
   
   # Renovar automáticamente los certificados
   sudo certbot renew --dry-run
   ```

2. **Protección contra ataques de fuerza bruta**:
   ```bash
   # Instalar fail2ban
   sudo apt install fail2ban
   
   # Crear configuración personalizada para Nginx
   sudo nano /etc/fail2ban/jail.d/nginx-http-auth.conf
   ```
   
   Añade la siguiente configuración:
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

## 10. Monitoreo del Rendimiento

1. **Instalar herramientas de monitoreo**:
   ```bash
   # Instalar PM2 monit
   pm2 install pm2-server-monit
   
   # Instalar PM2 logs
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 10M
   pm2 set pm2-logrotate:retain 7
   ```

2. **Configurar alertas (opcional)**:
   ```bash
   # Instalar el módulo de alertas de PM2
   pm2 install pm2-slack
   
   # Configurar webhook de Slack
   pm2 set pm2-slack:slack_url https://hooks.slack.com/services/...
   pm2 set pm2-slack:start true
   pm2 set pm2-slack:stop true
   pm2 set pm2-slack:restart true
   ```

## 11. Pruebas de Carga (Opcional)

Para asegurar que la aplicación pueda manejar la carga esperada:

```bash
# Instalar Artillery para pruebas de carga
npm install -g artillery

# Ejecutar prueba de carga básica
artillery quick --count 50 -n 20 http://localhost:3000/api/health
```

## 12. Documentación de la API

La documentación de la API está disponible en:
- `http://tu-dominio.com/api-docs` (si usas Swagger/OpenAPI)
- O en el archivo `API_DOCUMENTATION.md`

## Soporte

Para problemas o preguntas, contacta al equipo de desarrollo o abre un issue en el repositorio.

---

**Última actualización:** Octubre 2023
