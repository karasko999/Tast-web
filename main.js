// main.js - التطبيق الرئيسي

document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 main.js تم تحميله");

    // ─── مراقبة تغيير حالة المصادقة ───
    document.addEventListener('authChanged', function(e) {
        const { user, isLoggedIn, isAdmin } = e.detail;
        console.log("🔄 حدث تغيير في المصادقة:", { isLoggedIn, isAdmin, user });
        
        if (isLoggedIn) {
            showApp(user, isAdmin);
        } else {
            // إذا لم يكن مسجلاً، انتقل إلى login
            window.location.href = 'login.html';
        }
    });

    // ─── إذا كان المستخدم مسجلاً بالفعل ───
    if (authSystem.isLoggedIn && authSystem.currentUser) {
        showApp(authSystem.currentUser, authSystem.isAdmin);
    } else {
        // التحقق من حالة المصادقة
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                // المستخدم مسجل، ننتظر تحميل البيانات
                setTimeout(function() {
                    if (authSystem.isLoggedIn) {
                        showApp(authSystem.currentUser, authSystem.isAdmin);
                    }
                }, 500);
            } else {
                window.location.href = 'login.html';
            }
        });
    }
});

// ─── دوال العرض ───
function showApp(user, isAdmin) {
    console.log("📱 عرض التطبيق للمستخدم:", user, "أدمن:", isAdmin);
    
    document.getElementById('app-screen').style.display = 'block';
    
    // عرض اسم المستخدم
    const displayName = user?.username || user?.full_name || user?.email?.split('@')[0] || 'مستخدم';
    document.getElementById('userDisplayName').textContent = displayName;
    
    // 🔥 التحكم في ظهور عناصر الأدمن
    const adminLink = document.getElementById('adminNavLink');
    const adminFormCard = document.getElementById('adminFormCard');
    const adminTableCard = document.getElementById('adminTableCard');
    
    if (isAdmin === true) {
        console.log("👑 المستخدم أدمن - إظهار عناصر الأدمن");
        if (adminLink) adminLink.style.display = 'inline-block';
        if (adminFormCard) adminFormCard.style.display = 'block';
        if (adminTableCard) adminTableCard.style.display = 'block';
    } else {
        console.log("👤 مستخدم عادي - إخفاء عناصر الأدمن");
        if (adminLink) adminLink.style.display = 'none';
        if (adminFormCard) adminFormCard.style.display = 'none';
        if (adminTableCard) adminTableCard.style.display = 'none';
    }
    
    // تحميل البيانات حسب الصفحة النشطة
    setTimeout(function() {
        const activePage = document.querySelector('.page.active');
        if (activePage) {
            const pageId = activePage.id.replace('page-', '');
            console.log("📄 الصفحة النشطة:", pageId);
            
            if (pageId === 'dashboard' && typeof loadDashboard === 'function') {
                loadDashboard();
            }
            if (pageId === 'store' && typeof loadPlans === 'function') {
                loadPlans();
            }
            if (pageId === 'admin' && isAdmin && typeof loadAdminPlans === 'function') {
                loadAdminPlans();
            }
        } else {
            // إذا لم تكن هناك صفحة نشطة، نفتح الرئيسية
            navigateTo('home');
        }
    }, 300);
}

function navigateTo(page) {
    console.log("🔀 التنقل إلى:", page);
    
    // إخفاء جميع الصفحات
    document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
    
    // إظهار الصفحة المطلوبة
    const target = document.getElementById('page-' + page);
    if (target) {
        target.classList.add('active');
    } else {
        console.warn("⚠️ الصفحة غير موجودة:", page);
        return;
    }
    
    // تحديث الروابط النشطة
    document.querySelectorAll('.nav-links a').forEach(el => el.classList.remove('active'));
    document.querySelector(`.nav-links a[onclick*="'${page}'"]`)?.classList.add('active');
    
    // تحميل البيانات حسب الصفحة
    setTimeout(function() {
        if (page === 'dashboard' && authSystem.isLoggedIn && typeof loadDashboard === 'function') {
            loadDashboard();
        }
        if (page === 'store' && typeof loadPlans === 'function') {
            loadPlans();
        }
        if (page === 'admin' && authSystem.isAdmin && typeof loadAdminPlans === 'function') {
            loadAdminPlans();
        }
    }, 200);
}
window.navigateTo = navigateTo;

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(el => el.classList.remove('active'));
    document.querySelector(`.auth-tab[data-tab="${tab}"]`)?.classList.add('active');
    
    document.querySelectorAll('.auth-form').forEach(el => el.classList.remove('active'));
    if (tab === 'login') {
        document.getElementById('loginForm')?.classList.add('active');
    } else {
        document.getElementById('registerForm')?.classList.add('active');
    }
}
window.switchAuthTab = switchAuthTab;

async function handleLogout() {
    const result = await authSystem.logout();
    showToast(result.message, result.success ? 'success' : 'error');
    if (result.success) {
        window.location.href = 'login.html';
    }
}
window.handleLogout = handleLogout;

console.log('✅ main.js جاهز');