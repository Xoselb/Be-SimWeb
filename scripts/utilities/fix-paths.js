const fs = require('fs');
const path = require('path');

// Directorio raíz del proyecto
const rootDir = path.join(__dirname, '..');

// Función para actualizar rutas en un archivo
function updateFilePaths(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Actualizar rutas CSS de relativas a absolutas
        content = content.replace(/href="css\//g, 'href="/css/');
        content = content.replace(/href="js\//g, 'href="/js/');
        
        // Actualizar rutas JavaScript de relativas a absolutas
        content = content.replace(/src="js\//g, 'src="/js/');
        
        // Actualizar rutas de imágenes de relativas a absolutas
        content = content.replace(/src="img\//g, 'src="/img/');
        content = content.replace(/href="img\//g, 'href="/img/');
        
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
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                // Ignorar directorios node_modules y .git
                if (!item.includes('node_modules') && !item.includes('.git')) {
                    scanDirectory(fullPath);
                }
            } else if (item.endsWith('.html')) {
                files.push(fullPath);
            }
        }
    }
    
    scanDirectory(dir);
    return files;
}

// Procesar todos los archivos HTML
console.log('🔧 Actualizando rutas CSS y JS a absolutas...\n');

const htmlFiles = findHtmlFiles(rootDir);

for (const file of htmlFiles) {
    updateFilePaths(file);
}

console.log(`\n✨ Proceso completado. Se actualizaron ${htmlFiles.length} archivos HTML.`);
