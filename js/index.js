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
const API_URL = 'http://localhost:3306/api';

// Mostrar mensaje de error
function showError(element, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = 'var(--primary-color)';
    errorDiv.style.fontSize = '0.8rem';
    errorDiv.style.marginTop = '5px';
    
    // Eliminar mensajes de error anteriores
    const existingError = element.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    element.parentNode.appendChild(errorDiv);
    element.focus();
}

// Eliminar mensajes de error
function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.remove());
}

// Envío de formulario de inicio de sesión
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error al iniciar sesión');
        }
        
        // Guardar información del usuario (en un caso real, guardarías un token JWT)
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirigir al usuario
        window.location.href = 'perfil.html';
        
    } catch (error) {
        console.error('Error:', error);
        showError(loginForm, error.message || 'Error al iniciar sesión. Inténtalo de nuevo.');
    }
});

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
                window.location.href = 'perfil.html';
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
        header.style.background = 'rgba(29, 53, 87, 0.98)';
        header.style.padding = '15px 0';
    } else {
        header.style.background = 'rgba(29, 53, 87, 0.95)';
        header.style.padding = '20px 0';
    }
});