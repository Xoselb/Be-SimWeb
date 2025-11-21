document.addEventListener('DOMContentLoaded', () => {
    const loadingElement = document.getElementById('loading');
    const profileContent = document.getElementById('profileContent');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Verificar autenticación al cargar la página
    checkAuth();
    
    // Manejador para el botón de cerrar sesión
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    function checkAuth() {
        const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
        
        if (!user) {
            // Si no hay usuario, redirigir al login
            redirectToLogin();
            return;
        }
        
        // Cargar perfil del usuario
        loadUserProfile(user);
    }
    
    function loadUserProfile(userData) {
        // Ocultar carga y mostrar contenido
        if (loadingElement) loadingElement.style.display = 'none';
        if (profileContent) profileContent.style.display = 'block';
        
        // Actualizar la interfaz con los datos del usuario
        const userNameElement = document.getElementById('userName');
        const userEmailElement = document.getElementById('userEmail');
        const userPhoneElement = document.getElementById('userPhone');
        
        if (userNameElement) userNameElement.textContent = `${userData.firstName} ${userData.lastName}`;
        if (userEmailElement) userEmailElement.textContent = userData.email || 'No especificado';
        if (userPhoneElement) userPhoneElement.textContent = userData.phone || 'No especificado';
        
        // Configurar avatar
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar) {
            if (userData.avatar) {
                userAvatar.src = userData.avatar;
            } else {
                // Mostrar iniciales si no hay avatar
                setupUserAvatar(userData.firstName, userData.lastName);
            }
        }
    }
    
    function setupUserAvatar(firstName, lastName) {
        const avatarElement = document.getElementById('userAvatar');
        if (avatarElement && firstName && lastName) {
            const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
            avatarElement.innerHTML = `<span style="font-size: 2.5rem; font-weight: bold;">${initials}</span>`;
        }
    }
    
    function handleLogout(e) {
        if (e) e.preventDefault();
        // Limpiar datos de autenticación
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        
        // Redirigir al inicio
        window.location.href = 'index.html';
    }
    
    function redirectToLogin() {
        window.location.href = 'login.html';
    }
});
