const fs = require('fs');
const path = require('path');

// Archivos HTML principales a actualizar (excluyendo node_modules, backups y coverage)
const htmlFiles = [
    '../C1.html',
    '../CircuitsLegendaries.html',
    '../FunCup.html',
    '../GT3SPRINT.html',
    '../Porsche718.html',
    '../atelier-vinyle.html',
    '../bar-detente.html',
    '../citas.html',
    '../competitions.html',
    '../confirmacion.html',
    '../contacto.html',
    '../home.html',
    '../index.html',
    '../materiel-simulation.html',
    '../merch.html',
    '../nous.html',
    '../simulateurs.html',
    '../track-days.html'
];

// Contenido del favicon a insertar
const faviconTag = '    <link rel="icon" href="/public/img/Aurora_Interactive.png" type="image/png">';

/**
 * Actualiza los favicons en todos los archivos HTML especificados
 */
function updateFavicons() {
    console.log('🚀 Iniciando actualización de favicons...\n');
    
    let updatedCount = 0;
    let errorCount = 0;
    
    htmlFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        
        try {
            // Verificar si el archivo existe
            if (fs.existsSync(filePath)) {
                let content = fs.readFileSync(filePath, 'utf8');
                
                // Verificar si ya tiene un favicon
                if (content.includes('rel="icon"')) {
                    console.log(`ℹ️  Ya tiene favicon: ${file}`);
                    return;
                }
                
                // Buscar la etiqueta del título
                const titleTag = content.match(/<title>.*<\/title>/);
                
                if (titleTag) {
                    // Insertar el favicon después del título
                    const newContent = content.replace(
                        titleTag[0], 
                        `${titleTag[0]}\n${faviconTag}`
                    );
                    
                    // Guardar los cambios
                    fs.writeFileSync(filePath, newContent, 'utf8');
                    console.log(`✅ Actualizado: ${file}`);
                    updatedCount++;
                } else {
                    console.log(`⚠️  No se encontró la etiqueta <title> en ${file}`);
                    errorCount++;
                }
            } else {
                console.log(`❌ Archivo no encontrado: ${file}`);
                errorCount++;
            }
        } catch (error) {
            console.error(`❌ Error procesando ${file}:`, error.message);
            errorCount++;
        }
    });
    
    console.log('\n📊 Resumen:');
    console.log(`✅ ${updatedCount} archivos actualizados`);
    console.log(`⚠️  ${errorCount} archivos con errores`);
    console.log('\n✨ Proceso completado!');
}

// Ejecutar la función principal
updateFavicons();
