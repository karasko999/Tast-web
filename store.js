// store.js - إدارة المتجر مع تصنيفات متعددة

let allPlans = [];
let currentMainCategory = 'games';
let currentSubCategory = 'cs2';

// تعريف التصنيفات الفرعية لكل تصنيف رئيسي
const subCategoriesMap = {
    games: [
        { id: 'cs2', icon: '🔫', label: 'CS2' },
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

// ─── جلب الخطط ───
async function loadPlans() {
    const container = document.getElementById('plansContainer');
    container.innerHTML = `<p class="loading-text"><i class="fa-solid fa-spinner fa-spin"></i> جاري تحميل الخطط...</p>`;
    
    try {
        const result = await window.getPlans();
        if (result.success && result.plans.length > 0) {
            allPlans = result.plans;
        } else {
            allPlans = getDefaultPlans();
        }
        renderPlans();
    } catch (error) {
        console.error('خطأ في تحميل الخطط:', error);
        allPlans = getDefaultPlans();
        renderPlans();
    }
}
window.loadPlans = loadPlans;

// ─── البيانات الافتراضية ───
function getDefaultPlans() {
    return [
        // ألعاب - CS2
        { id: 'cs2-starter', mainCategory: 'games', subCategory: 'cs2', name: 'ستارتر CS2', price: 20, cpu: '2 نوى', ram: '4GB', disk: '30GB NVMe', features: ['حماية أساسية', 'دعم عادي', 'تشغيل 24/7'] },
        { id: 'cs2-pro', mainCategory: 'games', subCategory: 'cs2', name: 'برو CS2', price: 45, cpu: '4 نوى', ram: '8GB', disk: '60GB NVMe', features: ['حماية DDoS', 'دعم أولوية', 'موقع ويب'] },
        { id: 'cs2-ultra', mainCategory: 'games', subCategory: 'cs2', name: 'ألترا CS2', price: 75, cpu: '8 نوى', ram: '16GB', disk: '120GB NVMe', features: ['حماية فائقة', 'دعم VIP', 'موقع ويب + قاعدة بيانات'] },
        
        // ألعاب - Minecraft
        { id: 'mc-starter', mainCategory: 'games', subCategory: 'minecraft', name: 'ستارتر ماينكرافت', price: 15, cpu: '2 نوى', ram: '4GB', disk: '20GB NVMe', features: ['حماية أساسية', 'مودات محدودة', 'تشغيل 24/7'] },
        { id: 'mc-pro', mainCategory: 'games', subCategory: 'minecraft', name: 'برو ماينكرافت', price: 35, cpu: '4 نوى', ram: '8GB', disk: '50GB NVMe', features: ['حماية DDoS', 'مودات غير محدودة', 'دعم أولوية'] },
        { id: 'mc-ultra', mainCategory: 'games', subCategory: 'minecraft', name: 'ألترا ماينكرافت', price: 60, cpu: '8 نوى', ram: '16GB', disk: '100GB NVMe', features: ['حماية فائقة', 'مودات + إضافات', 'دعم VIP'] },
        
        // ألعاب - SAMP
        { id: 'samp-starter', mainCategory: 'games', subCategory: 'samp', name: 'ستارتر SAMP', price: 12, cpu: '1 نوى', ram: '2GB', disk: '15GB SSD', features: ['حماية أساسية', 'تشغيل 24/7'] },
        { id: 'samp-pro', mainCategory: 'games', subCategory: 'samp', name: 'برو SAMP', price: 25, cpu: '2 نوى', ram: '4GB', disk: '30GB SSD', features: ['حماية DDoS', 'دعم أولوية'] },
        
        // ألعاب - MTA
        { id: 'mta-starter', mainCategory: 'games', subCategory: 'mta', name: 'ستارتر MTA', price: 12, cpu: '1 نوى', ram: '2GB', disk: '15GB SSD', features: ['حماية أساسية', 'تشغيل 24/7'] },
        { id: 'mta-pro', mainCategory: 'games', subCategory: 'mta', name: 'برو MTA', price: 25, cpu: '2 نوى', ram: '4GB', disk: '30GB SSD', features: ['حماية DDoS', 'دعم أولوية'] },
        
        // سيرفرات - RDP
        { id: 'rdp-starter', mainCategory: 'servers', subCategory: 'rdp', name: 'RDP ستارتر', price: 30, cpu: '2 نوى', ram: '4GB', disk: '50GB SSD', features: ['وصول كامل', 'حماية أساسية', 'دعم 24/7'] },
        { id: 'rdp-pro', mainCategory: 'servers', subCategory: 'rdp', name: 'RDP برو', price: 55, cpu: '4 نوى', ram: '8GB', disk: '100GB NVMe', features: ['وصول كامل', 'حماية DDoS', 'دعم أولوية'] },
        
        // سيرفرات - VPS
        { id: 'vps-starter', mainCategory: 'servers', subCategory: 'vps', name: 'VPS ستارتر', price: 40, cpu: '2 نوى', ram: '4GB', disk: '50GB SSD', features: ['روoot وصول', 'حماية أساسية', 'دعم 24/7'] },
        { id: 'vps-pro', mainCategory: 'servers', subCategory: 'vps', name: 'VPS برو', price: 70, cpu: '4 نوى', ram: '8GB', disk: '100GB NVMe', features: ['روoot وصول', 'حماية DDoS', 'دعم أولوية'] },
        
        // بوتات - Discord
        { id: 'discord-starter', mainCategory: 'bots', subCategory: 'discord', name: 'بوت ديسكورد صغير', price: 8, cpu: '1 نوى', ram: '1GB', disk: '5GB SSD', features: ['تشغيل 24/7', 'مجلدات غير محدودة'] },
        { id: 'discord-pro', mainCategory: 'bots', subCategory: 'discord', name: 'بوت ديسكورد احترافي', price: 20, cpu: '2 نوى', ram: '4GB', disk: '20GB SSD', features: ['تشغيل 24/7', 'سجلات متقدمة', 'دعم خاص'] },
        
        // بوتات - Telegram
        { id: 'telegram-starter', mainCategory: 'bots', subCategory: 'telegram', name: 'بوت تيليجرام صغير', price: 8, cpu: '1 نوى', ram: '1GB', disk: '5GB SSD', features: ['تشغيل 24/7', 'مجلدات غير محدودة'] },
        { id: 'telegram-pro', mainCategory: 'bots', subCategory: 'telegram', name: 'بوت تيليجرام احترافي', price: 20, cpu: '2 نوى', ram: '4GB', disk: '20GB SSD', features: ['تشغيل 24/7', 'سجلات متقدمة', 'دعم خاص'] }
    ];
}

// ─── التبديل بين التصنيفات الرئيسية ───
function switchMainCategory(category) {
    currentMainCategory = category;
    currentSubCategory = subCategoriesMap[category][0]?.id || subCategoriesMap[category][0]?.id;
    
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
                ${sub.icon} ${sub.label}
            </button>
        `;
    });
    
    container.innerHTML = html;
}

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
            <p class="empty-state">
                <i class="fa-regular fa-folder-open"></i>
                لا توجد خطط في هذا التصنيف
                <br />
                <small style="color:var(--text-muted);font-size:13px;">
                    تصفح التصنيفات الأخرى
                </small>
            </p>
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

function getSubCategoryLabel(sub) {
    const labels = {
        'cs2': '🔫 CS2',
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
document.addEventListener('DOMContentLoaded', () => {
    // عرض التصنيفات الفرعية الأولية
    renderSubCategories();
});

console.log('✅ store.js (مع تصنيفات متعددة) جاهز');