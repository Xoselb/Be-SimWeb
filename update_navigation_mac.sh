#!/bin/bash

# List of HTML files to update
HTML_FILES=(
    "index.html"
    "simulateurs.html"
    "competitions.html"
    "track-days.html"
    "contacto.html"
    "atelier-vinyle.html"
    "bar-detente.html"
    "materiel-simulation.html"
    "nous.html"
    "citas.html"
    "confirmacion.html"
    "login.html"
    "perfil.html"
    "registro.html"
    "C1.html"
    "CircuitsLegendaries.html"
    "FunCup.html"
    "GT3SPRINT.html"
    "Porsche718.html"
)

# Create backup directory if it doesn't exist
mkdir -p backups

for file in "${HTML_FILES[@]}"; do
    if [ -f "$file" ]; then
        # Create backup
        cp "$file" "backups/${file}.bak"
        
        # Update navigation menu - using a temporary file for macOS compatibility
        sed -i '' '/<li><a href="contacto.html">Contact<\/a><\/li>/i\
                    <li><a href="merch.html">Boutique</a></li>\
        ' "$file"
        
        # Update active class for the current page
        # Remove active class from all links
        sed -i '' 's/class="active"//g' "$file"
        # Add active class to the current page
        if [[ "$file" == "merch.html" ]]; then
            sed -i '' 's|<a href="merch.html"|& class="active"|' "$file"
        fi
        
        echo "Updated navigation in $file"
    else
        echo "Warning: $file not found, skipping..."
    fi
done

echo "Navigation update complete. Backups are stored in the 'backups' directory."
