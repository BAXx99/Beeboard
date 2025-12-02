class AppConfig {
    constructor() {
        this.apiUrl = this.detectEnvironment();
        this.environment = window.location.hostname === 'localhost' ? 'local' : 'production';
        this.initialized = true;
        this.ready = true;
    }

    detectEnvironment() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'https://beeboard-production-b072.up.railway.app';
        }
        return 'https://beeboard-production-b072.up.railway.app';
    }

    getApiUrl() {
        return this.apiUrl;
    }

    getBackendUrl() {
        return `${this.apiUrl}/api`;
    }

    getFrontendUrl() {
        return `${this.apiUrl}/Frontend`;
    }

    isLocal() {
        return this.environment === 'local';
    }

    isReady() {
        return this.ready && this.initialized;
    }

    // Global error handling utility
    static handleApiResponse(response, data, defaultMessages = {}) {
        const messages = {
            400: 'Ø·Ù„Ø¨ ØºÙŠØ± ØµØ­ÙŠØ­',
            401: 'Ø§Ù†ØªÙ‡Øª ØµÙ„Ø§Ø­ÙŠØ© Ø§Ù„Ø¬Ù„Ø³Ø©ØŒ ÙŠØ±Ø¬Ù‰ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰',
            403: 'Ù„ÙŠØ³ Ù„Ø¯ÙŠÙƒ ØµÙ„Ø§Ø­ÙŠØ© Ù„Ù„Ù‚ÙŠØ§Ù… Ø¨Ù‡Ø°Ø§ Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡',
            404: 'Ø§Ù„Ø¹Ù†ØµØ± Ø§Ù„Ù…Ø·Ù„ÙˆØ¨ ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯',
            500: 'Ø­Ø¯Ø« Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ø®Ø§Ø¯Ù…ØŒ ÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù„Ø§Ø­Ù‚Ø§Ù‹',
            ...defaultMessages
        };
        
        let message = data?.message || messages[response.status] || `Ø®Ø·Ø£ ØºÙŠØ± Ù…ØªÙˆÙ‚Ø¹ (${response.status})`;
        let type = 'error';
        
        // Adjust message type based on status
        if (response.status === 200 && data?.success) {
            type = 'success';
            message = data.message || 'ØªÙ… Ø¨Ù†Ø¬Ø§Ø­';
        } else if (response.status === 400) {
            // Check for specific warning cases
            if (data?.message?.includes('already')) {
                type = 'warning';
            } else if (data?.message?.includes('pending')) {
                type = 'info';
            }
        }
        
        return { message, type, success: response.status === 200 && data?.success };
    }
    
    // Helper to show notifications consistently
    static showNotification(message, type = 'info', duration = 5000) {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type, duration);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Safe initialization - ensure config is available immediately
(function() {
    if (!window.appConfig) {
        window.appConfig = new AppConfig();
    }
})();

// Enhanced global utility function to safely get config
window.waitForConfig = function(timeout = 5000) {
    return new Promise((resolve, reject) => {
        // If config is already available, return it immediately
        if (window.appConfig && window.appConfig.isReady && window.appConfig.isReady()) {
            resolve(window.appConfig);
            return;
        }
        
        let attempts = 0;
        const maxAttempts = timeout / 50; // Check every 50ms
        
        const checkConfig = () => {
            if (window.appConfig && window.appConfig.isReady && window.appConfig.isReady()) {
                resolve(window.appConfig);
            } else if (attempts >= maxAttempts) {
                // Fallback: create emergency config if none exists
                if (!window.appConfig) {
                    window.appConfig = new AppConfig();
                }
                resolve(window.appConfig);
            } else {
                attempts++;
                setTimeout(checkConfig, 50);
            }
        };
        
        checkConfig();
    });
};

// Synchronous safe getter with fallback
window.safeGetBackendUrl = function() {
    if (window.appConfig && typeof window.appConfig.getBackendUrl === 'function') {
        return window.appConfig.getBackendUrl();
    }
    
    // Emergency fallback based on hostname
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'https://beeboard-production-b072.up.railway.app/api';
    }
    return 'https://beeboard-production.up.railway.app/Backend';
};

// Ensure config is ready before any other scripts run
document.addEventListener('DOMContentLoaded', function() {
    if (!window.appConfig) {
        window.appConfig = new AppConfig();
    }
    console.log('âœ… AppConfig ready:', window.appConfig.getBackendUrl());
});

// Log immediately for debugging
if (window.appConfig && window.appConfig.getBackendUrl) {
    console.log('âœ… AppConfig module loaded, backend URL:', window.appConfig.getBackendUrl());
} else {
    console.warn('âš ï¸ AppConfig not ready immediately, will use safety functions');
}