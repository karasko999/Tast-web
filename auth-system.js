// auth-system.js - نظام المصادقة الكامل (مع دعم جزئي لبيانات المستخدم)

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.isAdmin = false;
        this.authReady = false;
        this.init();
    }

    init() {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                this.isLoggedIn = true;
                // 🔥 نحاول تحميل البيانات، لكن إذا فشلت ننشئ كائن مؤقت
                await this.loadUserData(user.uid);
                this.authReady = true;
                this.triggerAuthChange();
            } else {
                this.currentUser = null;
                this.isLoggedIn = false;
                this.isAdmin = false;
                this.authReady = true;
                sessionStorage.removeItem('firebase_user');
                this.triggerAuthChange();
            }
        });
    }

    // ─── تحميل بيانات المستخدم (مع إنشاء كائن مؤقت إذا فشل) ───
    async loadUserData(uid) {
        try {
            const doc = await db.collection('users').doc(uid).get();
            if (doc.exists) {
                this.currentUser = { id: uid, ...doc.data() };
                this.isAdmin = this.currentUser.role === 'admin';
                sessionStorage.setItem('firebase_user', JSON.stringify(this.currentUser));
            } else {
                // 🔥 إذا لم يكن هناك ملف تعريف، ننشئ واحداً
                await this.createUserProfile(uid);
                return this.loadUserData(uid);
            }
        } catch (error) {
            console.warn("⚠️ فشل جلب بيانات المستخدم من Firestore:", error);
            
            // 🔥 إنشاء كائن مؤقت للمستخدم (حتى تظهر الواجهة)
            const user = firebase.auth().currentUser;
            this.currentUser = {
                id: uid,
                uid: uid,
                email: user?.email || 'unknown@email.com',
                username: user?.displayName || user?.email?.split('@')[0] || 'مستخدم',
                full_name: user?.displayName || user?.email?.split('@')[0] || 'مستخدم',
                role: 'user'
            };
            this.isAdmin = false;
            sessionStorage.setItem('firebase_user', JSON.stringify(this.currentUser));
            
            // 🔥 نحاول إنشاء الملف الشخصي في الخلفية (قد تنجح لاحقاً)
            try {
                await this.createUserProfile(uid);
                console.log("✅ تم إنشاء الملف الشخصي بنجاح بعد المحاولة");
            } catch (e) {
                console.warn("⚠️ لا يمكن إنشاء الملف الشخصي حالياً (قواعد الأمان أو الشبكة)");
            }
        }
    }

    // ─── إنشاء ملف تعريف جديد ───
    async createUserProfile(uid) {
        try {
            const user = firebase.auth().currentUser;
            const userData = {
                username: user.displayName || user.email?.split('@')[0] || 'user_' + Date.now(),
                full_name: user.displayName || user.email?.split('@')[0] || 'مستخدم',
                email: user.email || '',
                avatar: user.photoURL || null,
                role: 'user',
                created_at: firebase.firestore.FieldValue.serverTimestamp(),
                updated_at: firebase.firestore.FieldValue.serverTimestamp()
            };
            await db.collection('users').doc(uid).set(userData);
        } catch (error) {
            console.error("Error creating profile:", error);
            throw error; // نرمي الخطأ للتعامل معه في loadUserData
        }
    }

    // ─── التحقق من اسم المستخدم (فريد) ───
    async isUsernameTaken(username) {
        if (!username) return false;
        try {
            const snapshot = await db.collection('users')
                .where('username', '==', username.toLowerCase())
                .get();
            return !snapshot.empty;
        } catch (error) {
            console.error("Username check error:", error);
            return false;
        }
    }

    // ─── تسجيل الدخول (بريد أو اسم مستخدم) ───
    async login(identifier, password) {
        if (!identifier || !password) {
            return { success: false, message: 'يرجى إدخال جميع البيانات' };
        }

        const isEmail = this.validateEmail(identifier);
        let email = identifier;

        if (!isEmail) {
            try {
                const snapshot = await db.collection('users')
                    .where('username', '==', identifier.toLowerCase())
                    .limit(1)
                    .get();
                
                if (snapshot.empty) {
                    return { success: false, message: 'اسم المستخدم غير موجود' };
                }
                email = snapshot.docs[0].data().email;
            } catch (error) {
                return { success: false, message: 'حدث خطأ في البحث' };
            }
        }

        try {
            const result = await firebase.auth().signInWithEmailAndPassword(email, password);
            await this.loadUserData(result.user.uid);
            return { success: true, message: 'مرحباً بعودتك! 👋' };
        } catch (error) {
            return { success: false, message: this.getErrorMessage(error.code) };
        }
    }

    // ─── إنشاء حساب جديد ───
    async register(username, email, password, confirmPassword) {
        if (!username || !email || !password || !confirmPassword) {
            return { success: false, message: 'جميع الحقول مطلوبة' };
        }
        if (password !== confirmPassword) {
            return { success: false, message: 'كلمة المرور غير متطابقة' };
        }
        if (password.length < 8) {
            return { success: false, message: 'كلمة المرور 8 أحرف على الأقل' };
        }
        if (!this.validateEmail(email)) {
            return { success: false, message: 'البريد الإلكتروني غير صحيح' };
        }

        const usernameTaken = await this.isUsernameTaken(username);
        if (usernameTaken) {
            return { success: false, message: 'اسم المستخدم مستخدم بالفعل 😅' };
        }

        try {
            const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
            const user = result.user;
            await user.updateProfile({ displayName: username });

            const userData = {
                username: username.toLowerCase(),
                full_name: username,
                email: email,
                avatar: null,
                role: 'user',
                created_at: firebase.firestore.FieldValue.serverTimestamp(),
                updated_at: firebase.firestore.FieldValue.serverTimestamp()
            };
            await db.collection('users').doc(user.uid).set(userData);

            await this.loadUserData(user.uid);
            return { success: true, message: 'تم إنشاء الحساب بنجاح! 🎉' };
        } catch (error) {
            return { success: false, message: this.getErrorMessage(error.code) };
        }
    }

    // ─── تسجيل الخروج ───
    async logout() {
        try {
            await firebase.auth().signOut();
            this.currentUser = null;
            this.isLoggedIn = false;
            this.isAdmin = false;
            sessionStorage.removeItem('firebase_user');
            return { success: true, message: 'تم تسجيل الخروج' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // ─── استعادة كلمة المرور ───
    async sendPasswordReset(email) {
        if (!email || !this.validateEmail(email)) {
            return { success: false, message: 'البريد الإلكتروني غير صحيح' };
        }
        try {
            await firebase.auth().sendPasswordResetEmail(email);
            return { success: true, message: 'تم إرسال رابط إعادة التعيين إلى بريدك' };
        } catch (error) {
            return { success: false, message: this.getErrorMessage(error.code) };
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
            'auth/email-already-in-use': 'البريد الإلكتروني مستخدم بالفعل',
            'auth/invalid-email': 'البريد الإلكتروني غير صحيح',
            'auth/user-not-found': 'المستخدم غير موجود',
            'auth/wrong-password': 'كلمة المرور غير صحيحة',
            'auth/weak-password': 'كلمة المرور ضعيفة جداً',
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
                isLoggedIn: this.isLoggedIn,
                isAdmin: this.isAdmin
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
    setTimeout(() => window.location.reload(), 1000);
};

window.forgotPassword = async () => {
    const identifier = document.getElementById('loginIdentifier')?.value.trim();
    if (!identifier) {
        showToast('يرجى إدخال بريدك الإلكتروني أولاً', 'warning');
        return;
    }
    if (!authSystem.validateEmail(identifier)) {
        showToast('يرجى إدخال بريد إلكتروني صحيح لاستعادة كلمة المرور', 'warning');
        return;
    }
    const result = await authSystem.sendPasswordReset(identifier);
    showToast(result.message, result.success ? 'success' : 'error');
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

console.log("✅ AuthSystem (مرن) initialized");