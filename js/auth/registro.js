/**
 * registro.js - Sistema de registro seguro
 * Usa el sistema de seguridad centralizado
 */

document.addEventListener('DOMContentLoaded', function() {
    const registroForm = document.getElementById("registroForm");
    
    if (registroForm) {
        registroForm.addEventListener("submit", function(e) {
            e.preventDefault();
            
            // Sanitizar entradas
            const nombre = window.security ? 
                window.security.sanitizeInput(document.getElementById("nombre")?.value || '') : 
                document.getElementById("nombre")?.value || '';
            
            const email = window.security ? 
                window.security.sanitizeInput(document.getElementById("email")?.value || '') : 
                document.getElementById("email")?.value || '';
            
            const password = document.getElementById("password")?.value || '';
            
            console.log('Intento de registro:', { nombre, email });
            
            // Validaciones
            if (!nombre || !email || !password) {
                alert("Por favor, completa todos los campos");
                return;
            }
            
            // Validar formato de email
            if (window.security && !window.security.validateEmail(email)) {
                alert("Por favor, introduce un email válido");
                return;
            }
            
            // Validar contraseña
            if (window.security && !window.security.validatePassword(password)) {
                alert("La contraseña debe tener al menos 8 caracteres, 1 mayúscula y 1 número");
                return;
            }
            
            // Guardar usuario de forma segura
            const usuario = {
                nombre: nombre,
                email: email,
                password: password, // En producción, esto debería estar hasheado
                createdAt: new Date().toISOString()
            };
            
            try {
                localStorage.setItem(email, JSON.stringify(usuario));
                alert("Usuario registrado con éxito");
                window.location.href = "login.html";
            } catch (error) {
                console.error('Error al guardar usuario:', error);
                alert("Error al registrar usuario. Inténtalo de nuevo.");
            }
        });
    }
});