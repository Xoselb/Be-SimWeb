const express = require('express');
const path = require('path');
const cors = require('cors');

// Créer l'application Express
const app = express();
const PORT = process.env.PORT || 3000;
const rootDir = path.join(__dirname, '../..');

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la raíz del proyecto
app.use(express.static(rootDir));
app.use('/img', express.static(path.join(rootDir, 'img')));
app.use('/public', express.static(path.join(rootDir, 'public')));

// Ruta para el favicon
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(rootDir, 'img/Aurora_Interactive.png'));
});

// Rutas para archivos HTML
app.get('*', (req, res, next) => {
    const filePath = req.path === '/' ? 'index.html' : req.path;
    const fullPath = path.join(rootDir, filePath);
    
    // Si es un archivo HTML o la raíz, servirlo
    if (filePath.endsWith('.html') || req.path === '/') {
        res.sendFile(fullPath, (err) => {
            if (err) {
                console.error(`Error al cargar ${filePath}:`, err);
                next();
            }
        });
    } else {
        next();
    }
});

// Manejador de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('¡Algo salió mal!');
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`\n✅ Servidor en ejecución en: http://localhost:${PORT}`);
    console.log('📁 Directorio raíz:', rootDir);
    console.log('🖼️ Favicon en:', path.join(rootDir, 'img/Aurora_Interactive.png'));
    console.log('🚀 Para detener el servidor, presiona Ctrl+C\n');
});
