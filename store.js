// store.js - إدارة المتجر مع تصنيفات متعددة

let allPlans = [];
let currentMainCategory = 'games';
let currentSubCategory = 'cs2';

// تعريف التصنيفات الفرعية لكل تصنيف رئيسي
const subCategoriesMap = {
    games: [
        { id: 'cs2', icon: '🎯', label: 'CS2' },
        { id: 'minecraft', icon: '⛏️', label: 'Minecraft' },
        { id: 'samp', icon: '🚗', label: 'SAMP' },
        { id: 'mta', icon: '🏎️', label: 'MTA' }
    ],
    servers: [
        { id: 'rdp', icon: '🖥️', label: 'RDP' },
        { id: 'vps', icon: '☁️', label: 'VPS' }
    ],
    bots: [
        { id: 'discord', icon: '🤖', label: 'Discord Bot' },
        { id: 'telegram', icon: '📱', label: 'Telegram Bot' }
    ]
};

// ─── جلب الخطط من Firebase ───
async function loadPlans() {
    const container = document.getElementById('plansContainer');
    container.innerHTML = `<p class="loading-text"><i class="fa-solid fa-spinner fa-spin"></i> جاري تحميل الخطط...</p>`;
    
    try {
        const result = await window.getPlans();
        if (result.success && result.plans.length > 0) {
            allPlans = result.plans;
        } else {
            allPlans = [];
        }
        renderPlans();
    } catch (error) {
        console.error('خطأ في تحميل الخطط:', error);
        allPlans = [];
        renderPlans();
    }
}
window.loadPlans = loadPlans;

// ─── التبديل بين التصنيفات الرئيسية ───
function switchMainCategory(category) {
    currentMainCategory = category;
    const subCats = subCategoriesMap[category] || [];
    currentSubCategory = subCats[0]?.id || '';
    
    // تحديث الأزرار النشطة
    document.querySelectorAll('.store-cat-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.main === category);
    });
    
    renderSubCategories();
    renderPlans();
}
window.switchMainCategory = switchMainCategory;

// ─── عرض التصنيفات الفرعية ───
function renderSubCategories() {
    const container = document.getElementById('subCategoriesContainer');
    const subCats = subCategoriesMap[currentMainCategory] || [];
    
    if (subCats.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    subCats.forEach(sub => {
        const isActive = currentSubCategory === sub.id;
        html += `
            <button class="sub-cat-btn ${isActive ? 'active' : ''}" onclick="switchSubCategory('${sub.id}')">
                <span class="sub-icon">${sub.icon}</span>
                <span class="sub-label">${sub.label}</span>
            </button>
        `;
    });
    
    container.innerHTML = html;
}
window.renderSubCategories = renderSubCategories;

// ─── التبديل بين التصنيفات الفرعية ───
function switchSubCategory(subId) {
    currentSubCategory = subId;
    renderSubCategories();
    renderPlans();
}
window.switchSubCategory = switchSubCategory;

// ─── عرض الخطط ───
function renderPlans() {
    const container = document.getElementById('plansContainer');
    
    // تصفية الخطط حسب التصنيف الرئيسي والفرعي
    const filtered = allPlans.filter(p => 
        p.mainCategory === currentMainCategory && 
        p.subCategory === currentSubCategory
    );
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state-modern">
                <div class="empty-icon">📦</div>
                <h3>لا توجد خطط في هذا التصنيف</h3>
                <p class="muted">قم بإضافة خطط جديدة من لوحة تحكم الأدمن</p>
                <button class="btn-primary" style="width:auto;padding:12px 35px;margin-top:15px;" onclick="navigateTo('admin')">
                    <i class="fa-solid fa-plus"></i> إضافة خطة
                </button>
            </div>
        `;
        return;
    }
    
    let html = '';
    filtered.forEach(plan => {
        const features = plan.features || ['ميزة غير محددة'];
        const mainLabel = getMainCategoryLabel(plan.mainCategory);
        const subLabel = getSubCategoryLabel(plan.subCategory);
        
        html += `
            <div class="plan-card">
                <span class="plan-badge">${mainLabel} • ${subLabel}</span>
                <h3>${plan.name}</h3>
                <div class="plan-price">
                    $${plan.price} <small>/ شهرياً</small>
                </div>
                <ul class="plan-features">
                    <li><i class="fa-solid fa-microchip"></i> CPU: ${plan.cpu || '--'}</li>
                    <li><i class="fa-solid fa-memory"></i> RAM: ${plan.ram || '--'}</li>
                    <li><i class="fa-solid fa-hard-drive"></i> Disk: ${plan.disk || '--'}</li>
                    ${features.map(f => `<li><i class="fa-solid fa-check"></i> ${f}</li>`).join('')}
                </ul>
                <button class="btn-order" onclick="orderPlan('${plan.id}')">
                    <i class="fa-solid fa-cart-plus"></i> طلب الآن
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}
window.renderPlans = renderPlans;

// ─── دوال مساعدة للتصنيفات ───
function getMainCategoryLabel(category) {
    const labels = {
        'games': '🎮 ألعاب',
        'servers': '🖥️ سيرفرات',
        'bots': '🤖 بوتات'
    };
    return labels[category] || category;
}
window.getMainCategoryLabel = getMainCategoryLabel;

function getSubCategoryLabel(sub) {
    const labels = {
        'cs2': '🎯 CS2',
        'minecraft': '⛏️ Minecraft',
        'samp': '🚗 SAMP',
        'mta': '🏎️ MTA',
        'rdp': '🖥️ RDP',
        'vps': '☁️ VPS',
        'discord': '🤖 Discord',
        'telegram': '📱 Telegram'
    };
    return labels[sub] || sub;
}
window.getSubCategoryLabel = getSubCategoryLabel;

// ─── طلب خطة ───
async function orderPlan(planId) {
    if (!authSystem.isLoggedIn || !authSystem.currentUser) {
        showToast('يرجى تسجيل الدخول أولاً لإتمام الطلب', 'warning');
        return;
    }
    
    const plan = allPlans.find(p => p.id === planId);
    if (!plan) {
        showToast('الخطة غير موجودة', 'error');
        return;
    }
    
    if (!confirm(`تأكيد طلب "${plan.name}" بسعر $${plan.price} شهرياً؟`)) return;
    
    try {
        const orderData = {
            userId: authSystem.currentUser.id || authSystem.currentUser.uid,
            userEmail: authSystem.currentUser.email,
            planId: plan.id,
            planName: plan.name,
            planPrice: plan.price,
            mainCategory: plan.mainCategory,
            subCategory: plan.subCategory,
            cpu: plan.cpu || '--',
            ram: plan.ram || '--',
            disk: plan.disk || '--',
            status: 'جديد',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('orders').add(orderData);
        showToast(`✅ تم طلب "${plan.name}" بنجاح!`, 'success');
        
        if (document.getElementById('page-dashboard').classList.contains('active')) {
            if (typeof loadDashboard === 'function') loadDashboard();
        }
    } catch (error) {
        console.error('خطأ في الطلب:', error);
        showToast('❌ فشل إرسال الطلب: ' + error.message, 'error');
    }
}
window.orderPlan = orderPlan;

// ─── تهيئة المتجر عند التحميل ───
document.addEventListener('DOMContentLoaded', function() {
    renderSubCategories();
});

console.log('✅ store.js جاهز');