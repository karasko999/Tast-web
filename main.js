// main.js - التطبيق الرئيسي

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 main.js تم تحميله");

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
        });
    }

    // ─── ربط نموذج إضافة خطة (الحل المباشر) ───
    const addPlanForm = document.getElementById('addPlanForm');
    if (addPlanForm) {
        console.log("✅ تم العثور على نموذج إضافة الخطة");
        addPlanForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("📝 تم الضغط على زر إضافة الخطة");
            
            const name = document.getElementById('adminPlanName').value.trim();
            const price = parseFloat(document.getElementById('adminPlanPrice').value);
            const mainCategory = document.getElementById('adminMainCategory').value;
            const subCategory = document.getElementById('adminSubCategory').value;
            const cpu = document.getElementById('adminPlanCpu').value.trim();
            const ram = document.getElementById('adminPlanRam').value.trim();
            const disk = document.getElementById('adminPlanDisk').value.trim();
            const featuresInput = document.getElementById('adminPlanFeatures').value.trim();
            
            if (!name || !price) {
                showToast('يرجى إدخال الاسم والسعر', 'warning');
                return;
            }

            const features = featuresInput ? featuresInput.split(',').map(f => f.trim()).filter(f => f) : [];

            const planData = {
                name: name,
                price: price,
                mainCategory: mainCategory,
                subCategory: subCategory,
                cpu: cpu || 'غير محدد',
                ram: ram || 'غير محدد',
                disk: disk || 'غير محدد',
                features: features,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            console.log("📦 بيانات الخطة:", planData);

            try {
                await db.collection('plans').add(planData);
                showToast('✅ تم إضافة الخطة بنجاح!', 'success');
                document.getElementById('addPlanForm').reset();
                if (typeof loadAdminPlans === 'function') loadAdminPlans();
                if (typeof loadPlans === 'function') loadPlans();
            } catch (error) {
                console.error("❌ خطأ في الإضافة:", error);
                showToast('❌ فشل الإضافة: ' + error.message, 'error');
            }
        });
    } else {
        console.warn("⚠️ لم يتم العثور على نموذج إضافة الخطة");
    }

    // ─── مراقبة تغيير حالة المصادقة ───
    document.addEventListener('authChanged', (e) => {
        const { user, isLoggedIn, isAdmin } = e.detail;
        console.log("🔄 حدث تغيير في المصادقة:", { isLoggedIn, isAdmin });
        if (isLoggedIn) {
            showApp(user, isAdmin);
        } else {
            showAuth();
        }
    });

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

console.log('✅ main.js جاهز');