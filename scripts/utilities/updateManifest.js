const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '../site.webmanifest');

const manifest = {
    "name": "EB Simracing",
    "short_name": "EB Simracing",
    "description": "Centro de simulación de carreras profesional",
    "icons": [
        {
            "src": "/img/Aurora_Interactive.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "/img/Aurora_Interactive.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any maskable"
        }
    ],
    "theme_color": "#000000",
    "background_color": "#000000",
    "display": "standalone",
    "start_url": "/",
    "scope": "/",
    "orientation": "portrait"
};

// Escribir el archivo con formato legible
fs.writeFileSync(
    manifestPath,
    JSON.stringify(manifest, null, 4),
    'utf8'
);

console.log('✅ site.webmanifest actualizado correctamente');
console.log('📁 Ruta:', manifestPath);
