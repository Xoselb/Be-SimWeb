# Base de Datos - EB Racing Website

## 🚀 Configuración Rápida

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
```bash
cp .env.example .env
```

Edita `.env` con tu configuración:
```env
# Base de Datos
DB_TYPE=mongodb  # mongodb, postgresql, mysql
MONGODB_URI=mongodb://localhost:27017/eb_racing

# JWT
JWT_SECRET=your-super-secret-jwt-key
```

### 3. Configurar Base de Datos

#### MongoDB (Recomendado)
```bash
# Instalar MongoDB
# Windows: Descargar desde https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community
# Ubuntu: sudo apt install mongodb

# Iniciar MongoDB
mongod
```

#### PostgreSQL
```bash
# Instalar PostgreSQL
# Windows: Descargar desde https://www.postgresql.org/download/
# macOS: brew install postgresql
# Ubuntu: sudo apt install postgresql postgresql-contrib

# Crear base de datos
createdb eb_racing
```

#### MySQL
```bash
# Instalar MySQL
# Windows: Descargar desde https://dev.mysql.com/downloads/mysql/
# macOS: brew install mysql
# Ubuntu: sudo apt install mysql-server

# Crear base de datos
mysql -u root -p
CREATE DATABASE eb_racing;
```

### 4. Inicializar Base de Datos
```bash
npm run db:setup
npm run db:seed
```

### 5. Iniciar Servidor
```bash
npm run dev
```

## 📊 Estructura de la Base de Datos

### Usuarios (users)
```sql
- id (Primary Key)
- first_name (VARCHAR)
- last_name (VARCHAR)
- email (VARCHAR, UNIQUE)
- password (VARCHAR, HASHED)
- phone (VARCHAR)
- address (TEXT)
- avatar (TEXT)
- role (ENUM: user, admin)
- is_active (BOOLEAN)
- email_verified (BOOLEAN)
- last_login (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Sesiones (sessions)
```sql
- id (Primary Key)
- user_id (Foreign Key)
- token (VARCHAR, UNIQUE)
- expires_at (TIMESTAMP)
- is_active (BOOLEAN)
- user_agent (TEXT)
- ip_address (INET)
- created_at (TIMESTAMP)
```

### Productos (products)
```sql
- id (Primary Key)
- name (VARCHAR)
- description (TEXT)
- price (DECIMAL)
- category (VARCHAR)
- image (TEXT)
- stock (INTEGER)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Pedidos (orders)
```sql
- id (Primary Key)
- user_id (Foreign Key)
- total_amount (DECIMAL)
- status (ENUM: pending, confirmed, shipped, delivered, cancelled)
- shipping_address (JSONB)
- payment_method (VARCHAR)
- payment_status (ENUM: pending, paid, failed, refunded)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Items de Pedido (order_items)
```sql
- id (Primary Key)
- order_id (Foreign Key)
- product_id (Foreign Key)
- quantity (INTEGER)
- price (DECIMAL)
```

### Reservas (bookings)
```sql
- id (Primary Key)
- user_id (Foreign Key)
- service (VARCHAR)
- date (DATE)
- time (VARCHAR)
- duration (INTEGER)
- status (ENUM: pending, confirmed, cancelled, completed)
- total_price (DECIMAL)
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 🔐 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil
- `PUT /api/auth/profile` - Actualizar perfil
- `PUT /api/auth/change-password` - Cambiar contraseña
- `POST /api/auth/logout` - Cerrar sesión

### Ejemplos de Uso

#### Registrar Usuario
```javascript
const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        phone: '+1234567890',
        address: '123 Main St'
    })
});
```

#### Iniciar Sesión
```javascript
const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'john@example.com',
        password: 'Password123!'
    })
});
```

#### Obtener Perfil
```javascript
const response = await fetch('/api/auth/profile', {
    method: 'GET',
    headers: { 
        'Authorization': 'Bearer TOKEN_HERE',
        'Content-Type': 'application/json'
    }
});
```

## 🔧 Migración desde localStorage

Para cambiar del sistema localStorage a base de datos:

1. **Actualizar el frontend**:
```html
<!-- Reemplazar auth.js por db-auth.js -->
<script src="/js/auth/db-auth.js"></script>
```

2. **Mantener compatibilidad**:
```javascript
// db-auth.js es compatible con auth.js existente
window.auth.handleLogin(email, password);
window.auth.isAuthenticated();
window.auth.getCurrentUser();
```

3. **Actualizar rutas**:
```javascript
// Las llamadas a API ahora van al backend
// Antes: localStorage.setItem('auth_user', JSON.stringify(user));
// Ahora: await window.auth.updateProfile(userData);
```

## 🧪 Usuarios de Prueba

### Usuario Estándar
- **Email**: test@example.com
- **Password**: Test123!

### Administrador
- **Email**: admin@ebracing.com
- **Password**: Admin123!

## 🔒 Seguridad

### Características de Seguridad
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Tokens JWT con expiración
- ✅ Sesiones con timeout configurable
- ✅ Validación de inputs
- ✅ Rate limiting
- ✅ CORS configurado
- ✅ Headers de seguridad

### Best Practices
- Usar variables de entorno para secrets
- Rotar claves JWT regularmente
- Implementar 2FA en producción
- Usar HTTPS en producción
- Validar todos los inputs del cliente
- Implementar logging de seguridad

## 📈 Monitoreo y Logs

### Logs de Aplicación
```bash
# Ver logs del servidor
npm run dev

# Logs específicos de base de datos
tail -f logs/database.log
```

### Métricas Recomendadas
- Tiempo de respuesta de API
- Tasa de errores
- Conexiones a base de datos
- Intentos de login fallidos
- Uso de memoria y CPU

## 🚀 Despliegue

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables de Producción
```env
NODE_ENV=production
DB_TYPE=mongodb
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-production-secret
PORT=3000
```

## 🔄 Backup y Restore

### MongoDB
```bash
# Backup
mongodump --db eb_racing --out backup/

# Restore
mongorestore backup/eb_racing
```

### PostgreSQL
```bash
# Backup
pg_dump eb_racing > backup.sql

# Restore
psql eb_racing < backup.sql
```

### MySQL
```bash
# Backup
mysqldump eb_racing > backup.sql

# Restore
mysql eb_racing < backup.sql
```

## 🐛 Troubleshooting

### Problemas Comunes

#### Error de Conexión a MongoDB
```bash
# Verificar que MongoDB está corriendo
mongod --version

# Verificar conexión
mongo mongodb://localhost:27017/eb_racing
```

#### Error de Autenticación
```javascript
// Verificar token
console.log(localStorage.getItem('auth_token'));

// Verificar usuario
console.log(JSON.parse(localStorage.getItem('auth_user')));
```

#### Error de CORS
```javascript
// En server.js, verificar configuración
app.use(cors({
    origin: 'http://localhost:3000',  // Tu frontend
    credentials: true
}));
```

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs del servidor
2. Verifica la configuración de `.env`
3. Asegúrate que la base de datos esté corriendo
4. Revisa las credenciales de prueba

## 🔄 Actualizaciones Futuras

Próximas características planeadas:
- [ ] Email verification
- [ ] Password reset
- [ ] 2FA (Two-Factor Authentication)
- [ ] OAuth (Google, Facebook)
- [ ] Rate limiting avanzado
- [ ] Analytics dashboard
- [ ] File upload para avatares
