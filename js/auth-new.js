

 
class AuthManager {
    constructor() {
        this.baseURL = null;
        this.token = localStorage.getItem('beeboard_jwt_token');
        this.configInitialized = false;
    }

    async initializeConfig() {
        try {
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
            console.log('✅ AuthManager initialized with baseURL:', this.baseURL);
        } catch (error) {
            console.error('فشل تحميل الإعدادات، سيتم استخدام رابط بديل:', error);
            this.baseURL = window.safeGetBackendUrl ? window.safeGetBackendUrl() : (
                window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                    ? 'https://beeboard-production-b072.up.railway.app/api'
                    : window.location.origin + '/Backend'
            );
            this.configInitialized = true;
        }
    }

    async ensureConfigLoaded() {
        if (!this.configInitialized) {
            await this.initializeConfig();
        }
    }

    async login(email, password) {
        try {
            await this.ensureConfigLoaded();

            const response = await fetch(`${this.baseURL}/user/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            console.log("📦 Status:", response.status);
            console.log("📬 Headers:", [...response.headers.entries()]);

            try {
                const data = await response.json();
                console.log("📨 رد السيرفر:", data);

                // Check for token in the correct location based on response structure
                const token = data.data?.token || data.token;
                const user = data.data?.user || data.user;

                if (token) {
                    localStorage.setItem("beeboard_jwt_token", token);
                    if (user) {
                        localStorage.setItem('beeboard_user_data', JSON.stringify(user));
                    }
                    console.log("✅ Token تم حفظه:", token);
                    return { success: true, token: token, user: user };
                } else {
                    console.warn("⚠️ لم يتم العثور على توكن في الرد");
                    console.log("📋 بنية الرد:", JSON.stringify(data, null, 2));
                    return { success: false, message: "لم يتم العثور على توكن في الرد" };
                }

            } catch (e) {
                console.warn("⚠️ الرد ليس بصيغة JSON أو فاضي");
                return { success: false, message: "الرد ليس بصيغة JSON" };
            }

        } catch (err) {
            console.error("❌ خطأ في الاتصال بالسيرفر:", err);
            return { success: false, message: "خطأ في الاتصال بالسيرفر" };
        }
    }

    async signup(name, email, password) {
        try {
            await this.ensureConfigLoaded();
            const requestId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);

            const response = await fetch(`${this.baseURL}/user/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, request_id: requestId })
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.token;
                localStorage.setItem('beeboard_jwt_token', this.token);
                localStorage.setItem('beeboard_user_data', JSON.stringify(data.user));
                return { success: true, user: data.user };
            }
            return { success: false, message: data.message };
        } catch (error) {
            console.error('خطأ أثناء محاولة إنشاء الحساب:', error);
            return { success: false, message: 'حدث خطأ أثناء إنشاء الحساب: ' + error.message };
        }
    }

    clearTokenAndRedirect() {
        this.token = null;
        localStorage.removeItem('beeboard_jwt_token');
        localStorage.removeItem('beeboard_user_data');
        setTimeout(() => {
            window.location.href = 'homepage.html';
        }, 1500);
    }

    redirectToLogin() {
        if (window.location.pathname.includes('dashboard.html')) return;
        window.location.href = 'homepage.html';
    }

    logout() {
        this.token = null;
        localStorage.clear();
        window.location.reload();
    }

    isAuthenticated() {
        return !!localStorage.getItem('beeboard_jwt_token');
    }

    getCurrentUser() {
        const userData = localStorage.getItem('beeboard_user_data');
        return userData ? JSON.parse(userData) : null;
    }
}

window.AuthManager = AuthManager;
const authManager = new AuthManager();
window.authManager = authManager;

let signupInProgress = false;

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

function showLogin() {
    document.getElementById('loginModal')?.classList.remove('hidden');
    document.getElementById('signupModal')?.classList.add('hidden');
    clearMessages();
}

function showSignup() {
    document.getElementById('signupModal')?.classList.remove('hidden');
    document.getElementById('loginModal')?.classList.add('hidden');
    clearMessages();
}

function closeAuthModal() {
    document.getElementById('loginModal')?.classList.add('hidden');
    document.getElementById('signupModal')?.classList.add('hidden');
    clearMessages();
}

$(document).ready(function () {
    $('#loginForm').on('submit', async function (e) {
        e.preventDefault();
        const btn = $('#loginBtn');
        btn.prop('disabled', true).text('جاري تسجيل الدخول...');

        const email = $('#loginEmail').val();
        const password = $('#loginPassword').val();

        const result = await authManager.login(email, password);

        if (result.success) {
            showMessage('authMessages', 'تم تسجيل الدخول بنجاح', 'success');
            setTimeout(() => {
                closeAuthModal();
                window.location.href = '/homepage.html';
            }, 1000);
        } else {
            showMessage('authMessages', result.message);
        }

        btn.prop('disabled', false).text('تسجيل الدخول');
    });

    $('#signupForm').on('submit', async function (e) {
        e.preventDefault();
        if (signupInProgress) return;

        signupInProgress = true;
        const btn = $('#signupBtn');
        btn.prop('disabled', true).text('جاري إنشاء الحساب...');

        try {
            const name = $('#signupName').val().trim();
            const email = $('#signupEmail').val().trim();
            const password = $('#signupPassword').val();
            const confirmPassword = $('#confirmPassword').val();

            if (!name || name.length < 2) {
                showMessage('authMessages2', 'الاسم يجب أن يكون حرفين على الأقل');
                return;
            }

            if (!email || !email.includes('@')) {
                showMessage('authMessages2', 'يرجى إدخال بريد إلكتروني صالح');
                return;
            }

            if (!password || password.length < 6) {
                showMessage('authMessages2', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
                return;
            }

            if (password !== confirmPassword) {
                showMessage('authMessages2', 'كلمة المرور غير متطابقة');
                return;
            }

            const result = await authManager.signup(name, email, password);

            if (result.success) {
                showMessage('authMessages2', 'تم إنشاء الحساب بنجاح', 'success');
                setTimeout(() => {
                    closeAuthModal();
                    window.location.href = 'homepage.html';
                }, 1000);
            } else {
                showMessage('authMessages2', result.message);
            }
        } catch (error) {
            console.error('خطأ في إنشاء الحساب:', error);
            showMessage('authMessages2', 'حدث خطأ أثناء إنشاء الحساب');
        } finally {
            signupInProgress = false;
            btn.prop('disabled', false).text('إنشاء حساب');
        }
    });

    if (window.location.pathname.includes('login.html')) {
        if (authManager.isAuthenticated()) {
            window.location.href = 'homepage.html';
        } else {
            showLogin();
        }
    }
});
