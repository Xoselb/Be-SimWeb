document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-slide');
    const nextBtn = document.querySelector('.next-slide');
    let currentSlide = 0;
    let slideInterval;
    const slideDuration = 5000; // 5 segundos

    // Función para mostrar una diapositiva específica
    function showSlide(index) {
        // Ocultar todas las diapositivas
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Mostrar la diapositiva actual
        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    // Función para ir a la siguiente diapositiva
    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    // Función para ir a la diapositiva anterior
    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    // Iniciar el carrusel automático
    function startSlideShow() {
        slideInterval = setInterval(nextSlide, slideDuration);
    }

    // Detener el carrusel automático
    function stopSlideShow() {
        clearInterval(slideInterval);
    }

    // Event listeners para los botones de navegación
    nextBtn.addEventListener('click', () => {
        stopSlideShow();
        nextSlide();
        startSlideShow();
    });

    prevBtn.addEventListener('click', () => {
        stopSlideShow();
        prevSlide();
        startSlideShow();
    });

    // Event listeners para los puntos de navegación
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopSlideShow();
            showSlide(index);
            startSlideShow();
        });
    });

    // Pausar el carrusel cuando el ratón está sobre él
    const heroSection = document.querySelector('.hero');
    heroSection.addEventListener('mouseenter', stopSlideShow);
    heroSection.addEventListener('mouseleave', startSlideShow);

    // Iniciar el carrusel
    showSlide(0);
    startSlideShow();

    // Manejar el cambio de tamaño de la ventana
    window.addEventListener('resize', () => {
        // Asegurarse de que las imágenes se redimensionen correctamente
        slides.forEach(slide => {
            slide.style.backgroundSize = 'cover';
        });
    });
});
