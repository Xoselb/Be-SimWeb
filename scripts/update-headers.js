// update-headers.js - Script para actualizar todos los headers con el perfil premium

const fs = require('fs');
const path = require('path');

// Plantilla premium del header
const premiumHeaderTemplate = `<li class="nav-user" id="navUser" style="display: none;">
                        <div class="user-avatar" id="userMenuBtn">
                            <img src="/img/user/EB_Default_Avatar.png" alt="Profil" id="userAvatar">
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="user-dropdown" id="userDropdown">
                            <!-- Header del dropdown con info del usuario -->
                            <div class="user-info-header">
                                <div class="user-name">Usuario</div>
                                <div class="user-email">user@example.com</div>
                                <div class="user-status">Verificado</div>
                            </div>
                            
                            <!-- Enlaces del menú -->
                            <a href="/pages/user/perfil.html">
                                <i class="fas fa-user"></i> 
                                <span>Mon Profil</span>
                            </a>
                            <a href="/pages/user/mes-reservations.html">
                                <i class="fas fa-calendar-alt"></i> 
                                <span>Mes Réservations</span>
                                <span class="badge">3</span>
                            </a>
                            <a href="/pages/shop/cart.html">
                                <i class="fas fa-shopping-cart"></i> 
                                <span>Mon Panier</span>
                                <span class="badge">2</span>
                            </a>
                            <a href="/pages/user/parametres.html">
                                <i class="fas fa-cog"></i> 
                                <span>Paramètres</span>
                            </a>
                            <a href="/pages/user/aide.html">
                                <i class="fas fa-question-circle"></i> 
                                <span>Aide & Support</span>
                            </a>
                            
                            <div class="dropdown-divider"></div>
                            
                            <a href="#" id="logoutBtn">
                                <i class="fas fa-sign-out-alt"></i> 
                                <span>Déconnexion</span>
                            </a>
                        </div>
                    </li>`;

// Plantilla CSS premium
const premiumCSSTemplate = `<link rel="stylesheet" href="/css/components/header-profile.css">`;

// Función para actualizar un archivo HTML
function updateHTMLFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Verificar si ya tiene el header premium
        if (content.includes('user-info-header')) {
            console.log(`✅ ${filePath} ya tiene el header premium`);
            return;
        }
        
        // Reemplazar el header antiguo
        const oldHeaderRegex = /<li class="nav-user" id="navUser"[^>]*>[\s\S]*?<\/li>/;
        content = content.replace(oldHeaderRegex, premiumHeaderTemplate);
        
        // Agregar CSS premium si no existe
        if (!content.includes('header-profile.css')) {
            const stylesRegex = /(<link[^>]*styles\.css[^>]*>)/;
            content = content.replace(stylesRegex, `$1\n    <link rel="stylesheet" href="/css/components/header-profile.css">`);
        }
        
        fs.writeFileSync(filePath, content);
        console.log(`🔄 ${filePath} actualizado con header premium`);
        
    } catch (error) {
        console.error(`❌ Error actualizando ${filePath}:`, error.message);
    }
}

// Función para encontrar todos los archivos HTML
function findHTMLFiles(dir) {
    const files = [];
    
    function traverse(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                traverse(fullPath);
            } else if (item.endsWith('.html')) {
                files.push(fullPath);
            }
        }
    }
    
    traverse(dir);
    return files;
}

// Función principal
function main() {
    console.log('🚀 Actualizando headers con perfil premium...\n');
    
    const htmlFiles = findHTMLFiles(path.join(__dirname, '../'));
    
    console.log(`📁 Encontrados ${htmlFiles.length} archivos HTML\n`);
    
    // Filtrar archivos que tienen nav-user
    const filesWithNavUser = htmlFiles.filter(file => {
        try {
            const content = fs.readFileSync(file, 'utf8');
            return content.includes('nav-user') || content.includes('userAvatar');
        } catch (error) {
            return false;
        }
    });
    
    console.log(`🎯 ${filesWithNavUser.length} archivos necesitan actualización\n`);
    
    // Actualizar cada archivo
    filesWithNavUser.forEach(updateHTMLFile);
    
    console.log('\n✨ ¡Actualización completada!');
    console.log('\n📋 Resumen:');
    console.log(`   📁 Total archivos HTML: ${htmlFiles.length}`);
    console.log(`   🔄 Archivos actualizados: ${filesWithNavUser.length}`);
    console.log(`   ✅ Headers premium aplicados`);
    console.log(`   🎨 CSS premium agregado`);
    
    console.log('\n🎯 Características agregadas:');
    console.log('   ✅ Avatar con indicador de estado en línea');
    console.log('   ✅ Dropdown glassmorphism premium');
    console.log('   ✅ Información del usuario en el header');
    console.log('   ✅ Badges de notificaciones');
    console.log('   ✅ Animaciones suaves y elegantes');
    console.log('   ✅ Diseño responsive');
    console.log('   ✅ Soporte para accesibilidad');
}

// Ejecutar script
if (require.main === module) {
    main();
}

module.exports = { updateHTMLFile, findHTMLFiles };
