// main.js - التطبيق الرئيسي

document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 main.js تم تحميله");

    // ─── ربط نموذج إضافة الخطة (للأدمن فقط) ───
    const addPlanForm = document.getElementById('addPlanForm');
    if (addPlanForm) {
        console.log("✅ تم العثور على نموذج إضافة الخطة");
        addPlanForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log("📝 تم الضغط على زر إضافة الخطة");
            
            // 🔥 التحقق من صلاحية الأدمن
            if (!authSystem.isAdmin) {
                showToast('⚠️ فقط المسؤول يمكنه إضافة خطط', 'error');
                return;
            }
            
            // جلب البيانات
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
                
                // تحديث الجداول
                if (typeof loadAdminPlans === 'function') {
                    loadAdminPlans();
                }
                if (typeof loadPlans === 'function') {
                    loadPlans();
                }
            } catch (error) {
                console.error("❌ خطأ في الإضافة:", error);
                showToast('❌ فشل الإضافة: ' + error.message, 'error');
            }
        });
    } else {
        console.warn("⚠️ لم يتم العثور على نموذج إضافة الخطة");
    }

    // ─── مراقبة تغيير حالة المصادقة ───
    document.addEventListener('authChanged', function(e) {
        const { user, isLoggedIn, isAdmin } = e.detail;
        console.log("🔄 حدث تغيير في المصادقة:", { isLoggedIn, isAdmin });
        
        if (isLoggedIn) {
            showApp(user, isAdmin);
        } else {
            window.location.href = 'login.html';
        }
    });

    // ─── إذا كان المستخدم مسجلاً بالفعل ───
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

// ─── دوال العرض ───
function showApp(user, isAdmin) {
    console.log("📱 عرض التطبيق للمستخدم:", user?.username, "أدمن:", isAdmin);
    
    document.getElementById('app-screen').style.display = 'block';
    
    const displayName = user?.username || user?.full_name || user?.email?.split('@')[0] || 'مستخدم';
    document.getElementById('userDisplayName').textContent = displayName;
    
    // 🔥 التحكم في ظهور عناصر الأدمن
    const adminLink = document.getElementById('adminNavLink');
    const adminFormCard = document.getElementById('adminFormCard');
    const adminTableCard = document.getElementById('adminTableCard');
    
    if (isAdmin === true) {
        console.log("👑 إظهار عناصر الأدمن");
        if (adminLink) adminLink.style.display = 'inline-block';
        if (adminFormCard) adminFormCard.style.display = 'block';
        if (adminTableCard) adminTableCard.style.display = 'block';
    } else {
        console.log("👤 إخفاء عناصر الأدمن");
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
            navigateTo('home');
        }
    }, 300);
}

function navigateTo(page) {
    console.log("🔀 التنقل إلى:", page);
    
    // 🔥 التحقق من صلاحية الأدمن قبل الانتقال
    if (page === 'admin' && !authSystem.isAdmin) {
        showToast('⚠️ غير مصرح لك بالوصول', 'error');
        return;
    }
    
    document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
    
    const target = document.getElementById('page-' + page);
    if (target) {
        target.classList.add('active');
    } else {
        console.warn("⚠️ الصفحة غير موجودة:", page);
        return;
    }
    
    document.querySelectorAll('.nav-links a').forEach(el => el.classList.remove('active'));
    document.querySelector(`.nav-links a[onclick*="'${page}'"]`)?.classList.add('active');
    
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

async function handleLogout() {
    const result = await authSystem.logout();
    showToast(result.message, result.success ? 'success' : 'error');
    if (result.success) {
        window.location.href = 'login.html';
    }
}
window.handleLogout = handleLogout;

console.log('✅ main.js جاهز');