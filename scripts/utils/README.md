# Scripts de Mantenimiento

Esta carpeta contiene scripts útiles para el mantenimiento del sitio web.

## Scripts Disponibles

### `updateFavicons.js`

Actualiza los favicons en todos los archivos HTML del proyecto.

**Uso:**
```bash
node scripts/updateFavicons.js
```

**Características:**
- Actualiza automáticamente todos los archivos HTML principales
- Verifica si el archivo ya tiene un favicon antes de actualizar
- Proporciona un resumen detallado de los cambios realizados
- Manejo de errores mejorado

## Estructura de Carpetas

- `/scripts`
  - `updateFavicons.js` - Script principal para actualizar favicons
  - `README.md` - Este archivo de documentación
  - `/utils` - Utilidades compartidas (futuras implementaciones)

## Requisitos

- Node.js 14.x o superior
- Acceso de escritura a los archivos del proyecto
