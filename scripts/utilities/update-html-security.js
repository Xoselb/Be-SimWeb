#!/usr/bin/env node

/**
 * Script para actualizar todos los archivos HTML con headers de seguridad
 * y sistema de scripts estándar
 */

const fs = require('fs');
const path = require('path');

// Directorios a ignorar
const ignoreDirs = ['node_modules', 'coverage', '.git', 'templates'];

// Headers de seguridad estándar
const securityHeaders = `
    <!-- Security Headers -->
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-Frame-Options" content="DENY">
    <meta http-equiv="X-XSS-Protection" content="1; mode=block">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' http://localhost:3000;">`;

// Scripts de seguridad estándar
const securityScripts = `
    <!-- Sistema de seguridad -->
    <script src="/js/security.js"></script>
    <script src="/js/auth.js"></script>`;

// Scripts adicionales según el archivo
const additionalScripts = {
    'login.html': '',
    'register.html': '<script src="/js/registro.js"></script>',
    'perfil.html': '<script src="/js/perfil.js"></script>',
    'citas.html': '<script src="/js/citas.js"></script>',
    'contacto.html': '<script src="/js/contacto.js"></script>',
    'cart.html': '<script src="/js/services/cartService.js"></script><script src="/js/cart.js"></script>',
    'checkout.html': '<script src="/js/paymentService.js"></script>',
    'index.html': '<script src="/js/index.js?v=3"></script>'
};

function findHtmlFiles(dir) {
    const files = [];
    
    function traverse(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && !ignoreDirs.includes(item)) {
                traverse(fullPath);
            } else if (stat.isFile() && item.endsWith('.html')) {
                files.push(fullPath);
            }
        }
    }
    
    traverse(dir);
    return files;
}

function updateHtmlFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath);
        
        // Verificar si ya tiene headers de seguridad
        if (content.includes('X-Content-Type-Options')) {
            console.log(`✓ ${fileName} ya tiene headers de seguridad`);
            return;
        }
        
        // Agregar headers de seguridad después del <head>
        content = content.replace(
            /<head>/,
            `<head>${securityHeaders}`
        );
        
        // Agregar scripts de seguridad antes de </body>
        const scriptsToAdd = securityScripts + (additionalScripts[fileName] || '');
        content = content.replace(
            /<\/body>/,
            `${scriptsToAdd}\n</body>`
        );
        
        fs.writeFileSync(filePath, content);
        console.log(`✓ Actualizado: ${fileName}`);
        
    } catch (error) {
        console.error(`✗ Error actualizando ${filePath}:`, error.message);
    }
}

// Procesar todos los archivos HTML
const htmlFiles = findHtmlFiles(process.cwd());
console.log(`Encontrados ${htmlFiles.length} archivos HTML...`);

for (const file of htmlFiles) {
    updateHtmlFile(file);
}

console.log('\n✅ Actualización de seguridad completada');
