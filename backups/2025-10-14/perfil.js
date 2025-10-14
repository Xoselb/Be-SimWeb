document.addEventListener('DOMContentLoaded', () => {
    const loadingElement = document.getElementById('loading');
    const profileContent = document.getElementById('profileContent');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Verificar autenticación al cargar la página
    checkAuth();
    
    // Manejador para el botón de cerrar sesión
    logoutBtn.addEventListener('click', handleLogout);
    
    async function checkAuth() {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            // Si no hay token, redirigir al login
            redirectToLogin();
            return;
        }
        
        try {
            // Verificar el token con el servidor
            const response = await fetch('http://localhost:3000/api/verify-token', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Token inválido o expirado');
            }
            
            const userData = await response.json();
            loadUserProfile(userData);
            
        } catch (error) {
            console.error('Error de autenticación:', error);
            alert('Tu sesión ha expirado o no tienes permiso para ver esta página');
            redirectToLogin();
        }
    }
    
    function loadUserProfile(userData) {
        // Ocultar carga y mostrar contenido
        loadingElement.style.display = 'none';
        profileContent.style.display = 'block';
        
        // Actualizar la interfaz con los datos del usuario
        document.getElementById('userName').textContent = `${userData.first_name} ${userData.last_name}`;
        document.getElementById('userEmail').textContent = userData.email;
        document.getElementById('userEmailText').textContent = userData.email;
        document.getElementById('userFirstName').textContent = userData.first_name || '-';
        document.getElementById('userLastName').textContent = userData.last_name || '-';
        document.getElementById('userCountry').textContent = userData.country || '-';
        document.getElementById('userStreet').textContent = userData.street || '-';
        document.getElementById('userStreetNumber').textContent = userData.street_number || '-';
        
        // Formatear fecha de nacimiento
        if (userData.birthdate) {
            const birthdate = new Date(userData.birthdate);
            document.getElementById('userBirthdate').textContent = 
                birthdate.toLocaleDateString('es-ES');
        }
        
        // Mostrar fecha de creación de la cuenta
        if (userData.created_at) {
            const createdAt = new Date(userData.created_at);
            document.getElementById('userSince').textContent = 
                createdAt.toLocaleDateString('es-ES');
        }
        
        // Configurar avatar con iniciales
        setupUserAvatar(userData.first_name, userData.last_name);
    }
    
    function setupUserAvatar(firstName, lastName) {
        const avatarElement = document.getElementById('userAvatar');
        if (firstName && lastName) {
            const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
            avatarElement.innerHTML = `<span style="font-size: 2.5rem; font-weight: bold;">${initials}</span>`;
        }
    }
    
    async function handleLogout() {
        try {
            const response = await fetch('http://localhost:3000/api/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            
            if (response.ok) {
                localStorage.removeItem('authToken');
                redirectToLogin();
            } else {
                throw new Error('Error al cerrar sesión');
            }
            
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            // Forzar cierre de sesión localmente aunque falle en el servidor
            localStorage.removeItem('authToken');
            redirectToLogin();
        }
    }
    
    function redirectToLogin() {
        window.location.href = 'index.html#login';
    }
});
