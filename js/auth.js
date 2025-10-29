// auth.js - Módulo de autenticación

// Roles disponibles
const ROLES = {
    OWNER: 'propriétaire',
    DEV: 'modérateur',
    ADMIN: 'administrateur',
    VIP: 'premium',
    USER: 'utilisateur'
};

const ROLE_TRANSLATIONS = {
    [ROLES.OWNER]: 'Propriétaire',
    [ROLES.DEV]: 'DEV',
    [ROLES.ADMIN]: 'Administrateur',
    [ROLES.VIP]: 'Membre VIP',
    [ROLES.USER]: 'Membre'
};

// Niveles de permiso (a mayor número, más permisos)
const ROLE_LEVELS = {
    [ROLES.OWNER]: 5,
    [ROLES.DEV]: 4,
    [ROLES.ADMIN]: 3,
    [ROLES.VIP]: 2,
    [ROLES.USER]: 1
};

// Credenciales de prueba
const TEST_USER = {
    email: 'test@example.com',
    password: 'password123',
    id: 1001,
    firstName: 'Xosé Ramón',
    lastName: 'Larroy Becerra',
    phone: '+34123456789',
    avatar: 'img/EVAN.JPG',
    role: ROLES.DEV, // Rol por defecto para el usuario de prueba
    isActive: true
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
    
    // Inicializar roles si no existen
    if (!localStorage.getItem('roles')) {
        localStorage.setItem('roles', JSON.stringify(ROLES));
    }
}

// Llamar a la inicialización cuando se carga el script
initializeTestUser();

// Función para verificar permisos de usuario
function hasPermission(user, requiredRole) {
    if (!user || !user.role) return false;
    const userLevel = ROLE_LEVELS[user.role] || 0;
    const requiredLevel = ROLE_LEVELS[requiredRole] || 0;
    return userLevel >= requiredLevel;
}

// Función para obtener todos los usuarios (solo para roles con permisos)
function getUsers(requesterRole) {
    if (!hasPermission({ role: requesterRole }, ROLES.ADMIN)) {
        throw new Error('No tienes permisos para ver los usuarios');
    }
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.map(({ password, ...user }) => user); // No devolver contraseñas
}

// Función para actualizar el rol de un usuario
function updateUserRole(userEmail, newRole, requesterRole) {
    if (!hasPermission({ role: requesterRole }, ROLES.ADMIN)) {
        throw new Error('No tienes permisos para actualizar roles');
    }
    
    if (!Object.values(ROLES).includes(newRole)) {
        throw new Error('Rol no válido');
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(user => user.email === userEmail);
    
    if (userIndex === -1) {
        throw new Error('Usuario no encontrado');
    }
    
    users[userIndex].role = newRole;
    localStorage.setItem('users', JSON.stringify(users));
    return { success: true, message: 'Rol actualizado correctamente' };
}

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