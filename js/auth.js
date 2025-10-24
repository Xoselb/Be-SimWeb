// auth.js - Módulo de autenticación

// Credenciales de prueba
const TEST_USER = {
    email: 'xoselito2007@gmail.com',
    password: 'Larroy2007',
    id: 1001,
    firstName: 'Xosé Ramón',
    lastName: 'Larroy Becerra',
    phone: '+34699757247',
    avatar: 'img/EVAN.png'
};

// Inicializar el usuario de prueba si no existe
function initializeTestUser() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const testUserExists = users.some(user => user.email === TEST_USER.email);
    
    if (!testUserExists) {
        // No almacenamos la contraseña en texto plano en producción
        const { password, ...userWithoutPassword } = TEST_USER;
        users.push(userWithoutPassword);
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Llamar a la inicialización cuando se carga el script
initializeTestUser();

// Función para manejar el login
function handleLogin(email, password) {
    // Verificar credenciales de prueba
    if (email === TEST_USER.email && password === TEST_USER.password) {
        const { password: _, ...userData } = TEST_USER;
        
        // Guardar datos en localStorage (en un entorno real, usarías tokens JWT)
        localStorage.setItem('userToken', 'dummy-token');
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Redirigir al inicio
        window.location.href = 'index.html';
        return true;
    }
    
    // En un entorno real, aquí iría la lógica de autenticación con el servidor
    return false;
}

// Función para verificar si el usuario está autenticado
function isAuthenticated() {
    return localStorage.getItem('userToken') !== null;
}

// Función para obtener los datos del usuario actual
function getCurrentUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    window.location.href = 'login.html';
}

// Función para solicitar restablecimiento de contraseña
function requestPasswordReset(email) {
    // En un entorno real, aquí se haría una petición al servidor
    // Por ahora, simulamos el envío del correo
    return new Promise((resolve) => {
        // Simulamos un retraso de red
        setTimeout(() => {
            console.log(`Email de recuperación enviado a: ${email}`);
            resolve({ success: true });
        }, 1000);
    });
}

// Exportar funciones para su uso en otros archivos
window.auth = {
    handleLogin,
    isAuthenticated,
    getCurrentUser,
    logout,
    requestPasswordReset
};