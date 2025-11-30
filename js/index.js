// Mostrar/ocultar menú móvil
document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
    document.querySelector('.main-nav').classList.toggle('active');
    this.querySelector('i').classList.toggle('fa-times');
    this.querySelector('i').classList.toggle('fa-bars');
});

// Cerrar menú al hacer clic en un enlace
document.querySelectorAll('.main-nav a').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelector('.main-nav').classList.remove('active');
        document.querySelector('.mobile-menu-btn i').classList.add('fa-bars');
        document.querySelector('.mobile-menu-btn i').classList.remove('fa-times');
    });
});

// Funcionalidad del modal de login/registro
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const closeModal = document.querySelector('.close-modal');

console.log('=== ELEMENTOS DEL DOM ENCONTRADOS ===');
console.log('loginModal:', loginModal);
console.log('loginForm:', loginForm);
console.log('registerForm:', registerForm);
console.log('showRegister:', showRegister);
console.log('showLogin:', showLogin);
console.log('closeModal:', closeModal);

// Abrir modal de login
document.querySelectorAll('[href="#login"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

// Cerrar modal
function closeLoginModal() {
    loginModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

closeModal.addEventListener('click', closeLoginModal);

// Cerrar al hacer clic fuera del modal
loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        closeLoginModal();
    }
});

// Alternar entre login y registro
showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
});

// API URL - Ajusta según tu configuración
const API_URL = 'http://localhost:3000/api';

// Mostrar mensaje de error
function showError(element, message) {
    // Eliminar mensajes de error anteriores
    clearErrors();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = '#e74c3c'; // Rojo brillante
    errorDiv.style.fontSize = '0.9rem';
    errorDiv.style.fontWeight = 'bold';
    errorDiv.style.marginTop = '10px';
    errorDiv.style.padding = '8px 12px';
    errorDiv.style.backgroundColor = '#ffebee'; // Fondo rojo claro
    errorDiv.style.border = '1px solid #e74c3c';
    errorDiv.style.borderRadius = '4px';
    errorDiv.style.textAlign = 'center';
    
    // Agregar después del formulario o del elemento
    if (element.tagName === 'FORM') {
        element.appendChild(errorDiv);
    } else {
        element.parentNode.appendChild(errorDiv);
    }
    
    // Hacer scroll al error
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Enfocar el elemento
    if (element.tagName !== 'FORM') {
        element.focus();
    }
}

// Eliminar mensajes de error
function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.remove());
}

// Envío de formulario de inicio de sesión
if (loginForm) {
    console.log('Agregando event listener al loginForm');
    loginForm.addEventListener('submit', async (e) => {
        console.log('=== FORM SUBMIT DETECTADO ===');
        e.preventDefault();
        clearErrors();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        console.log('=== INICIANDO PROCESO DE LOGIN ===');
        console.log('Email:', email);
        console.log('Password:', password ? '***' : '(vacío)');
        console.log('API_URL:', API_URL);
        
        // Validaciones de seguridad
        if (!email || !password) {
            console.log('ERROR: Email o password vacíos');
            showError(loginForm, 'Por favor, completa todos los campos');
            return;
        }
        
        // Sanitizar entradas
        const sanitizedEmail = window.security ? window.security.sanitizeInput(email) : email;
        const sanitizedPassword = window.security ? window.security.sanitizeInput(password) : password;
        
        // Validar formato de email
        if (window.security && !window.security.validateEmail(sanitizedEmail)) {
            console.log('ERROR: Email inválido');
            showError(loginForm, 'Por favor, introduce un email válido');
            return;
        }
        
        // Rate limiting simple
        if (!window.security) {
            console.log('WARNING: Sistema de seguridad no disponible');
        }
        
        try {
            console.log('Enviando solicitud a:', `${API_URL}/login`);
            console.log('Body enviado:', JSON.stringify({ email: sanitizedEmail, password: sanitizedPassword }));
            
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest', // Protección CSRF básica
                },
                body: JSON.stringify({ email: sanitizedEmail, password: sanitizedPassword })
            });
            
            console.log('Respuesta recibida - Status:', response.status);
            console.log('Headers de respuesta:', [...response.headers.entries()]);
            
            const data = await response.json();
            console.log('Respuesta del servidor:', data);
            console.log('response.ok:', response.ok);
            console.log('data.success:', data.success);
            
            // Verificar si la respuesta es exitosa
            if (!response.ok || !data.success) {
                console.log('Login fallido:', data.error || 'Credenciales incorrectas');
                // Mostrar error al usuario
                showError(loginForm, data.error || 'Correo electrónico o contraseña incorrectos');
                return; // Detener ejecución aquí, no redirigir
            }
            
            // Si llegamos aquí, el login fue exitoso
            console.log('Login exitoso, procesando respuesta...');
            console.log('data.user:', data.user);
            console.log('data.token:', data.token);
            
            // Guardar sesión de forma segura
            if (window.security) {
                window.security.saveSession(data.token, data.user);
            } else {
                // Fallback
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);
            }
            
            console.log('Sesión guardada de forma segura');
            
            // Disparar evento de login para actualizar la UI
            console.log('Disparando evento auth:login...');
            document.dispatchEvent(new CustomEvent('auth:login', { 
                detail: { user: data.user } 
            }));
            
            // Cerrar el modal
            console.log('Cerrando modal...');
            loginModal.classList.remove('active');
            document.body.style.overflow = 'auto';
            
            // Redirigir al usuario solo si todo fue exitoso
            console.log('Redirigiendo a perfil.html...');
            window.location.href = 'pages/user/perfil.html';
            
        } catch (error) {
            console.error('Error en el login:', error);
            console.error('Stack trace:', error.stack);
            // Mostrar error al usuario y no redirigir
            showError(loginForm, error.message || 'Error al iniciar sesión. Inténtalo de nuevo.');
        }
    });
} else {
    console.log('ERROR: loginForm no encontrado');
}

// Envío de formulario de registro
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    
    // Mostrar indicador de carga
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registrando...';
    
    try {
        // Obtener valores del formulario
        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            country: document.getElementById('country').value,
            birthdate: document.getElementById('birthdate').value,
            street: document.getElementById('street').value.trim(),
            streetNumber: document.getElementById('streetNumber').value.trim(),
            acceptTerms: document.getElementById('terms').checked,
            acceptMarketing: document.getElementById('marketing').checked
        };
        
        console.log('Enviando datos al servidor:', formData);
        
        // Validación básica
        if (!formData.acceptTerms) {
            throw new Error('Debes aceptar los Términos y Condiciones');
        }
        
        console.log('Enviando datos de registro al servidor...');
        
        // Preparar los datos para el servidor
        const userData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            country: formData.country,
            birthdate: formData.birthdate,
            street: formData.street,
            streetNumber: formData.streetNumber,
            acceptTerms: true, // Ya validado anteriormente
            acceptMarketing: formData.acceptMarketing || false
        };
        
        console.log('Enviando solicitud de registro...');
        console.log('URL:', 'http://localhost:5500/api/register');
        console.log('Datos enviados:', JSON.stringify(userData, null, 2));
        
        try {
            const response = await fetch('http://localhost:5500/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',  // Importante para enviar cookies
                body: JSON.stringify(userData)
            });
            
            console.log('Respuesta recibida - Estado:', response.status);
            console.log('Headers de la respuesta:', Object.fromEntries(response.headers.entries()));
            
            const responseText = await response.text();
            console.log('Texto de la respuesta:', responseText);
            
            let data = {};
            try {
                data = responseText ? JSON.parse(responseText) : {};
                console.log('Datos de la respuesta:', data);
            } catch (parseError) {
                console.error('Error al analizar la respuesta JSON:', parseError);
                throw new Error('Error en la respuesta del servidor');
            }
            
            if (!response.ok) {
                const errorMessage = data.error || data.message || 
                                  `Error ${response.status}: ${response.statusText}`;
                console.error('Error en la respuesta:', errorMessage);
                throw new Error(`Error ${response.status}: ${errorMessage}`);
            }
            
            if (data.token) {
                localStorage.setItem('authToken', data.token);
                console.log('Token JWT guardado en localStorage');
                
                // Mostrar mensaje de éxito
                alert('¡Registro exitoso! Has sido autenticado automáticamente.');
                
                // Resetear formulario
                registerForm.reset();
                
                // Cerrar el modal de registro
                closeLoginModal();
                
                // Redirigir al perfil
                window.location.href = 'pages/user/perfil.html';
            } else {
                console.error('No se recibió token en la respuesta:', data);
                throw new Error('Error en la autenticación: no se recibió token');
            }
        } catch (error) {
            console.error('Error en la solicitud de registro:', error);
            throw error; // Relanzar para que sea manejado por el catch externo
        } // Asegúrate de que esta página exista
        
    } catch (error) {
        console.error('Error en el registro:', error);
        showError(registerForm, error.message || 'Error al registrar el usuario. Inténtalo de nuevo.');
    } finally {
        // Restaurar el botón
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
});

// Efecto de scroll suave para los enlaces de navegación
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Efecto de carga inicial
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Animación de elementos al hacer scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.fadeInUp');
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    // Ejecutar al cargar y al hacer scroll
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll();
});

// Cambiar estilo del header al hacer scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(0, 0, 0, 0.98)';
        header.style.padding = '15px 0';
    } else {
        header.style.background = 'rgba(0, 0, 0, 0.95)';
        header.style.padding = '20px 0';
    }
});

// Verificar estado de autenticación al cargar la página
function checkAuthStatus() {
    console.log('=== VERIFICANDO ESTADO DE AUTENTICACIÓN ===');
    
    // Usar el sistema de seguridad si está disponible
    const isAuthenticated = window.security ? window.security.isTokenValid() : 
                           (localStorage.getItem('token') && localStorage.getItem('user'));
    
    console.log('Usuario autenticado:', isAuthenticated);
    
    if (isAuthenticated) {
        // El usuario está autenticado
        const userData = window.security ? window.security.getCurrentUser() : 
                        JSON.parse(localStorage.getItem('user'));
        
        console.log('Datos del usuario:', userData);
        
        // Ocultar botón de login
        const navLogin = document.getElementById('navLogin');
        const navUser = document.getElementById('navUser');
        
        console.log('Elementos navLogin:', navLogin);
        console.log('Elementos navUser:', navUser);
        
        if (navLogin) navLogin.style.display = 'none';
        if (navUser) navUser.style.display = 'block';
        
        // Cargar avatar del usuario
        const userAvatar = document.getElementById('userAvatar');
        if (userData && userData.avatar && userAvatar) {
            userAvatar.src = userData.avatar;
            console.log('Avatar del usuario cargado:', userData.avatar);
        } else {
            // También verificar localStorage directamente
            const savedUser = localStorage.getItem('auth_user');
            if (savedUser) {
                try {
                    const user = JSON.parse(savedUser);
                    if (user.avatar && userAvatar) {
                        userAvatar.src = user.avatar;
                        console.log('Avatar cargado desde localStorage:', user.avatar);
                    }
                } catch (e) {
                    console.error('Error al leer avatar desde localStorage:', e);
                }
            }
        }
        
        console.log('Botón de login ocultado');
        if (navUser) {
            navUser.style.display = 'block';
            console.log('Perfil de usuario mostrado');
            
            // Actualizar nombre de usuario
            const userNameElement = navUser.querySelector('.user-name');
            if (userNameElement && userData) {
                userNameElement.textContent = `${userData.firstName} ${userData.lastName}`;
                console.log('Nombre de usuario actualizado:', `${userData.firstName} ${userData.lastName}`);
            }
            
            // Actualizar avatar si existe
            const userAvatar = navUser.querySelector('.user-avatar img');
            if (userAvatar && userData && userData.avatar) {
                userAvatar.src = userData.avatar;
                console.log('Avatar actualizado:', userData.avatar);
            }
        }
        
        console.log('Usuario autenticado exitosamente');
    } else {
        console.log('Usuario no autenticado');
    }
}

// Escuchar eventos de autenticación
document.addEventListener('auth:login', (event) => {
    console.log('Login event received:', event.detail);
    checkAuthStatus();
});

document.addEventListener('auth:logout', (event) => {
    console.log('Logout event received:', event.detail);
    // Mostrar botón de login y ocultar perfil
    const navLogin = document.getElementById('navLogin');
    const navUser = document.getElementById('navUser');
    
    if (navLogin) navLogin.style.display = 'block';
    if (navUser) navUser.style.display = 'none';
});

// Evento de logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Usar el sistema de seguridad si está disponible
        if (window.security) {
            window.security.logout();
        } else {
            // Fallback
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            
            // Disparar evento de logout
            document.dispatchEvent(new CustomEvent('auth:logout', { 
                detail: {} 
            }));
            
            // Redirigir al inicio
            window.location.href = '../../index.html';
        }
    });
}

// Verificar autenticación al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, verificando autenticación...');
    setTimeout(checkAuthStatus, 100); // Pequeño retraso para asegurar que todo esté listo
    
    // Manejar el menú dropdown del perfil
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userMenuBtn && userDropdown) {
        console.log('Elementos del menú encontrados:', userMenuBtn, userDropdown);
        
        userMenuBtn.addEventListener('click', function(e) {
            console.log('Clic en el perfil detectado');
            e.stopPropagation();
            userDropdown.classList.toggle('show');
            console.log('Clase show toggled:', userDropdown.classList.contains('show'));
        });
        
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', function() {
            console.log('Clic fuera detectado, cerrando menú');
            userDropdown.classList.remove('show');
        });
        
        // Evitar que el menú se cierre al hacer clic dentro
        userDropdown.addEventListener('click', function(e) {
            console.log('Clic dentro del menú');
            e.stopPropagation();
        });
    } else {
        console.log('No se encontraron los elementos del menú:', userMenuBtn, userDropdown);
    }
    
    // Fallback adicional para el login - Event listener directo
    const loginFormAlt = document.getElementById('loginForm');
    if (loginFormAlt) {
        console.log('Agregando fallback event listener al loginForm');
        loginFormAlt.addEventListener('submit', function(e) {
            console.log('=== FALLBACK FORM SUBMIT DETECTADO ===');
            // No prevenir el comportamiento por defecto para ver qué pasa
        });
    }
});
