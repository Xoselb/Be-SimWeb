// header.js - Sistema mejorado para el header con perfil premium

document.addEventListener('DOMContentLoaded', function() {
    
    // Check authentication status
    function checkAuth() {
        const isLoggedIn = window.auth && window.auth.isAuthenticated();
        const navUser = document.getElementById('navUser');
        const navLogin = document.getElementById('navLogin');
        
        if (isLoggedIn) {
            // Show user menu and hide login button
            if (navUser) navUser.style.display = 'block';
            if (navLogin) navLogin.style.display = 'none';
            
            // Load user data
            const userData = window.auth.getCurrentUser();
            const userAvatar = document.getElementById('userAvatar');
            
            if (userData) {
                // Update avatar
                if (userData.avatar && userAvatar) {
                    userAvatar.src = userData.avatar;
                    console.log('Avatar del header cargado desde userData:', userData.avatar);
                }
                
                // Update user info in dropdown
                updateUserInfo(userData);
            }
            
            // También verificar si hay avatar guardado en localStorage directamente
            const savedUser = localStorage.getItem('auth_user');
            if (savedUser) {
                try {
                    const user = JSON.parse(savedUser);
                    if (user.avatar && userAvatar) {
                        userAvatar.src = user.avatar;
                        console.log('Avatar del header cargado desde localStorage:', user.avatar);
                    }
                    if (!userData) {
                        updateUserInfo(user);
                    }
                } catch (e) {
                    console.error('Error al leer usuario desde localStorage:', e);
                }
            }
        } else {
            // Show login button and hide user menu
            if (navUser) navUser.style.display = 'none';
            if (navLogin) navLogin.style.display = 'block';
        }
    }
    
    // Update user information in dropdown
    function updateUserInfo(userData) {
        // Update user name
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(element => {
            const name = userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Usuario';
            element.textContent = name;
        });
        
        // Update user email
        const userEmailElements = document.querySelectorAll('.user-email');
        userEmailElements.forEach(element => {
            element.textContent = userData.email || 'user@example.com';
        });
        
        // Update user status
        const userStatusElements = document.querySelectorAll('.user-status');
        userStatusElements.forEach(element => {
            element.textContent = userData.emailVerified ? 'Verificado' : 'No verificado';
            element.style.background = userData.emailVerified 
                ? 'linear-gradient(135deg, rgba(46, 204, 113, 0.2), rgba(46, 204, 113, 0.1))'
                : 'linear-gradient(135deg, rgba(241, 196, 15, 0.2), rgba(241, 196, 15, 0.1))';
            element.style.borderColor = userData.emailVerified 
                ? 'rgba(46, 204, 113, 0.3)'
                : 'rgba(241, 196, 15, 0.3)';
            element.style.color = userData.emailVerified ? '#2ecc71' : '#f1c40f';
        });
        
        console.log('Información de usuario actualizada en header');
    }
    
    // Handle dropdown menu
    function setupDropdown() {
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userDropdown = document.getElementById('userDropdown');
        
        if (userMenuBtn && userDropdown) {
            // Toggle dropdown
            userMenuBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                userDropdown.classList.toggle('show');
                
                // Add animation class
                if (userDropdown.classList.contains('show')) {
                    userDropdown.style.animation = 'fadeInUp 0.3s ease-out';
                }
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', function(e) {
                if (!userDropdown.contains(e.target) && !userMenuBtn.contains(e.target)) {
                    userDropdown.classList.remove('show');
                }
            });
            
            // Prevent menu from closing when clicking inside
            userDropdown.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
    }
    
    // Handle logout
    function setupLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (window.auth && typeof window.auth.logout === 'function') {
                    window.auth.logout();
                } else {
                    // Fallback in case auth.js is not loaded
                    window.location.href = '/pages/auth/login.html';
                }
            });
        }
    }
    
    // Mobile menu functionality
    function setupMobileMenu() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const mainNav = document.querySelector('.main-nav');
        
        if (mobileMenuBtn && mainNav) {
            mobileMenuBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                mainNav.classList.toggle('show');
                this.classList.toggle('active');
            });
            
            // Close mobile menu when clicking on a nav link
            const navLinks = mainNav.querySelectorAll('a');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mainNav.classList.remove('show');
                    mobileMenuBtn.classList.remove('active');
                });
            });
            
            // Close mobile menu when clicking outside
            document.addEventListener('click', function(e) {
                if (!mainNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                    mainNav.classList.remove('show');
                    mobileMenuBtn.classList.remove('active');
                }
            });
        }
    }
    
    // Initialize all functionality
    function init() {
        checkAuth();
        setupDropdown();
        setupLogout();
        setupMobileMenu();
    }
    
    // Make sure auth.js is loaded
    if (window.auth) {
        init();
    } else {
        // If auth.js isn't loaded yet, wait for it
        const checkAuthReady = setInterval(function() {
            if (window.auth) {
                clearInterval(checkAuthReady);
                init();
            }
        }, 100);
    }
});
