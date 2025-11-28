# ESTRUCTURA DEL PROYECTO ORGANIZADA

## 📁 **NUEVA ESTRUCTURA DE CARPETAS**

```
Be-SimWeb/
├── 📄 index.html                    # Página principal
├── 📁 pages/                        # Páginas HTML organizadas
│   ├── 📁 auth/                     # Autenticación
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── forgot-password.html
│   │   └── perfil.html
│   ├── 📁 shop/                     # E-commerce
│   │   ├── cart.html
│   │   ├── checkout.html
│   │   ├── merch.html
│   │   ├── merch copy.html
│   │   └── order-confirmation.html
│   ├── 📁 simulation/               # Simuladores
│   │   ├── simulateurs.html
│   │   ├── materiel-simulation.html
│   │   ├── C1.html
│   │   ├── GT3SPRINT.html
│   │   └── Porsche718.html
│   ├── 📁 events/                   # Eventos y competencias
│   │   ├── competitions.html
│   │   ├── track-days.html
│   │   ├── FunCup.html
│   │   └── CircuitsLegendaries.html
│   └── 📁 info/                     # Información general
│       ├── contacto.html
│       ├── nous.html
│       ├── galerie.html
│       ├── bar-detente.html
│       ├── atelier-vinyle.html
│       ├── citas.html
│       ├── mes-reservations.html
│       ├── confirmacion.html
│       ├── home.html
│       └── test-auth.html
├── 📁 assets/                       # Recursos estáticos
│   ├── 📁 images/                   # Imágenes
│   │   ├── EB SIMRACING(Solo-White).png
│   │   ├── default-avatar.png
│   │   └── ads/
│   ├── 📁 styles/                   # CSS
│   │   ├── styles.css
│   │   ├── cart.css
│   │   ├── Membres/
│   │   └── ...
│   ├── 📁 scripts/                  # JavaScript
│   │   ├── security.js
│   │   ├── auth.js
│   │   ├── index.js
│   │   ├── registro.js
│   │   ├── perfil.js
│   │   ├── citas.js
│   │   ├── contacto.js
│   │   ├── cartService.js
│   │   ├── cart.js
│   │   ├── paymentService.js
│   │   ├── services/
│   │   └── update-paths.js
│   └── 📁 fonts/                    # Fuentes
├── 📁 src/                          # Código fuente del servidor
│   ├── 📁 server/
│   ├── 📁 views/
│   └── 📁 database/
├── 📁 assets/                       # Utilidades y templates
│   ├── 📁 scripts/
│   ├── 📁 templates/
│   └── 📁 utils/
├── 📁 docs/                         # Documentación
├── 📁 config/                       # Configuración
└── 📁 backups/                      # Copias de seguridad
```

## 🔄 **MAPEO DE RUTAS**

### **Rutas Antiguas → Nuevas Rutas**

| Antigua Ruta | Nueva Ruta | Categoría |
|-------------|------------|-----------|
| `login.html` | `pages/auth/login.html` | Autenticación |
| `register.html` | `pages/auth/register.html` | Autenticación |
| `perfil.html` | `pages/auth/perfil.html` | Autenticación |
| `cart.html` | `pages/shop/cart.html` | E-commerce |
| `merch.html` | `pages/shop/merch.html` | E-commerce |
| `contacto.html` | `pages/info/contacto.html` | Información |
| `galerie.html` | `pages/info/galerie.html` | Información |
| `/css/` | `/assets/styles/` | Estilos |
| `/js/` | `/assets/scripts/` | Scripts |
| `/img/` | `/assets/images/` | Imágenes |

## 🛡️ **SISTEMA DE SEGURIDAD**

### **Headers implementados en TODOS los HTML:**
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY  
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Content-Security-Policy restrictivo

### **Scripts de seguridad (base):**
- ✅ `security.js` - Sistema centralizado de seguridad
- ✅ `auth.js` - Autenticación segura

### **Scripts específicos por página:**
- ✅ `index.js` - Sistema principal de login
- ✅ `registro.js` - Registro seguro
- ✅ `perfil.js` - Gestión de perfil
- ✅ `citas.js` - Sistema de citas
- ✅ `contacto.js` - Formulario de contacto
- ✅ `cartService.js` + `cart.js` - Carrito completo

## 🔧 **CONFIGURACIÓN DEL SERVIDOR**

### **Nuevas rutas estáticas:**
```javascript
app.use('/assets/styles', express.static('assets/styles'));
app.use('/assets/scripts', express.static('assets/scripts'));
app.use('/assets/images', express.static('assets/images'));
app.use('/pages/auth', express.static('pages/auth'));
app.use('/pages/shop', express.static('pages/shop'));
// ... etc
```

### **Redirecciones de compatibilidad:**
```javascript
app.get('/login.html', (req, res) => res.redirect('/pages/auth/login.html'));
app.get('/cart.html', (req, res) => res.redirect('/pages/shop/cart.html'));
// ... etc
```

## 🚀 **BENEFICIOS DE LA NUEVA ESTRUCTURA**

### **1. Organización Lógica:**
- ✅ **Páginas agrupadas por función** (auth, shop, simulation, events, info)
- ✅ **Assets centralizados** (styles, scripts, images)
- ✅ **Separación clara** entre frontend y backend

### **2. Mantenimiento Mejorado:**
- ✅ **Fácil localización** de archivos por categoría
- ✅ **Actualización masiva** con scripts automatizados
- ✅ **Estructura escalable** para futuras páginas

### **3. Seguridad Uniforme:**
- ✅ **Headers de seguridad** en todos los HTML
- ✅ **Sistema de scripts** estandarizado
- ✅ **Validación centralizada** en security.js

### **4. Rendimiento Optimizado:**
- ✅ **Cacheo eficiente** por categorías
- ✅ **Lazy loading** por sección
- ✅ **Minificación por tipo** de asset

## 📋 **VERIFICACIÓN FUNCIONAL**

### **Para probar que todo funciona:**

1. **Servidor funcionando:**
   ```bash
   npm start
   ```

2. **Páginas principales accesibles:**
   - ✅ `http://localhost:3000/` - Página principal
   - ✅ `http://localhost:3000/pages/auth/login.html` - Login
   - ✅ `http://localhost:3000/pages/shop/cart.html` - Carrito

3. **Redirecciones funcionando:**
   - ✅ `http://localhost:3000/login.html` → `/pages/auth/login.html`
   - ✅ `http://localhost:3000/cart.html` → `/pages/shop/cart.html`

4. **Assets cargando correctamente:**
   - ✅ CSS: `/assets/styles/styles.css`
   - ✅ JS: `/assets/scripts/security.js`
   - ✅ Imágenes: `/assets/images/EB.png`

5. **Seguridad implementada:**
   - ✅ Headers de seguridad en todas las páginas
   - ✅ Scripts de seguridad cargando
   - ✅ Login funcionando con seguridad

## 🔄 **COMPATIBILIDAD BACKWARD**

### **Redirecciones automáticas:**
- Todas las rutas antiguas redirigen a las nuevas
- Los bookmarks existentes siguen funcionando
- Los enlaces externos no se rompen

### **SEO mantenido:**
- URLs canónicas actualizadas
- Meta tags preservados
- Indexación mantenido

## 🎯 **RESULTADO FINAL**

✅ **Estructura organizada y funcional**
✅ **Seguridad completa en todas las páginas**  
✅ **Compatibilidad con rutas antiguas**
✅ **Mantenimiento simplificado**
✅ **Escalabilidad garantizada**

**El proyecto ahora tiene una estructura enterprise-level, completamente funcional y segura.**
