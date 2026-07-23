// auth-system.js - نظام المصادقة بالرابط السحري فقط

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.authReady = false;
        this.init();
    }

    init() {
        // مستمع حالة المصادقة
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                this.isLoggedIn = true;
                await this.loadUserData(user.uid);
                this.authReady = true;
                this.triggerAuthChange();
            } else {
                this.currentUser = null;
                this.isLoggedIn = false;
                this.authReady = true;
                this.triggerAuthChange();
            }
        });

        // معالجة العودة من الرابط السحري
        this.handleMagicLink();
    }

    // ─── تحميل بيانات المستخدم ───
    async loadUserData(uid) {
        try {
            const doc = await db.collection('users').doc(uid).get();
            if (doc.exists) {
                this.currentUser = { id: uid, ...doc.data() };
                sessionStorage.setItem('firebase_user', JSON.stringify(this.currentUser));
            } else {
                // إنشاء ملف تعريف جديد إذا لم يكن موجوداً
                await this.createUserProfile(uid);
                return this.loadUserData(uid);
            }
        } catch (error) {
            console.error("Error loading user data:", error);
        }
    }

    // ─── إنشاء ملف تعريف جديد ───
    async createUserProfile(uid) {
        try {
            const user = firebase.auth().currentUser;
            const userData = {
                full_name: user.displayName || user.email?.split('@')[0] || 'مستخدم',
                username: user.email?.split('@')[0] || 'user_' + Date.now(),
                email: user.email || '',
                avatar: user.photoURL || null,
                role: 'user',
                created_at: firebase.firestore.FieldValue.serverTimestamp(),
                updated_at: firebase.firestore.FieldValue.serverTimestamp()
            };
            await db.collection('users').doc(uid).set(userData);
        } catch (error) {
            console.error("Error creating profile:", error);
        }
    }

    // ─── إرسال رابط التحقق السحري ───
    async sendMagicLink(email) {
        if (!email || !this.validateEmail(email)) {
            return { success: false, message: 'البريد الإلكتروني غير صحيح' };
        }

        const actionCodeSettings = {
            url: window.location.href.split('?')[0], // الرابط الحالي (بدون بارامترات)
            handleCodeInApp: true,
            iOS: { bundleId: 'com.example.ios' },
            android: { packageName: 'com.example.android', installApp: true }
        };

        try {
            await firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings);
            localStorage.setItem('emailForSignIn', email);
            return { success: true, message: 'تم إرسال رابط التحقق إلى بريدك الإلكتروني 📧' };
        } catch (error) {
            console.error("Send magic link error:", error);
            return { success: false, message: this.getErrorMessage(error.code) };
        }
    }

    // ─── معالجة الرابط عند العودة ───
    async handleMagicLink() {
        const auth = firebase.auth();
        if (auth.isSignInWithEmailLink(window.location.href)) {
            let email = localStorage.getItem('emailForSignIn');
            if (!email) {
                email = prompt('أدخل بريدك الإلكتروني لتأكيد تسجيل الدخول:');
            }
            if (!email) return;

            try {
                const result = await auth.signInWithEmailLink(email, window.location.href);
                localStorage.removeItem('emailForSignIn');
                // إزالة البارامترات من الرابط لتجنب إعادة الاستخدام
                window.history.pushState({}, document.title, window.location.pathname);
                // سيتم التعامل مع المستخدم عبر onAuthStateChanged
                console.log('✅ تم تسجيل الدخول بنجاح عبر الرابط السحري');
            } catch (error) {
                console.error("Magic link sign-in error:", error);
                alert('فشل التحقق: ' + this.getErrorMessage(error.code));
            }
        }
    }

    // ─── تسجيل الخروج ───
    async logout() {
        try {
            await firebase.auth().signOut();
            this.currentUser = null;
            this.isLoggedIn = false;
            sessionStorage.removeItem('firebase_user');
            return { success: true, message: 'تم تسجيل الخروج' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // ─── الحصول على المستخدم الحالي ───
    getCurrentUser() {
        return this.currentUser;
    }

    // ─── أدوات مساعدة ───
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    getErrorMessage(code) {
        const messages = {
            'auth/invalid-email': 'البريد الإلكتروني غير صحيح',
            'auth/user-not-found': 'المستخدم غير موجود',
            'auth/too-many-requests': 'محاولات كثيرة، حاول لاحقاً',
            'auth/network-request-failed': 'خطأ في الاتصال بالإنترنت'
        };
        return messages[code] || code || 'حدث خطأ غير معروف';
    }

    // ─── إشعار تغيير الحالة ───
    triggerAuthChange() {
        const event = new CustomEvent('authChanged', {
            detail: {
                user: this.currentUser,
                isLoggedIn: this.isLoggedIn
            }
        });
        document.dispatchEvent(event);
    }
}

// ─── تهيئة النظام ───
const authSystem = new AuthSystem();
window.authSystem = authSystem;

// ─── دوال عامة ───
window.logoutGlobal = async () => {
    const result = await authSystem.logout();
    showToast(result.message, 'success');
    setTimeout(() => window.location.href = 'login.html', 1000);
};

// ─── Toast Notifications ───
function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-circle-exclamation',
        warning: 'fa-triangle-exclamation',
        info: 'fa-circle-info'
    };
    toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(calc(100% + 30px))';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}
window.showToast = showToast;

console.log("✅ AuthSystem (Magic Link) initialized successfully");