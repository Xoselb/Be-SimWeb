const express = require('express');
const path = require('path');
const app = express();
const PORT = 3001;

// Servir les fichiers statiques depuis le dossier public
app.use(express.static('.'));

// Route pour la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
    console.log('Appuyez sur Ctrl+C pour arrêter le serveur');
});
