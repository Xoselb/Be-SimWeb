# Be-SimWeb Organización del Proyecto

## 📁 Estructura de Carpetas

### 📄 Páginas Principales (Raíz)
- `index.html` - Página principal del sitio
- `home.html` - Página de inicio alternativa

### 📁 pages/
Todas las páginas HTML organizadas por funcionalidad:

#### 📁 pages/auth/
- `login.html` - Formulario de inicio de sesión
- `register.html` - Formulario de registro
- `forgot-password.html` - Recuperación de contraseña
- `test-auth.html` - Página de pruebas de autenticación

#### 📁 pages/booking/
- `citas.html` - Sistema de citas/reservas
- `bar-detente.html` - Página del bar de descanso
- `atelier-vinyle.html` - Taller de vinilos
- `simulateurs.html` - Información de simuladores
- `materiel-simulation.html` - Equipamiento de simulación

#### 📁 pages/competitions/
- `competitions.html` - Lista de competiciones
- `C1.html` - Competición C1
- `CircuitsLegendaries.html` - Circuitos legendarios
- `FunCup.html` - Competición Fun Cup
- `GT3SPRINT.html` - Competición GT3 Sprint
- `Porsche718.html` - Competición Porsche 718
- `track-days.html` - Días de pista

#### 📁 pages/shop/
- `cart.html` - Carrito de compras
- `checkout.html` - Proceso de pago
- `order-confirmation.html` - Confirmación de pedido
- `merch.html` - Tienda de merchandising
- `merch copy.html` - Copia de seguridad de merch

#### 📁 pages/user/
- `perfil.html` - Perfil de usuario
- `mes-reservations.html` - Mis reservas
- `confirmacion.html` - Página de confirmación

#### 📁 pages/info/
- `contacto.html` - Página de contacto
- `nous.html` - Sobre nosotros
- `galerie.html` - Galería de imágenes

### 📁 css/
Archivos CSS organizados por sección:

#### 📁 css/competitions/
- `CircuitsLegendaries.css` - Estilos para circuitos legendarios
- `GT3SPRINT.css` - Estilos para GT3 Sprint

#### 📁 css/shop/
- `cart.css` - Estilos del carrito
- `checkout.css` - Estilos del proceso de pago
- `merch.css` - Estilos de la tienda

#### 📁 css/user/
- `perfil.css` - Estilos del perfil

#### 📁 css/booking/
- `booking.css` - Estilos de reservas
- `booking-system.css` - Sistema de reservas
- `advancedBooking.css` - Reservas avanzadas

#### 📁 css/info/
- `galerie.css` - Estilos de galería

#### 📁 css/ (raíz)
- `styles.css` - Estilos principales del sitio
- `Membres/` - Estilos para membresías
- `TrackDays/` - Estilos para días de pista

### 📁 js/
Archivos JavaScript organizados por funcionalidad:

#### 📁 js/auth/
- `auth.js` - Sistema de autenticación
- `registro.js` - Proceso de registro

#### 📁 js/shop/
- `cart.js` - Funcionalidad del carrito
- `paymentService.js` - Servicio de pagos
- `products.js` - Gestión de productos

#### 📁 js/user/
- `perfil.js` - Gestión del perfil
- `reservations.js` - Gestión de reservas del usuario

#### 📁 js/booking/
- `citas.js` - Sistema de citas
- `bookingManager.js` - Gestor de reservas
- `advancedBookingSystem.js` - Sistema avanzado de reservas

#### 📁 js/info/
- `contacto.js` - Formulario de contacto

#### 📁 js/ (raíz)
- `index.js` - Funcionalidades principales
- `header.js` - Gestión del encabezado
- `hero-slider.js` - Slider principal
- `security.js` - Funcionalidades de seguridad
- `services/` - Servicios adicionales
- `utils/` - Utilidades

### 📁 config/
Archivos de configuración:
- `config.js` - Configuración principal
- `server-config.js` - Configuración del servidor
- `simple-server.js` - Servidor simple
- `index.js` - Punto de entrada
- `.env.example` - Variables de entorno ejemplo
- `nginx/` - Configuración de nginx
- `jest/` - Configuración de pruebas

### 📁 scripts/
Scripts de mantenimiento:
- `update_navigation.sh` - Actualización de navegación
- `update_navigation_mac.sh` - Versión macOS
- `utilities/` - Scripts de utilidad

### 📁 src/
Código fuente de la aplicación:
- `app.js` - Aplicación principal
- `controllers/` - Controladores
- `server/` - Configuración del servidor
- `views/` - Vistas de la aplicación

### 📁 assets/
Recursos estáticos del sitio

### 📁 img/
Imágenes organizadas por categorías

### 📁 database/
Archivos de base de datos

### 📁 backups/
Copias de seguridad

## 🔄 Mantenimiento

### Para mantener esta organización:
1. Siempre crear nuevas páginas en la carpeta `pages/` correspondiente
2. Los CSS deben ir en `css/` en la subcarpeta apropiada
3. Los JavaScript deben ir en `js/` en la subcarpeta apropiada
4. Los scripts de mantenimiento van en `scripts/utilities/`
5. La configuración va en `config/`

### Actualización de rutas:
Después de mover archivos, actualiza las rutas en:
- Enlaces HTML
- Imports CSS/JS
- Rutas del servidor

## 📝 Notas
- Esta estructura ayuda a mantener el código organizado y escalable
- Facilita la navegación y mantenimiento del proyecto
- Sigue buenas prácticas de desarrollo web
