// main.js - التطبيق الرئيسي

document.addEventListener('DOMContentLoaded', () => {
    // ─── نموذج تسجيل الدخول ───
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const identifier = document.getElementById('loginIdentifier').value.trim();
            const password = document.getElementById('loginPassword').value;
            const btn = loginForm.querySelector('.auth-btn');
            
            if (!identifier || !password) {
                showToast('يرجى إدخال جميع البيانات', 'warning');
                return;
            }

            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري...';
            
            const result = await authSystem.login(identifier, password);
            
            btn.disabled = false;
            btn.innerHTML = 'تسجيل الدخول';
            
            showToast(result.message, result.success ? 'success' : 'error');
            
            // 🔥 إذا نجح الدخول، سيتم تحديث الواجهة تلقائياً عبر authChanged
        });
    }

    // ─── نموذج إنشاء حساب ───
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('regUsername').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value;
            const confirm = document.getElementById('regConfirmPassword').value;
            const terms = document.getElementById('acceptTerms')?.checked;
            const btn = registerForm.querySelector('.auth-btn');

            if (!username || !email || !password || !confirm) {
                showToast('جميع الحقول مطلوبة', 'warning');
                return;
            }
            if (password !== confirm) {
                showToast('كلمة المرور غير متطابقة', 'error');
                return;
            }
            if (!terms) {
                showToast('الرجاء الموافقة على الشروط', 'warning');
                return;
            }

            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري...';
            
            const result = await authSystem.register(username, email, password, confirm);
            
            btn.disabled = false;
            btn.innerHTML = 'إنشاء حساب';
            
            showToast(result.message, result.success ? 'success' : 'error');
            
            // 🔥 إذا نجح التسجيل، سيتم تحديث الواجهة تلقائياً عبر authChanged
        });
    }

    // ─── ربط نموذج إضافة خطة (للوحة الأدمن) ───
    const addPlanForm = document.getElementById('addPlanForm');
    if (addPlanForm) {
        addPlanForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (typeof addPlan === 'function') {
                addPlan(e);
            } else {
                showToast('⚠️ نظام الأدمن لم يتم تحميله بعد', 'warning');
            }
        });
    }

    // ─── مراقبة تغيير حالة المصادقة ───
    document.addEventListener('authChanged', (e) => {
        const { user, isLoggedIn, isAdmin } = e.detail;
        if (isLoggedIn) {
            showApp(user, isAdmin);
        } else {
            showAuth();
        }
    });

    // ─── إذا كان المستخدم مسجلاً بالفعل ───
    if (authSystem.isLoggedIn) {
        showApp(authSystem.currentUser, authSystem.isAdmin);
    }
});

// ─── دوال العرض ───
function showAuth() {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('app-screen').style.display = 'none';
}

function showApp(user, isAdmin) {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'block';
    
    const displayName = user?.username || user?.full_name || user?.email?.split('@')[0] || 'مستخدم';
    document.getElementById('userDisplayName').textContent = displayName;
    
    const adminLink = document.getElementById('adminNavLink');
    if (isAdmin) {
        adminLink.style.display = 'inline-block';
    } else {
        adminLink.style.display = 'none';
    }
    
    // 🔥 تحميل البيانات حسب الصفحة النشطة
    const activePage = document.querySelector('.page.active');
    if (activePage) {
        const pageId = activePage.id.replace('page-', '');
        if (pageId === 'dashboard' && typeof loadDashboard === 'function') {
            loadDashboard();
        }
        if (pageId === 'store' && typeof loadPlans === 'function') {
            loadPlans();
        }
        if (pageId === 'admin' && isAdmin && typeof loadAdminPlans === 'function') {
            loadAdminPlans();
        }
    }
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(el => el.classList.remove('active'));
    document.querySelector(`.auth-tab[data-tab="${tab}"]`)?.classList.add('active');
    
    document.querySelectorAll('.auth-form').forEach(el => el.classList.remove('active'));
    if (tab === 'login') {
        document.getElementById('loginForm').classList.add('active');
    } else {
        document.getElementById('registerForm').classList.add('active');
    }
}
window.switchAuthTab = switchAuthTab;

function navigateTo(page) {
    document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');
    
    document.querySelectorAll('.nav-links a').forEach(el => el.classList.remove('active'));
    document.querySelector(`.nav-links a[onclick*="'${page}'"]`)?.classList.add('active');
    
    // 🔥 تحميل البيانات عند التنقل
    if (page === 'dashboard' && authSystem.isLoggedIn && typeof loadDashboard === 'function') {
        loadDashboard();
    }
    if (page === 'store' && typeof loadPlans === 'function') {
        loadPlans();
    }
    if (page === 'admin' && authSystem.isAdmin && typeof loadAdminPlans === 'function') {
        loadAdminPlans();
    }
}
window.navigateTo = navigateTo;

async function handleLogout() {
    const result = await authSystem.logout();
    showToast(result.message, result.success ? 'success' : 'error');
    if (result.success) showAuth();
}
window.handleLogout = handleLogout;

console.log('✅ main.js (محسّن) جاهز');