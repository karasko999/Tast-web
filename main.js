// main.js - التطبيق الرئيسي (بدون رفع صور)

document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 main.js تم تحميله");

    // ─── ربط نموذج إضافة الخطة (بدون رفع صور) ───
    const addPlanForm = document.getElementById('addPlanForm');
    if (addPlanForm) {
        addPlanForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!authSystem.isAdmin) {
                showToast('⚠️ فقط المسؤول يمكنه إضافة خطط', 'error');
                return;
            }
            
            // جلب البيانات
            const name = document.getElementById('adminPlanName').value.trim();
            const price = parseFloat(document.getElementById('adminPlanPrice').value);
            const mainCategory = document.getElementById('adminMainCategory').value;
            const subCategory = document.getElementById('adminSubCategory').value;
            const subtitle = document.getElementById('adminPlanSubtitle').value.trim();
            const slots = document.getElementById('adminPlanSlots').value.trim();
            const cpu = document.getElementById('adminPlanCpu').value.trim();
            const ram = document.getElementById('adminPlanRam').value.trim();
            const disk = document.getElementById('adminPlanDisk').value.trim();
            const featuresInput = document.getElementById('adminPlanFeatures').value.trim();
            const imageUrl = document.getElementById('adminPlanImageUrl').value.trim(); // رابط الصورة
            
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
                subtitle: subtitle || 'خطة احترافية للسيرفرات',
                slots: slots || 'غير محدد',
                cpu: cpu || 'غير محدد',
                ram: ram || 'غير محدد',
                disk: disk || 'غير محدد',
                features: features,
                imageUrl: imageUrl || null, // حفظ الرابط
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

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
    }

    // ─── مراقبة تغيير حالة المصادقة ───
    document.addEventListener('authChanged', function(e) {
        const { user, isLoggedIn, isAdmin } = e.detail;
        if (isLoggedIn) {
            showApp(user, isAdmin);
        } else {
            window.location.href = 'login.html';
        }
    });

    if (authSystem.isLoggedIn && authSystem.currentUser) {
        showApp(authSystem.currentUser, authSystem.isAdmin);
    } else {
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
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

function showApp(user, isAdmin) {
    document.getElementById('app-screen').style.display = 'block';
    
    const displayName = user?.username || user?.full_name || user?.email?.split('@')[0] || 'مستخدم';
    document.getElementById('userDisplayName').textContent = displayName;
    
    const adminLink = document.getElementById('adminNavLink');
    const adminFormCard = document.getElementById('adminFormCard');
    const adminTableCard = document.getElementById('adminTableCard');
    
    if (isAdmin === true) {
        if (adminLink) adminLink.style.display = 'inline-block';
        if (adminFormCard) adminFormCard.style.display = 'block';
        if (adminTableCard) adminTableCard.style.display = 'block';
    } else {
        if (adminLink) adminLink.style.display = 'none';
        if (adminFormCard) adminFormCard.style.display = 'none';
        if (adminTableCard) adminTableCard.style.display = 'none';
    }
    
    setTimeout(function() {
        const activePage = document.querySelector('.page.active');
        if (activePage) {
            const pageId = activePage.id.replace('page-', '');
            if (pageId === 'dashboard' && typeof loadDashboard === 'function') loadDashboard();
            if (pageId === 'store' && typeof loadPlans === 'function') loadPlans();
            if (pageId === 'admin' && isAdmin && typeof loadAdminPlans === 'function') loadAdminPlans();
        } else {
            navigateTo('home');
        }
    }, 300);
}

function navigateTo(page) {
    if (page === 'admin' && !authSystem.isAdmin) {
        showToast('⚠️ غير مصرح لك بالوصول', 'error');
        return;
    }
    
    document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');
    
    document.querySelectorAll('.nav-links a').forEach(el => el.classList.remove('active'));
    document.querySelector(`.nav-links a[onclick*="'${page}'"]`)?.classList.add('active');
    
    setTimeout(function() {
        if (page === 'dashboard' && authSystem.isLoggedIn && typeof loadDashboard === 'function') loadDashboard();
        if (page === 'store' && typeof loadPlans === 'function') loadPlans();
        if (page === 'admin' && authSystem.isAdmin && typeof loadAdminPlans === 'function') loadAdminPlans();
    }, 200);
}
window.navigateTo = navigateTo;

async function handleLogout() {
    const result = await authSystem.logout();
    showToast(result.message, result.success ? 'success' : 'error');
    if (result.success) window.location.href = 'login.html';
}
window.handleLogout = handleLogout;

console.log('✅ main.js (بدون رفع صور) جاهز');