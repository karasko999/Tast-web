// main.js - التطبيق الرئيسي مع Magic Link

document.addEventListener('DOMContentLoaded', () => {
    // ربط نموذج إرسال الرابط السحري
    const form = document.getElementById('magicLinkForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const btn = document.getElementById('sendLinkBtn');
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الإرسال...';
            
            const result = await authSystem.sendMagicLink(email);
            showToast(result.message, result.success ? 'success' : 'error');
            
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-envelope"></i> إرسال رابط التحقق';
        });
    }

    // مراقبة تغيير حالة المصادقة
    document.addEventListener('authChanged', (e) => {
        const { user, isLoggedIn } = e.detail;
        if (isLoggedIn) {
            showApp(user);
        } else {
            showAuth();
        }
    });

    // إذا كان المستخدم مسجلاً بالفعل
    if (authSystem.isLoggedIn) {
        showApp(authSystem.currentUser);
    }
});

function showAuth() {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('app-screen').style.display = 'none';
}

function showApp(user) {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'block';
    
    const displayName = user?.full_name || user?.displayName || user?.email?.split('@')[0] || 'مستخدم';
    document.getElementById('userDisplayName').textContent = displayName;
    
    if (document.getElementById('page-dashboard').classList.contains('active')) {
        if (typeof loadDashboard === 'function') loadDashboard();
    }
    if (document.getElementById('page-store').classList.contains('active')) {
        if (typeof loadPlans === 'function') loadPlans();
    }
}

function navigateTo(page) {
    document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');
    
    document.querySelectorAll('.nav-links a').forEach(el => el.classList.remove('active'));
    document.querySelector(`.nav-links a[onclick*="'${page}'"]`)?.classList.add('active');
    
    if (page === 'dashboard' && authSystem.isLoggedIn) {
        if (typeof loadDashboard === 'function') loadDashboard();
    }
    if (page === 'store') {
        if (typeof loadPlans === 'function') loadPlans();
    }
}
window.navigateTo = navigateTo;

async function handleLogout() {
    const result = await authSystem.logout();
    showToast(result.message, result.success ? 'success' : 'error');
    if (result.success) showAuth();
}
window.handleLogout = handleLogout;

console.log('✅ main.js (Magic Link) جاهز');