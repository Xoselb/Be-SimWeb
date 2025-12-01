// perfil.js - Script para la página de perfil
document.addEventListener('DOMContentLoaded', function() {
    console.log('perfil.js cargado');
    
    // Verificar si el usuario está autenticado
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        window.location.href = '/pages/auth/login.html';
        return;
    }
    
    // Cargar datos del usuario
    try {
        const userData = JSON.parse(user);
        console.log('Usuario autenticado:', userData);
        
        // Actualizar información del perfil
        const userNameElements = document.querySelectorAll('.user-name');
        const userEmailElements = document.querySelectorAll('.user-email');
        
        userNameElements.forEach(el => {
            if (el) el.textContent = `${userData.firstName} ${userData.lastName}`;
        });
        
        userEmailElements.forEach(el => {
            if (el) el.textContent = userData.email;
        });
        
    } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
    }
});
