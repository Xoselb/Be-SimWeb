document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const privacyPolicyLink = document.getElementById('privacyPolicyLink');
    const privacyPolicyModal = document.createElement('div');
    
    // Crear modal de política de privacidad
    function createPrivacyPolicyModal() {
        privacyPolicyModal.id = 'privacyPolicyModal';
        privacyPolicyModal.className = 'modal';
        privacyPolicyModal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Política de Privacidad</h2>
                <div class="modal-body">
                    <p>En cumplimiento de lo establecido en el Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo, de 27 de abril de 2016 (RGPD), le informamos que los datos personales que nos proporcione serán tratados por Be-SimWeb con la finalidad de atender su solicitud de contacto y mantenerle informado sobre nuestros servicios.</p>
                    <p>La base legal para el tratamiento de sus datos es su consentimiento, que podrá retirar en cualquier momento. Sus datos no serán cedidos a terceros, salvo obligación legal.</p>
                    <p>Puede ejercer sus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad, así como retirar su consentimiento, dirigiéndose a info@besimweb.com.</p>
                    <p>Para más información, consulte nuestra Política de Privacidad completa.</p>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary" id="acceptPrivacy">Aceptar</button>
                </div>
            </div>
        `;
        document.body.appendChild(privacyPolicyModal);
        
        // Cerrar modal al hacer clic en la X
        document.querySelector('.close-modal').addEventListener('click', closeModal);
        
        // Cerrar modal al hacer clic fuera del contenido
        privacyPolicyModal.addEventListener('click', function(e) {
            if (e.target === privacyPolicyModal) {
                closeModal();
            }
        });
        
        // Aceptar política
        document.getElementById('acceptPrivacy').addEventListener('click', function() {
            document.getElementById('privacyPolicy').checked = true;
            closeModal();
        });
        
        // Cerrar con Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    }
    
    function openModal() {
        privacyPolicyModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
        privacyPolicyModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Inicializar el modal
    createPrivacyPolicyModal();
    
    // Abrir modal al hacer clic en el enlace de política de privacidad
    if (privacyPolicyLink) {
        privacyPolicyLink.addEventListener('click', function(e) {
            e.preventDefault();
            openModal();
        });
    }
    
    // Validación del formulario
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Limpiar errores previos
        clearErrors();
        
        // Validar campos requeridos
        let isValid = true;
        const requiredFields = contactForm.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                showError(field, 'Este campo es obligatorio');
                isValid = false;
            }
        });
        
        // Validar email
        const emailField = document.getElementById('email');
        if (emailField.value && !isValidEmail(emailField.value)) {
            showError(emailField, 'Por favor, introduce un correo electrónico válido');
            isValid = false;
        }
        
        // Validar teléfono si se ha introducido
        const phoneField = document.getElementById('phone');
        if (phoneField.value && !isValidPhone(phoneField.value)) {
            showError(phoneField, 'Por favor, introduce un número de teléfono válido');
            isValid = false;
        }
        
        // Validar código postal
        const postalCodeField = document.getElementById('postalCode');
        if (postalCodeField.value && !isValidPostalCode(postalCodeField.value)) {
            showError(postalCodeField, 'Por favor, introduce un código postal válido');
            isValid = false;
        }
        
        // Si el formulario es válido, enviar datos
        if (isValid) {
            await submitContactForm();
        }
    });
    } // Cierre del if (contactForm)
    
    // Función para mostrar mensajes de error
    function showError(element, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = '#e74c3c';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '5px';
        
        // Insertar después del campo
        element.parentNode.appendChild(errorDiv);
        element.classList.add('error');
        
        // Desplazarse al primer error
        if (!document.querySelector('.scroll-to-error')) {
            errorDiv.classList.add('scroll-to-error');
            errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Eliminar la clase después de la animación
            setTimeout(() => {
                errorDiv.classList.remove('scroll-to-error');
            }, 1000);
        }
    }
    
    // Función para limpiar errores
    function clearErrors() {
        // Eliminar mensajes de error
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        
        // Eliminar clase de error de los campos
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    }
    
    // Validaciones
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }
    
    function isValidPhone(phone) {
        const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{6,}$/;
        return re.test(phone);
    }
    
    function isValidPostalCode(postalCode) {
        // Validación básica para códigos postales españoles (5 dígitos)
        const re = /^\d{5}$/;
        return re.test(postalCode);
    }
    
    // Enviar formulario
    async function submitContactForm() {
        const formData = new FormData(contactForm);
        const formObject = {};
        
        // Convertir FormData a objeto
        formData.forEach((value, key) => {
            formObject[key] = value;
        });
        
        try {
            // Mostrar indicador de carga
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            
            // Aquí iría la llamada a tu API
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formObject)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // Redirigir a la página de pago con los datos necesarios
                const params = new URLSearchParams({
                    nombre: formObject.firstName + ' ' + formObject.lastName,
                    email: formObject.email,
                    telefono: formObject.phone || '',
                    fecha_reserva: new Date().toISOString().split('T')[0],
                    vehiculo: 'Coche de prueba', // Esto debería venir del formulario de reserva
                    paquete: 'Paquete Básico', // Esto debería venir del formulario de reserva
                    precio: '299', // Esto debería venir del formulario de reserva
                    notas: formObject.message || ''
                });
                
                window.location.href = `../shop/pago.html?${params.toString()}`;
            } else {
                throw new Error(result.message || 'Error al enviar el mensaje');
            }
        } catch (error) {
            console.error('Error:', error);
            // Mostrar mensaje de error
            const errorContainer = document.createElement('div');
            errorContainer.className = 'error-message';
            errorContainer.textContent = 'Error al enviar el mensaje. Por favor, inténtalo de nuevo más tarde.';
            errorContainer.style.margin = '15px 0';
            contactForm.insertBefore(errorContainer, contactForm.firstChild);
        } finally {
            // Restaurar botón
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    }
    
    // Mostrar mensaje de éxito
    function showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="success-text">${message}</div>
        `;
        
        // Insertar al principio del formulario
        contactForm.insertBefore(successDiv, contactForm.firstChild);
        
        // Desplazarse al mensaje
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Ocultar mensaje después de 5 segundos
        setTimeout(() => {
            successDiv.style.opacity = '0';
            setTimeout(() => {
                successDiv.remove();
            }, 300);
        }, 5000);
    }
    
    // Cargar provincias dinámicamente basadas en el país seleccionado
    const countrySelect = document.getElementById('country');
    if (countrySelect) {
        countrySelect.addEventListener('change', function() {
            const provinceField = document.getElementById('province');
            // Aquí podrías cargar provincias basadas en el país seleccionado
            // Por ahora, solo un ejemplo básico
            if (this.value === 'es') {
                // En una implementación real, harías una petición a tu API
                // para obtener las provincias de España
                console.log('Cargando provincias de España...');
            }
        });
    }
});
