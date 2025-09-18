document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-slide');
    const nextBtn = document.querySelector('.next-slide');
    const heroTexts = document.querySelectorAll('.hero-text');
    let currentSlide = 0;
    let slideInterval;
    const slideDuration = 10000; // 10 segundos

    // Función para mostrar una diapositiva específica
    function showSlide(index) {
        // Ocultar todas las diapositivas
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Mostrar la diapositiva actual
        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
        
        // Actualizar el texto según la diapositiva actual
        updateHeroText(currentSlide);
    }
    
    // Función para actualizar el texto del héroe según la diapositiva
    function updateHeroText(slideIndex) {
        // Ocultar todos los textos
        heroTexts.forEach(text => {
            text.classList.remove('active');
        });
        
        // Determinar qué texto mostrar basado en el índice de la diapositiva
        let textIndex = 0;
        if (slideIndex === 0 || slideIndex === 1) {
            textIndex = 0; // Simracing
        } else if (slideIndex === 2 || slideIndex === 3) {
            textIndex = 1; // Taller
        } else if (slideIndex === 4 || slideIndex === 5) {
            textIndex = 2; // Track Days
        } else {
            textIndex = 0; // Por defecto
        }
        
        // Mostrar el texto correspondiente
        if (heroTexts[textIndex]) {
            heroTexts[textIndex].classList.add('active');
        }
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
