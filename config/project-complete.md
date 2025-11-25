# PROYECTO COMPLETO - www.ebracingevents.com

## 📋 TABLA DE CONTENIDOS
1. [Visión General del Proyecto](#visión-general)
2. [Requisitos del Servidor](#requisitos-del-servidor)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Funcionalidades del Sistema](#funcionalidades-del-sistema)
5. [API Endpoints](#api-endpoints)
6. [Pasarelas de Pago](#pasarelas-de-pago)
7. [Configuración de Despliegue](#configuración-de-despliegue)
8. [Plan de Implementación](#plan-de-implementación)
9. [Costos Estimados](#costos-estimados)
10. [Checklist de Despliegue](#checklist-de-despliegue)

---

## 🎯 VISIÓN GENERAL

### Objetivo Principal
Transformar www.ebracingevents.com en una plataforma e-commerce integral para EB Simracing que permita:
- Registro y gestión de usuarios
- Venta de merchandise online
- Sistema de reservas para simuladores
- Procesamiento de pagos múltiples métodos
- Comunicación automatizada por email

### Público Objetivo
- Entusiastas del simracing
- Clientes de eventos de simulación
- Compradores de merchandise oficial
- Usuarios en Bélgica y Europa

---

## 🖥️ REQUISITOS DEL SERVIDOR

### Especificaciones Recomendadas
```
CPU: 4 vCores
RAM: 8 GB
Almacenamiento: 100 GB SSD
Ancho de banda: 3-5 TB/mes
Sistema Operativo: Ubuntu 22.04 LTS
```

### Proveedores Recomendados
- **DigitalOcean**: $60-80/mes (4GB RAM, 2 vCPUs, 80GB SSD)
- **Vultr**: $60-80/mes (4GB RAM, 2 vCPUs, 80GB SSD)  
- **AWS EC2**: $70-90/mes (t3.large, 8GB RAM, 2 vCPUs)

### Software Requerido
- **Nginx** (servidor web)
- **Node.js** (backend API)
- **PostgreSQL** (base de datos principal)
- **Redis** (cache y sesiones)
- **PM2** (gestión de procesos)
- **Certbot** (SSL certificates)
- **Fail2ban** (seguridad)

---

## 🛠️ STACK TECNOLÓGICO

### Backend
- **Node.js + Express.js**
  - JavaScript en frontend y backend
  - Ecosistema npm maduro
  - Alto rendimiento
  - Escalabilidad horizontal

### Base de Datos
- **PostgreSQL** (principal)
  - Robusto y escalable
  - Soporte JSON nativo
  - Transacciones ACID
  - Buen rendimiento

- **Redis** (cache)
  - Sesiones de usuario
  - Cache de consultas
  - Colas de jobs
  - Alto rendimiento

### Frontend
- **HTML5/CSS3/JavaScript**
- **Bootstrap/Tailwind CSS** (framework)
- **Font Awesome** (iconos)
- **jQuery** (DOM manipulation)

### Servicios Externos
- **PayPal** (pagos - fase 1)
- **Mollie** (Bancontact - fase 2)
- **Stripe** (Visa/Mastercard - fase 3)
- **SendGrid** (emails transaccionales)
- **AWS S3** (almacenamiento de imágenes)

---

## ⚙️ FUNCIONALIDADES DEL SISTEMA

### 👤 Sistema de Usuarios
- **Registro de usuarios**
  - Formulario con validación
  - Verificación por email
  - Perfil personalizable
  - Avatar y preferencias

- **Autenticación**
  - Login seguro con JWT
  - Recuperación de contraseña
  - Sesiones persistentes
  - OAuth opcional (Google, Facebook)

- **Gestión de Perfil**
  - Editar información personal
  - Historial de compras
  - Historial de reservas
  - Configuración de notificaciones

### 🛒 Sistema de E-commerce
- **Catálogo de Productos**
  - Gestión de inventario
  - Categorías y subcategorías
  - Búsqueda y filtrado
  - Productos destacados

- **Carrito de Compras**
  - Añadir/eliminar productos
  - Actualizar cantidades
  - Calcular totales
  - Persistencia de carrito

- **Proceso de Pago**
  - Múltiples métodos de pago
  - Procesamiento seguro
  - Confirmación instantánea
  - Gestión de errores

- **Gestión de Pedidos**
  - Historial completo
  - Seguimiento de envío
  - Estados del pedido
  - Facturación automática

### 📅 Sistema de Reservas
- **Calendario de Disponibilidad**
  - Vista mensual/semanal
  - Slots de tiempo disponibles
  - Tipos de reservas
  - Precios dinámicos

- **Proceso de Reserva**
  - Selección de fecha/hora
  - Confirmación inmediata
  - Pagos integrados
  - Recordatorios automáticos

- **Gestión de Reservas**
  - Historial de reservas
  - Cancelaciones
  - Reprogramaciones
  - Notificaciones

### 📧 Sistema de Notificaciones
- **Emails Automáticos**
  - Bienvenida y verificación
  - Confirmación de pedidos
  - Confirmación de reservas
  - Actualizaciones de estado

- **Notificaciones Push** (opcional)
  - Nuevos productos
  - Ofertas especiales
  - Recordatorios

### 🔧 Panel de Administración
- **Gestión de Productos**
  - CRUD de productos
  - Gestión de inventario
  - Categorías
  - Precios

- **Gestión de Pedidos**
  - Ver todos los pedidos
  - Actualizar estados
  - Gestión de envíos
  - Reembolsos

- **Gestión de Usuarios**
  - Ver usuarios registrados
  - Historial de actividad
  - Soporte al cliente
  - Bloqueo de usuarios

---

## 🔌 API ENDPOINTS

### Autenticación (/api/auth)
```
POST /api/auth/register     - Registro de usuario
POST /api/auth/login        - Login de usuario
POST /api/auth/logout       - Logout
POST /api/auth/forgot-password - Recuperar contraseña
POST /api/auth/verify-email - Verificación email
```

### Usuarios (/api/users)
```
GET  /api/users/profile     - Obtener perfil
PUT  /api/users/profile     - Actualizar perfil
GET  /api/users/orders      - Historial de pedidos
GET  /api/users/reservations - Historial de reservas
```

### Productos (/api/products)
```
GET  /api/products          - Listar productos
GET  /api/products/:id      - Detalles producto
GET  /api/products/categories - Categorías
GET  /api/products/search   - Búsqueda
```

### Carrito (/api/cart)
```
GET  /api/cart              - Obtener carrito
POST /api/cart/add          - Añadir producto
PUT  /api/cart/update       - Actualizar cantidad
DELETE /api/cart/remove     - Eliminar producto
POST /api/cart/checkout     - Procesar pago
```

### Pedidos (/api/orders)
```
POST /api/orders            - Crear pedido
GET  /api/orders/:id        - Ver pedido
GET  /api/orders/history    - Historial
PUT  /api/orders/:id/status - Actualizar estado
```

### Reservas (/api/reservations)
```
GET  /api/reservations/availability - Ver disponibilidad
POST /api/reservations      - Crear reserva
GET  /api/reservations/:id  - Ver reserva
PUT  /api/reservations/:id  - Actualizar reserva
DELETE /api/reservations/:id - Cancelar reserva
```

---

## 💳 PASARELAS DE PAGO

### 🥇 Fase 1: PayPal (Prioridad Principal)
- **Implementación**: 1 semana
- **Costo**: 2.9% + €0.35 por transacción
- **Ventajas**: 
  - Setup rápido
  - Reconocimiento global
  - Sin necesidad de tarjeta
  - Protección comprador/vendedor

### 🥈 Fase 2: Bancontact (Mercado Belga)
- **Implementación**: 1 semana (via Mollie)
- **Costo**: ~1.4% por transacción
- **Ventajas**:
  - Principal método en Bélgica
  - Transferencia bancaria directa
  - Confirmación inmediata
  - Bajas comisiones

### 🥉 Fase 3: Visa/Mastercard (Cobertura Global)
- **Implementación**: 1 semana (via Stripe)
- **Costo**: 1.4% + €0.25 (Europa)
- **Ventajas**:
  - Aceptación universal
  - Procesamiento rápido
  - Protección contra fraudes
  - 3D Secure

### Comparación de Costos (Pedido €100)
| Método | Costo | Porcentaje |
|--------|-------|------------|
| PayPal | €3.25 | 3.25% |
| Bancontact | €1.40 | 1.4% |
| Visa/Mastercard | €1.65 | 1.65% |

---

## 🚀 CONFIGURACIÓN DE DESPLIEGUE

### Configuración Nginx
```nginx
server {
    listen 80;
    server_name www.ebracingevents.com ebracingevents.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.ebracingevents.com ebracingevents.com;
    
    root /var/www/ebracingevents.com;
    index index.html;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/ebracingevents.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ebracingevents.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Static files
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Variables de Entorno
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ebracingevents
REDIS_URL=redis://localhost:6379

# PayPal
PAYPAL_CLIENT_ID_SANDBOX=xxx
PAYPAL_CLIENT_SECRET_SANDBOX=xxx
PAYPAL_CLIENT_ID=yyy
PAYPAL_CLIENT_SECRET=yyy

# Mollie (Bancontact)
MOLLIE_API_KEY=test_xxx
MOLLIE_API_KEY_LIVE=live_yyy

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# SendGrid
SENDGRID_API_KEY=SG.xxxxx

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

---

## 📅 PLAN DE IMPLEMENTACIÓN

### Fase 1: Base (2-3 semanas)
- [ ] Configuración del servidor
- [ ] Base de datos y API básica
- [ ] Sistema de usuarios
- [ ] Catálogo de productos

### Fase 2: E-commerce (2-3 semanas)
- [ ] Carrito de compras
- [ ] **Integración PayPal (prioridad principal)**
- [ ] Gestión de pedidos
- [ ] Sistema de emails

### Fase 2.5: Pagos Adicionales (1-2 semanas)
- [ ] **Integración Bancontact (mercado belga)**
- [ ] **Integración Visa/Mastercard (Stripe)**

### Fase 3: Reservas (1-2 semanas)
- [ ] Calendario de disponibilidad
- [ ] Sistema de reservas
- [ ] Notificaciones automáticas

### Fase 4: Optimización (1 semana)
- [ ] Performance y cache
- [ ] Testing y seguridad
- [ ] Documentación

**Duración Total**: 6-9 semanas

---

## 💰 COSTOS ESTIMADOS

### Costos Mensuales (Operación)
- **Servidor**: $60-90/mes
- **Dominio**: $1/mes (promedio)
- **SSL**: Gratis (Let's Encrypt)
- **Servicios**: $20-50/mes
  - SendGrid: $15-25/mes
  - Stripe/Mollie: Sin costo mensual
  - AWS S3: $5-10/mes
- **Backup**: $5-10/mes
- **Monitoreo**: $10/mes

**Total Mensual**: $91-161/mes

### Costos de Desarrollo (Único)
- **Backend API**: $1,500-2,000
- **Frontend**: $800-1,200
- **Integración Pagos**: $800-1,200
- **Panel Admin**: $500-800
- **Testing**: $300-500

**Total Desarrollo**: $3,900-5,700

### Costos de Transacción
- **PayPal**: 2.9% + €0.35
- **Bancontact**: ~1.4%
- **Stripe**: 1.4% + €0.25

---

## ✅ CHECKLIST DE DESPLIEGUE

### Antes de Comprar Servidor
- [ ] Revisar requisitos técnicos
- [ ] Elegir proveedor de hosting
- [ ] Verificar presupuesto
- [ ] Confirmar acceso al dominio

### Configuración Inicial del Servidor
- [ ] Crear servidor Ubuntu 22.04 LTS
- [ ] Configurar SSH con claves
- [ ] Crear usuario no-root
- [ ] Actualizar sistema
- [ ] Configurar firewall

### Instalación de Software
- [ ] Instalar Nginx
- [ ] Instalar Node.js 18+
- [ ] Instalar PostgreSQL
- [ ] Instalar Redis
- [ ] Instalar PM2
- [ ] Instalar Certbot

### Configuración del Sitio
- [ ] Subir archivos del proyecto
- [ ] Configurar Nginx
- [ ] Configurar SSL
- [ ] Configurar base de datos
- [ ] Configurar variables de entorno

### Configuración de Pagos
- [ ] Crear cuenta PayPal Developer
- [ ] Crear cuenta Mollie
- [ ] Crear cuenta Stripe
- [ ] Configurar webhooks
- [ ] Testing en sandbox

### Configuración de Emails
- [ ] Crear cuenta SendGrid
- [ ] Configurar templates
- [ ] Probar envío
- [ ] Configurar dominio

### Testing Final
- [ ] Probar todas las funcionalidades
- [ ] Procesar pagos de prueba
- [ ] Verificar SSL
- [ ] Test de rendimiento
- [ ] Test de seguridad

### Post-Lanzamiento
- [ ] Configurar Google Analytics
- [ ] Configurar Search Console
- [ ] Enviar sitemap
- [ ] Configurar backups
- [ ] Documentar mantenimiento

---

## 📞 CONTACTO DE SOPORTE

### Para Consultas Técnicas
- **Email**: soporte@ebracingevents.com
- **Teléfono**: +32 XXX XXX XXX
- **Horario**: Lunes-Viernes 9:00-18:00 CET

### Para Urgencias
- **Email**: urgent@ebracingevents.com
- **Teléfono**: +32 XXX XXX XXX (24/7)

---

## 📄 NOTAS LEGALES

### GDPR Compliance
- Consentimiento explícito para datos
- Derecho al olvido
- Portabilidad de datos
- Políticas de privacidad claras

### PCI DSS
- PayPal: Nivel 1 (manejado por PayPal)
- Mollie: Nivel 1 (manejado por Mollie)
- Stripe: Nivel 1 (manejado por Stripe)

### Protección Consumidor
- Política de devolución 14 días
- Términos y condiciones claros
- Procedimiento de disputas
- Conformidad con ley europea

---

*Última actualización: Noviembre 2024*
*Versión: 1.0*
