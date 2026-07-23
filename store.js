// store.js - إدارة المتجر والخطط (معدّل مع CPU, RAM, Disk, SubCategory)

let allPlans = [];
let currentFilter = 'game';

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
        renderPlans(currentFilter);
    } catch (error) {
        console.error('خطأ في تحميل الخطط:', error);
        allPlans = getDefaultPlans();
        renderPlans(currentFilter);
    }
}
window.loadPlans = loadPlans;

// ─── البيانات الافتراضية (مع CPU, RAM, Disk, SubCategory) ───
function getDefaultPlans() {
    return [
        {
            id: 'game-starter',
            category: 'game',
            subCategory: 'starter',
            name: 'ستارتر',
            price: 15,
            cpu: '2 نوى',
            ram: '4GB',
            disk: '30GB NVMe',
            features: ['حماية أساسية', 'دعم عادي', 'تشغيل 24/7']
        },
        {
            id: 'game-standard',
            category: 'game',
            subCategory: 'standard',
            name: 'عادي',
            price: 30,
            cpu: '4 نوى',
            ram: '8GB',
            disk: '60GB NVMe',
            features: ['حماية DDoS', 'دعم أولوية', 'موقع ويب', 'تشغيل 24/7']
        },
        {
            id: 'game-pro',
            category: 'game',
            subCategory: 'pro',
            name: 'احترافي',
            price: 50,
            cpu: '8 نوى',
            ram: '16GB',
            disk: '120GB NVMe',
            features: ['حماية فائقة', 'دعم خاص', 'موقع ويب + قاعدة بيانات', 'تشغيل 24/7']
        },
        {
            id: 'game-ultra',
            category: 'game',
            subCategory: 'ultra',
            name: 'ألترا',
            price: 80,
            cpu: '16 نوى',
            ram: '32GB',
            disk: '240GB NVMe',
            features: ['حماية فائقة', 'دعم VIP', 'موقع ويب + قاعدة بيانات', 'نسخ احتياطي يومي', 'تشغيل 24/7']
        },
        {
            id: 'bot-starter',
            category: 'bot',
            subCategory: 'starter',
            name: 'بوت صغير',
            price: 8,
            cpu: '1 نوى',
            ram: '1GB',
            disk: '5GB SSD',
            features: ['مجلدات غير محدودة', 'تشغيل 24/7']
        },
        {
            id: 'bot-standard',
            category: 'bot',
            subCategory: 'standard',
            name: 'بوت عادي',
            price: 18,
            cpu: '2 نوى',
            ram: '4GB',
            disk: '20GB SSD',
            features: ['مجلدات غير محدودة', 'تشغيل 24/7', 'سجلات متقدمة']
        },
        {
            id: 'bot-pro',
            category: 'bot',
            subCategory: 'pro',
            name: 'بوت احترافي',
            price: 40,
            cpu: '4 نوى',
            ram: '8GB',
            disk: '50GB NVMe',
            features: ['مجلدات غير محدودة', 'أولوية التشغيل', 'دعم خاص', 'سجلات متقدمة']
        }
    ];
}

// ─── دالة مساعدة لعرض اسم التصنيف الفرعي ───
function getSubCategoryLabel(subCategory) {
    const labels = {
        'starter': '🌟 مبتدئ',
        'standard': '⚡ عادي',
        'pro': '🔥 احترافي',
        'ultra': '💎 ألترا'
    };
    return labels[subCategory] || subCategory || '--';
}

// ─── عرض الخطط ───
function renderPlans(filter) {
    currentFilter = filter;
    const container = document.getElementById('plansContainer');
    const filtered = allPlans.filter(p => p.category === filter);
    
    if (filtered.length === 0) {
        container.innerHTML = `<p class="loading-text"><i class="fa-regular fa-face-frown"></i> لا توجد خطط في هذه الفئة</p>`;
        return;
    }
    
    // ترتيب الخطط حسب التصنيف الفرعي
    const order = ['starter', 'standard', 'pro', 'ultra'];
    filtered.sort((a, b) => order.indexOf(a.subCategory) - order.indexOf(b.subCategory));
    
    let html = '';
    filtered.forEach(plan => {
        const features = plan.features || ['ميزة غير محددة'];
        const badgeIcon = plan.category === 'game' ? 'fa-gamepad' : 'fa-robot';
        const badgeText = plan.category === 'game' ? '🎮 لعبة' : '🤖 بوت';
        const subLabel = getSubCategoryLabel(plan.subCategory);
        
        html += `
            <div class="plan-card">
                <span class="plan-badge"><i class="fa-solid ${badgeIcon}"></i> ${badgeText} • ${subLabel}</span>
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

// ─── تصفية الخطط ───
function filterPlans(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    renderPlans(filter);
}
window.filterPlans = filterPlans;

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
            category: plan.category,
            subCategory: plan.subCategory || 'standard',
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

console.log('✅ store.js (معدّل مع CPU, RAM, Disk) جاهز');