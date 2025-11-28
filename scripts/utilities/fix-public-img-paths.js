const fs = require('fs');
const path = require('path');

// Directorio raíz del proyecto
const rootDir = path.join(__dirname, '..');

// Función para actualizar rutas de imágenes en HTML
function updateHtmlImagePaths(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Actualizar rutas de imágenes de /public/img/ a /img/
        content = content.replace(/src="\/public\/img\//g, 'src="/img/');
        content = content.replace(/href="\/public\/img\//g, 'href="/img/');
        
        // Guardar el archivo actualizado
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Actualizado: ${filePath}`);
        
    } catch (error) {
        console.error(`❌ Error actualizando ${filePath}:`, error.message);
    }
}

// Función para encontrar todos los archivos HTML
function findHtmlFiles(dir) {
    const files = [];
    
    function scanDirectory(currentDir) {
        try {
            const items = fs.readdirSync(currentDir);
            
            for (const item of items) {
                const fullPath = path.join(currentDir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    // Ignorar directorios node_modules y .git
                    if (!item.includes('node_modules') && !item.includes('.git') && !item.includes('.codeium')) {
                        scanDirectory(fullPath);
                    }
                } else if (item.endsWith('.html')) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            // Ignorar directorios sin permisos
        }
    }
    
    scanDirectory(dir);
    return files;
}

// Procesar todos los archivos HTML
console.log('🔧 Actualizando rutas de imágenes /public/img/ a /img/ en HTML...\n');

const htmlFiles = findHtmlFiles(rootDir);

for (const file of htmlFiles) {
    updateHtmlImagePaths(file);
}

console.log(`\n✨ Proceso completado. Se actualizaron ${htmlFiles.length} archivos HTML.`);
