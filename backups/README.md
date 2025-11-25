# Backups - EB Simracing

## Estructura de Backups

Este directorio contendrá backups automáticos del proyecto organizados por fecha.

## 📁 Estructura de Carpetas

```
backups/
├── YYYY-MM-DD/                 # Backup diario
│   ├── database/              # Backup de base de datos
│   ├── files/                 # Backup de archivos estáticos
│   ├── config/                # Backup de configuraciones
│   └── logs/                  # Logs del backup
└── weekly/                    # Backups semanales (retención 4 semanas)
    ├── YYYY-MM-DD/
    └── ...
```

## 🔄 Frecuencia de Backups

### Diarios
- **Base de datos**: PostgreSQL dump completo
- **Archivos**: Imágenes, documentos, uploads
- **Configuración**: Nginx, variables de entorno
- **Retención**: 7 días

### Semanales  
- **Backup completo**: Todo el proyecto
- **Retención**: 4 semanas

### Mensuales
- **Backup estratégico**: Configuraciones críticas
- **Retención**: 12 meses

## 📋 Contenido de cada Backup

### Database/
```
database/
├── ebracingevents_YYYY-MM-DD.sql
├── ebracingevents_structure.sql
└── ebracingevents_data.sql
```

### Files/
```
files/
├── public/img/
├── uploads/
├── user-avatars/
└── product-images/
```

### Config/
```
config/
├── nginx/
│   └── ebracingevents.com.conf
├── .env.production
├── pm2.config.js
└── ssl-certificates/
```

## 🛠️ Scripts de Backup

### Backup Diario (cron)
```bash
#!/bin/bash
# backup-daily.sh
DATE=$(date +%Y-%m-%d)
BACKUP_DIR="/var/www/ebracingevents.com/backups/$DATE"

mkdir -p $BACKUP_DIR/{database,files,config,logs}

# Backup base de datos
pg_dump ebracingevents > $BACKUP_DIR/database/ebracingevents_$DATE.sql

# Backup archivos
rsync -av /var/www/ebracingevents.com/public/img/ $BACKUP_DIR/files/img/
rsync -av /var/www/ebracingevents.com/uploads/ $BACKUP_DIR/files/uploads/

# Backup configuración
cp /etc/nginx/sites-available/ebracingevents.com.conf $BACKUP_DIR/config/
cp /var/www/ebracingevents.com/.env.production $BACKUP_DIR/config/

# Logs
echo "Backup completed: $DATE" > $BACKUP_DIR/logs/backup.log
```

### Backup Semanal
```bash
#!/bin/bash
# backup-weekly.sh
DATE=$(date +%Y-%m-%d)
WEEKLY_DIR="/var/www/ebracingevents.com/backups/weekly/$DATE"

mkdir -p $WEEKLY_DIR
tar -czf $WEEKLY_DIR/full-backup_$DATE.tar.gz /var/www/ebracingevents.com/

# Limpiar backups semanales antiguos (mantener 4)
find /var/www/ebracingevents.com/backups/weekly/ -type d -mtime +28 -exec rm -rf {} \;
```

## 🔄 Proceso de Restauración

### Restaurar Base de Datos
```bash
psql -d ebracingevents -f backup/database/ebracingevents_YYYY-MM-DD.sql
```

### Restaurar Archivos
```bash
rsync -av backup/files/ /var/www/ebracingevents.com/
```

### Restaurar Configuración
```bash
cp backup/config/ebracingevents.com.conf /etc/nginx/sites-available/
cp backup/config/.env.production /var/www/ebracingevents.com/
systemctl reload nginx
```

## 📊 Monitoreo de Backups

### Scripts de Verificación
```bash
#!/bin/bash
# verify-backups.sh
BACKUP_DIR="/var/www/ebracingevents.com/backups"

# Verificar backup diario de hoy
if [ -d "$BACKUP_DIR/$(date +%Y-%m-%d)" ]; then
    echo "✅ Backup diario completado"
else
    echo "❌ Backup diario fallido"
    # Enviar alerta
fi

# Verificar tamaño de archivos
find $BACKUP_DIR -name "*.sql" -size +1M
find $BACKUP_DIR -name "*.tar.gz" -size +10M
```

## 🔐 Seguridad de Backups

### Encriptación (Opcional)
```bash
# Encriptar backup sensible
gpg --symmetric --cipher-algo AES256 backup/database/ebracingevents_YYYY-MM-DD.sql
```

### Almacenamiento Externo
- **AWS S3**: Para backups críticos
- **Google Drive**: Para acceso rápido
- **Servidor externo**: Para disaster recovery

## 📞 Contacto de Emergencia

En caso de fallo del backup:
1. **No entrar en pánico**
2. **Verificar logs** en `logs/backup.log`
3. **Contactar administrador**: +32 XXX XXX XXX
4. **Documentar incidente** para mejora continua

## 📈 Estadísticas

### Métricas a Monitorear
- Tamaño de backups
- Tiempo de ejecución
- Éxito/Fallo rate
- Espacio utilizado

### Reporte Mensual
```bash
# generate-report.sh
echo "=== Reporte Mensual de Backups ==="
echo "Backups exitosos: $(grep -c "completed" logs/*.log)"
echo "Backups fallidos: $(grep -c "failed" logs/*.log)"
echo "Espacio utilizado: $(du -sh . | cut -f1)"
echo "Último backup: $(ls -t | head -1)"
```

---

*Configuración creada: Noviembre 2024*
*Próxima revisión: Diciembre 2024*
