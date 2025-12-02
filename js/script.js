function redirectToLogin() {
    showLogin();
}

function redirectToSignup() {
    showSignup();
}

function showLogin() {
    const login = document.getElementById('loginModal');
    const signup = document.getElementById('signupModal');
    if (login) {
        login.classList.remove('hidden');
        clearMessages();
    }
    if (signup) signup.classList.add('hidden');
}

function showSignup() {
    const signup = document.getElementById('signupModal');
    const login = document.getElementById('loginModal');
    if (signup) {
        signup.classList.remove('hidden');
        clearMessages();
    }
    if (login) login.classList.add('hidden');
}

function closeAuthModal() {
    const login = document.getElementById('loginModal');
    const signup = document.getElementById('signupModal');
    if (login) login.classList.add('hidden');
    if (signup) signup.classList.add('hidden');
    clearMessages();
}

function showMessage(containerId, message, type = 'error') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `<div class="${type}-message">${message}</div>`;
    }
}

function clearMessages() {
    const msg1 = document.getElementById('authMessages');
    const msg2 = document.getElementById('authMessages2');
    if (msg1) msg1.innerHTML = '';
    if (msg2) msg2.innerHTML = '';
}

// Fallback AuthManager class in case external script doesn't load
if (typeof window.AuthManager === 'undefined') {
    console.log('ðŸ”§ Creating fallback AuthManager class...');
    
    window.AuthManager = class AuthManager {
        constructor() {
            this.baseURL = null;
            this.token = localStorage.getItem('token');
            // Don't initialize config immediately, wait for window to be ready
            this.configInitialized = false;
        }

        async initializeConfig() {
            try {
                // Wait for appConfig to be available
                let attempts = 0;
                while (!window.appConfig && attempts < 50) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    attempts++;
                }
                
                if (!window.appConfig) {
                    throw new Error('AppConfig not available after waiting');
                }
                
                this.baseURL = window.appConfig.getBackendUrl();
                this.configInitialized = true;
                console.log('ðŸ”§ Fallback AuthManager initialized with baseURL:', this.baseURL);
            } catch (error) {
                console.error('Failed to load config, using fallback URL:', error);
                // Fallback to production URL if config fails
                this.baseURL = "https://beeboard-production-b072.up.railway.app/api"
                this.configInitialized = true;
            }
        }

        async ensureConfigLoaded() {
            if (!this.configInitialized) {
                await this.initializeConfig();
            }
        }

        hashPassword(password) {
            if (typeof CryptoJS !== 'undefined') {
                return CryptoJS.SHA256(password).toString();
            } else {
                console.error('âŒ CryptoJS not available for password hashing');
                return password; // Fallback - not secure but allows testing
            }
        }

        async signup(name, email, password) {
            try {
                await this.ensureConfigLoaded();
                console.log('ðŸŒ Making signup request to:', `${this.baseURL}/user/signup`);
                
                const hashedPassword = this.hashPassword(password);
                const response = await fetch(`${this.baseURL}/user/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password: hashedPassword })
                });
                
                console.log('ðŸ“¡ Response status:', response.status);
                const data = await response.json();
                console.log('ðŸ“ Response data:', data);
                
                if (data.success) {
                    this.token = data.token;
                    localStorage.setItem('token', this.token);
                    localStorage.setItem('user_data', JSON.stringify(data.user));
                    return { success: true, user: data.user };
                }
                return { success: false, message: data.message };
            } catch (error) {
                console.error('âŒ Signup error:', error);
                return { success: false, message: 'Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ø§ØªØµØ§Ù„: ' + error.message };
            }
        }

        async login(email, password) {
            try {
                await this.ensureConfigLoaded();
                console.log('ðŸŒ Making login request to:', `${this.baseURL}/user/login`);
                
                const hashedPassword = this.hashPassword(password);
                const response = await fetch(`${this.baseURL}/user/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password: hashedPassword })
                });
                
                console.log('ðŸ“¡ Response status:', response.status);
                const data = await response.json();
                console.log('ðŸ“ Response data:', data);
                
                if (data.success) {
                    this.token = data.token;
                    localStorage.setItem('token', this.token);
                    localStorage.setItem('user_data', JSON.stringify(data.user));
                    return { success: true, user: data.user };
                }
                return { success: false, message: data.message };
            } catch (error) {
                console.error('âŒ Login error:', error);
                return { success: false, message: 'Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ø§ØªØµØ§Ù„: ' + error.message };
            }
        }

        isAuthenticated() {
            return !!localStorage.getItem('token');
        }

        getCurrentUser() {
            const userData = localStorage.getItem('user_data');
            return userData ? JSON.parse(userData) : null;
        }
    };
    
    console.log('âœ… Fallback AuthManager class created');
}

// Authentication form handlers for dashboard modals
$(document).ready(function() {
    console.log('ðŸ“ Dashboard script loaded');
    
    // Wait for all scripts to load and check dependencies
    function waitForDependencies() {
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds max
            
            function checkDependencies() {
                attempts++;
                console.log(`ðŸ” Checking dependencies... attempt ${attempts}`);
                
                const cryptoLoaded = typeof CryptoJS !== 'undefined';
                const authManagerClassLoaded = typeof window.AuthManager !== 'undefined';
                const authManagerInstanceLoaded = typeof window.authManager !== 'undefined';
                
                console.log('CryptoJS loaded:', cryptoLoaded);
                console.log('AuthManager class loaded:', authManagerClassLoaded);
                console.log('AuthManager instance loaded:', authManagerInstanceLoaded);
                
                if (cryptoLoaded && (authManagerClassLoaded || authManagerInstanceLoaded)) {
                    console.log('âœ… All dependencies loaded');
                    resolve(true);
                } else if (attempts >= maxAttempts) {
                    console.error('âŒ Dependencies failed to load after 5 seconds');
                    resolve(false);
                } else {
                    setTimeout(checkDependencies, 100);
                }
            }
            
            checkDependencies();
        });
    }
    
    // Test connection to backend
    async function testBackendConnection() {
        try {
            const response = await fetch(`${window.appConfig.getBackendUrl()}/user/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ test: true })
            });
            console.log('ðŸŒ Backend connection test - Status:', response.status);
        } catch (error) {
            console.error('âŒ Backend connection failed:', error);
            console.error('âŒ Make sure PHP server is running on port 3000');
        }
    }
    
    // Initialize authentication after dependencies are loaded
    async function initializeAuth() {
        const dependenciesLoaded = await waitForDependencies();
        
        if (!dependenciesLoaded) {
            console.error('âŒ Cannot initialize auth - dependencies missing');
            return;
        }
        
        // Ensure AuthManager instance exists
        if (!window.authManager) {
            if (typeof window.AuthManager !== 'undefined') {
                console.log('ðŸ”§ Creating AuthManager instance...');
                window.authManager = new window.AuthManager();
                console.log('âœ… AuthManager instance created');
            } else {
                console.error('âŒ AuthManager class not available');
                return;
            }
        } else {
            console.log('âœ… AuthManager instance already exists');
        }
        
        // Verify AuthManager is working
        if (window.authManager && window.authManager.baseURL) {
            console.log('âœ… AuthManager ready with baseURL:', window.authManager.baseURL);
        } else {
            console.error('âŒ AuthManager not properly initialized');
        }
        
        // Test backend connection
        await testBackendConnection();
    }
    
    // Start initialization
    initializeAuth();
    
    $('#loginForm').on('submit', async function(e) {
        e.preventDefault();
        console.log('ðŸ” Login form submitted');
        
        const btn = $('#loginBtn');
        btn.prop('disabled', true).text('Ø¬Ø§Ø±ÙŠ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„...');
        
        const email = $('#loginEmail').val().trim();
        const password = $('#loginPassword').val();
        
        // Frontend validation
        if (!email || !email.includes('@')) {
            showMessage('authMessages', 'ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ Ø¨Ø±ÙŠØ¯ Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ ØµØ§Ù„Ø­');
            btn.prop('disabled', false).text('ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„');
            return;
        }
        
        if (!password || password.length < 1) {
            showMessage('authMessages', 'ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±');
            btn.prop('disabled', false).text('ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„');
            return;
        }
        
        console.log('ðŸ“§ Email:', email);
        console.log('ðŸ”’ Password length:', password.length);
        
        if (!window.authManager) {
            console.error('âŒ AuthManager not available');
            showMessage('authMessages', 'Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ù†Ø¸Ø§Ù… - AuthManager ØºÙŠØ± Ù…ØªÙˆÙØ±');
            btn.prop('disabled', false).text('ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„');
            return;
        }
        
        try {
            console.log('ðŸŒ Calling login...');
            const result = await window.authManager.login(email, password);
            console.log('ðŸ“ Login result:', result);
            
            if (result && result.success) {
                showMessage('authMessages', 'ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¨Ù†Ø¬Ø§Ø­', 'success');
                setTimeout(() => {
                    closeAuthModal();
                    // Refresh page or redirect to main app
                    window.location.href = 'homepage.html';
                }, 1000);
            } else {
                const errorMsg = result ? result.message : 'Ø®Ø·Ø£ ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ';
                showMessage('authMessages', errorMsg);
            }
        } catch (error) {
            console.error('âŒ Login error:', error);
            showMessage('authMessages', 'Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø®Ø§Ø¯Ù…');
        }
        
        btn.prop('disabled', false).text('ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„');
    });

    $('#signupForm').on('submit', async function(e) {
        e.preventDefault();
        console.log('ðŸ“ Signup form submitted via dashboard script');
        
        // Check if auth-new.js is loaded and handling this
        if (window.authManager && window.authManager.signup) {
            console.log('ðŸ”„ Delegating to auth-new.js handler...');
            return; // Let auth-new.js handle it
        }
        
        // Fallback handler only if auth-new.js is not available
        console.log('ðŸ“ Using fallback signup handler');
        
        // Prevent double submission
        if (window.signupInProgress) {
            console.log('ðŸš« Signup already in progress, ignoring duplicate request');
            return;
        }
        
        window.signupInProgress = true;
        const btn = $('#signupBtn');
        btn.prop('disabled', true).text('Ø¬Ø§Ø±ÙŠ Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø­Ø³Ø§Ø¨...');
        
        try {
            const name = $('#signupName').val().trim();
            const email = $('#signupEmail').val().trim();
            const password = $('#signupPassword').val();
            const confirmPassword = $('#confirmPassword').val();
            
            // Frontend validation
            if (!name || name.length < 2) {
                showMessage('authMessages2', 'Ø§Ù„Ø§Ø³Ù… ÙŠØ¬Ø¨ Ø£Ù† ÙŠÙƒÙˆÙ† Ø­Ø±ÙÙŠÙ† Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„');
                return;
            }
            
            if (!email || !email.includes('@')) {
                showMessage('authMessages2', 'ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ Ø¨Ø±ÙŠØ¯ Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ ØµØ§Ù„Ø­');
                return;
            }
            
            if (!password || password.length < 6) {
                showMessage('authMessages2', 'ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± ÙŠØ¬Ø¨ Ø£Ù† ØªÙƒÙˆÙ† 6 Ø£Ø­Ø±Ù Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„');
                return;
            }
            
            if (password !== confirmPassword) {
                showMessage('authMessages2', 'ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± ØºÙŠØ± Ù…ØªØ·Ø§Ø¨Ù‚Ø©');
                return;
            }
            
            if (!window.authManager) {
                console.error('âŒ AuthManager not available');
                showMessage('authMessages2', 'Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ù†Ø¸Ø§Ù… - AuthManager ØºÙŠØ± Ù…ØªÙˆÙØ±');
                return;
            }
            
            console.log('ðŸŒ Calling signup...');
            const result = await window.authManager.signup(name, email, password);
            console.log('ðŸ“ Signup result:', result);
            
            if (result && result.success) {
                showMessage('authMessages2', 'ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø­Ø³Ø§Ø¨ Ø¨Ù†Ø¬Ø§Ø­', 'success');
                setTimeout(() => {
                    closeAuthModal();
                    // Refresh page or redirect to main app
                    window.location.href = '../index.html';
                }, 1000);
            } else {
                const errorMsg = result ? result.message : 'Ø®Ø·Ø£ ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ';
                showMessage('authMessages2', errorMsg);
            }
        } catch (error) {
            console.error('âŒ Signup error:', error);
            showMessage('authMessages2', 'Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø®Ø§Ø¯Ù…');
        } finally {
            // Always reset the signup state
            window.signupInProgress = false;
            btn.prop('disabled', false).text('Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨');
        }
    });
});

// Debug function to test authentication
window.testAuth = function() {
    console.log('ðŸ”§ Testing authentication system...');
    console.log('CryptoJS available:', typeof CryptoJS !== 'undefined');
    console.log('AuthManager class available:', typeof window.AuthManager !== 'undefined');
    console.log('AuthManager instance available:', typeof window.authManager !== 'undefined');
    
    if (window.authManager) {
        console.log('AuthManager baseURL:', window.authManager.baseURL);
        console.log('Current token:', window.authManager.token ? 'exists' : 'none');
    }
    
    // Test login with dummy data
    if (window.authManager) {
        console.log('Testing with dummy login...');
        window.authManager.login('test@example.com', 'testpassword').then(result => {
            console.log('Dummy login result:', result);
        });
    }
};

// Manual initialization function for debugging
window.initAuthManually = function() {
    console.log('ðŸ”§ Manual AuthManager initialization...');
    
    // Force create AuthManager
    if (typeof window.AuthManager !== 'undefined') {
        window.authManager = new window.AuthManager();
        console.log('âœ… AuthManager manually created');
        console.log('AuthManager baseURL:', window.authManager.baseURL);
        return true;
    } else {
        console.error('âŒ AuthManager class still not available');
        return false;
    }
};

// Test authentication manually
window.testAuthLogin = async function(email = 'test@example.com', password = 'testpass') {
    console.log('ðŸ§ª Testing auth login manually...');
    
    if (!window.authManager) {
        console.error('âŒ No AuthManager available');
        return;
    }
    
    try {
        const result = await window.authManager.login(email, password);
        console.log('ðŸ§ª Test login result:', result);
        return result;
    } catch (error) {
        console.error('âŒ Test login error:', error);
        return { success: false, message: error.message };
    }
};

function showDemo() {
    // Show demo functionality
    alert('Ø§Ù„Ø¹Ø±Ø¶ Ø§Ù„ØªÙˆØ¶ÙŠØ­ÙŠ Ù‚Ø±ÙŠØ¨Ø§Ù‹!');
}

function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to clicked button
    const clickedButton = event.target;
    clickedButton.classList.add('active');
}

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    // Add scroll effect to navbar
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
    
    // Add animation to feature cards when they come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
    
    // Add hover effects to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Auto-rotate showcase tabs
    let currentTab = 0;
    const tabs = ['dashboard', 'projects', 'cards'];
    
    setInterval(function() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        if (tabButtons.length > 0) {
            currentTab = (currentTab + 1) % tabs.length;
            
            // Remove active from all
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active to current
            tabButtons[currentTab].classList.add('active');
            document.getElementById(tabs[currentTab] + '-tab').classList.add('active');
        }
    }, 5000); // Change every 5 seconds
});