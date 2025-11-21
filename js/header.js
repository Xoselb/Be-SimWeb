// header.js - Common header functionality for all pages

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
            if (userData && userData.avatar && userAvatar) {
                userAvatar.src = userData.avatar;
            }
        } else {
            // Show login button and hide user menu
            if (navUser) navUser.style.display = 'none';
            if (navLogin) navLogin.style.display = 'block';
        }
    }
    
    // Handle dropdown menu
    function setupDropdown() {
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userDropdown = document.getElementById('userDropdown');
        
        if (userMenuBtn && userDropdown) {
            userMenuBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                userDropdown.classList.toggle('show');
                
                // Rotate the arrow icon
                const icon = this.querySelector('i');
                if (icon) {
                    icon.style.transform = userDropdown.classList.contains('show') 
                        ? 'rotate(180deg)' 
                        : 'rotate(0deg)';
                }
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', function() {
                userDropdown.classList.remove('show');
                const icon = userMenuBtn.querySelector('i');
                if (icon) {
                    icon.style.transform = 'rotate(0deg)';
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
                    window.location.href = 'login.html';
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