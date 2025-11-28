// update-headers.js - Script to update headers across all HTML files

const fs = require('fs');
const path = require('path');

// Define the header template
const headerTemplate = `
<!-- Header -->
<header class="header">
    <div class="container">
        <div class="logo">
            <a href="index.html"><h1>EB <span>Simracing</span></h1></a>
        </div>
        <nav class="main-nav">
            <ul>
                <li><a href="index.html#inicio" class="active">Accueil</a></li>
                <li><a href="index.html#servicios">Services</a></li>
                <li><a href="galerie.html">Galerie</a></li>
                <li><a href="merch.html">Boutique</a></li>
                <li><a href="contacto.html">Contact</a></li>
                <li class="nav-user" id="navUser" style="display: none;">
                    <div class="user-avatar" id="userMenuBtn">
                        <img src="img/default-avatar.png" alt="Profil" id="userAvatar">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="user-dropdown" id="userDropdown">
                        <a href="perfil.html"><i class="fas fa-user"></i> Mon Profil</a>
                        <a href="mes-reservations.html"><i class="fas fa-calendar-alt"></i> Mes réservations</a>
                        <a href="parametres.html"><i class="fas fa-cog"></i> Paramètres</a>
                        <div class="dropdown-divider"></div>
                        <a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Déconnexion</a>
                    </div>
                </li>
                <li class="nav-login" id="navLogin">
                    <a href="login.html" class="btn-login">Connexion</a>
                </li>
            </ul>
        </nav>
        <div class="mobile-menu-btn">
            <i class="fas fa-bars"></i>
        </div>
    </div>
</header>`;

// List of HTML files to update (relative to project root)
const htmlFiles = [
    'galerie.html',
    'merch.html',
    'contacto.html',
    'index.html',
    'login.html',
    'register.html',
    'forgot-password.html',
    'perfil.html',
    'simulateurs.html',
    'citas.html',
    'competitions.html',
    'track-days.html',
    'nous.html',
    'materiel-simulation.html',
    'bar-detente.html',
    'atelier-vinyle.html'
];

// Function to update header in a file
function updateHeaderInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if file already has the new header
        if (content.includes('id="navUser"')) {
            console.log(`Skipping ${filePath} - already has the new header`);
            return;
        }
        
        // Replace old header with new one
        const oldHeaderMatch = content.match(/<header[\s\S]*?<\/header>/);
        if (oldHeaderMatch) {
            const oldHeader = oldHeaderMatch[0];
            content = content.replace(oldHeader, headerTemplate);
            
            // Add required CSS and JS files if not present
            if (!content.includes('css/perfil.css')) {
                content = content.replace('</head>', 
                    '    <link rel="stylesheet" href="css/perfil.css">\n</head>');
            }
            
            if (!content.includes('js/auth.js')) {
                content = content.replace('</body>', 
                    '    <script src="js/auth.js"></script>\n    <script src="js/header.js"></script>\n</body>');
            }
            
            // Save the file
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated header in ${filePath}`);
        } else {
            console.log(`No header found in ${filePath}`);
        }
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
    }
}

// Update headers in all files
htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
        updateHeaderInFile(filePath);
    } else {
        console.log(`File not found: ${filePath}`);
    }
});

console.log('Header update process completed!');
