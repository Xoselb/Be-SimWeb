const fs = require('fs');
const path = require('path');

// Directorio raíz del proyecto
const rootDir = path.join(__dirname, '..');

// Función para actualizar rutas en archivos CSS
function updateCssPaths(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Actualizar rutas de imágenes relativas a absolutas en CSS
        // Caso 1: url('../img/') -> url('/img/')
        content = content.replace(/url\('\.\.\/img\//g, "url('/img/");
        content = content.replace(/url\("\.\.\/img\//g, 'url("/img/');
        content = content.replace(/url\(\.\.\/img\//g, "url(/img/");
        
        // Caso 2: url('img/') -> url('/img/')
        content = content.replace(/url\('img\//g, "url('/img/");
        content = content.replace(/url\("img\//g, 'url("/img/');
        content = content.replace(/url\(img\//g, "url(/img/");
        
        // Caso 3: url('/public/img/') -> url('/img/') (convertir a ruta más simple)
        content = content.replace(/url\('\/public\/img\//g, "url('/img/");
        content = content.replace(/url\("\/public\/img\//g, 'url("/img/');
        content = content.replace(/url\(\/public\/img\//g, "url(/img/");
        
        // Guardar el archivo actualizado
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Actualizado: ${filePath}`);
        
    } catch (error) {
        console.error(`❌ Error actualizando ${filePath}:`, error.message);
    }
}

// Función para encontrar todos los archivos CSS
function findCssFiles(dir) {
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
                } else if (item.endsWith('.css')) {
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

// Procesar todos los archivos CSS
console.log('🔧 Actualizando rutas de imágenes en archivos CSS...\n');

const cssFiles = findCssFiles(rootDir);

for (const file of cssFiles) {
    updateCssPaths(file);
}

console.log(`\n✨ Proceso completado. Se actualizaron ${cssFiles.length} archivos CSS.`);
