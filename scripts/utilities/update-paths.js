#!/usr/bin/env node

/**
 * Script para actualizar todas las rutas en archivos HTML después de la reorganización
 */

const fs = require('fs');
const path = require('path');

// Mapeo de rutas antiguas a nuevas
const pathMappings = {
    // CSS
    '/css/': '/assets/styles/',
    'href="/css/': 'href="/assets/styles/',
    
    // JavaScript
    '/js/': '/assets/scripts/',
    'src="/js/': 'src="/assets/scripts/',
    
    // Imágenes
    '/img/': '/assets/images/',
    'src="/img/': 'src="/assets/images/',
    
    // Páginas HTML
    'login.html': 'pages/auth/login.html',
    'register.html': 'pages/auth/register.html',
    'forgot-password.html': 'pages/auth/forgot-password.html',
    'perfil.html': 'pages/auth/perfil.html',
    
    'cart.html': 'pages/shop/cart.html',
    'checkout.html': 'pages/shop/checkout.html',
    'merch.html': 'pages/shop/merch.html',
    'order-confirmation.html': 'pages/shop/order-confirmation.html',
    
    'simulateurs.html': 'pages/simulation/simulateurs.html',
    'materiel-simulation.html': 'pages/simulation/materiel-simulation.html',
    'C1.html': 'pages/simulation/C1.html',
    'GT3SPRINT.html': 'pages/simulation/GT3SPRINT.html',
    'Porsche718.html': 'pages/simulation/Porsche718.html',
    
    'competitions.html': 'pages/events/competitions.html',
    'track-days.html': 'pages/events/track-days.html',
    'FunCup.html': 'pages/events/FunCup.html',
    'CircuitsLegendaries.html': 'pages/events/CircuitsLegendaries.html',
    
    'contacto.html': 'pages/info/contacto.html',
    'nous.html': 'pages/info/nous.html',
    'galerie.html': 'pages/info/galerie.html',
    'bar-detente.html': 'pages/info/bar-detente.html',
    'atelier-vinyle.html': 'pages/info/atelier-vinyle.html',
    'citas.html': 'pages/info/citas.html',
    'mes-reservations.html': 'pages/info/mes-reservations.html',
    'confirmacion.html': 'pages/info/confirmacion.html',
    'home.html': 'pages/info/home.html',
    'test-auth.html': 'pages/info/test-auth.html',
    
    // Actualizar icono
    'href="/img/EB.png"': 'href="/assets/images/EB.png"'
};

function findHtmlFiles(dir) {
    const files = [];
    
    function traverse(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('coverage')) {
                traverse(fullPath);
            } else if (stat.isFile() && item.endsWith('.html')) {
                files.push(fullPath);
            }
        }
    }
    
    traverse(dir);
    return files;
}

function updateFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath);
        let updated = false;
        
        // Aplicar todos los mapeos de rutas
        for (const [oldPath, newPath] of Object.entries(pathMappings)) {
            if (content.includes(oldPath)) {
                content = content.replace(new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newPath);
                updated = true;
            }
        }
        
        if (updated) {
            fs.writeFileSync(filePath, content);
            console.log(`✓ Actualizado: ${fileName}`);
        } else {
            console.log(`- Sin cambios: ${fileName}`);
        }
        
    } catch (error) {
        console.error(`✗ Error actualizando ${filePath}:`, error.message);
    }
}

// Procesar todos los archivos HTML
const htmlFiles = findHtmlFiles(process.cwd());
console.log(`Actualizando rutas en ${htmlFiles.length} archivos HTML...\n`);

for (const file of htmlFiles) {
    updateFile(file);
}

console.log('\n✅ Actualización de rutas completada');
