const fs = require('fs');
const path = require('path');

// Directorio raíz del proyecto
const rootDir = path.join(__dirname, '..');

// Función para actualizar rutas de imágenes inline en HTML
function updateInlineImagePaths(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Actualizar rutas de imágenes inline style="background-image: url('img/..."
        content = content.replace(/style="[^"]*background-image:\s*url\('img\//g, (match) => {
            return match.replace("url('img/", "url('/img/");
        });
        
        content = content.replace(/style="[^"]*background-image:\s*url\("img\//g, (match) => {
            return match.replace('url("img/', 'url("/img/');
        });
        
        content = content.replace(/style="[^"]*background-image:\s*url\(img\//g, (match) => {
            return match.replace('url(img/', 'url(/img/');
        });
        
        // Guardar el archivo actualizado
        if (content !== fs.readFileSync(filePath, 'utf8')) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Actualizado: ${filePath}`);
        }
        
    } catch (error) {
        console.error(`❌ Error actualizando ${filePath}:`, error.message);
    }
}

// Función para encontrar todos los archivos HTML
function findHtmlFiles(dir) {
    const files = [];
    
    function scanDirectory(currentDir) {
        try {
            const de = fs.readdirSync(currentDir);
            
            for (const item of de) {
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
console.log('🔧 Actualizando rutas de imágenes inline en HTML...\n');

const htmlFiles = findHtmlFiles(rootDir);

for (const file of htmlFiles) {
    updateInlineImagePaths(file);
}

console.log(`\n✨ Proceso completado. Se revisaron ${htmlFiles.length} archivos HTML.`);
