// store.js - إدارة المتجر مع تصنيفات متعددة

let allPlans = [];
let currentMainCategory = 'games';
let currentSubCategory = 'cs2';

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
    console.log("📦 جاري تحميل الخطط...");
    const container = document.getElementById('plansContainer');
    if (!container) {
        console.warn("⚠️ plansContainer غير موجود");
        return;
    }
    container.innerHTML = `<p class="loading-text"><i class="fa-solid fa-spinner fa-spin"></i> جاري تحميل الخطط...</p>`;
    
    try {
        const result = await window.getPlans();
        console.log("📦 نتيجة جلب الخطط:", result);
        
        if (result.success && result.plans && result.plans.length > 0) {
            allPlans = result.plans;
            console.log("✅ تم تحميل", allPlans.length, "خطة");
        } else {
            allPlans = [];
            console.log("📭 لا توجد خطط");
        }
        renderPlans();
    } catch (error) {
        console.error('❌ خطأ في تحميل الخطط:', error);
        allPlans = [];
        renderPlans();
    }
}
window.loadPlans = loadPlans;

// ─── عرض التصنيفات الفرعية ───
function renderSubCategories() {
    const container = document.getElementById('subCategoriesContainer');
    if (!container) {
        console.warn("⚠️ subCategoriesContainer غير موجود");
        return;
    }
    
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

// ─── التبديل بين التصنيفات الرئيسية ───
function switchMainCategory(category) {
    console.log("🔄 تبديل التصنيف الرئيسي:", category);
    currentMainCategory = category;
    const subCats = subCategoriesMap[category] || [];
    currentSubCategory = subCats[0]?.id || '';
    
    document.querySelectorAll('.store-cat-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.main === category);
    });
    
    renderSubCategories();
    renderPlans();
}
window.switchMainCategory = switchMainCategory;

// ─── التبديل بين التصنيفات الفرعية ───
function switchSubCategory(subId) {
    console.log("🔄 تبديل التصنيف الفرعي:", subId);
    currentSubCategory = subId;
    renderSubCategories();
    renderPlans();
}
window.switchSubCategory = switchSubCategory;

// ─── عرض الخطط ───
function renderPlans() {
    const container = document.getElementById('plansContainer');
    if (!container) {
        console.warn("⚠️ plansContainer غير موجود");
        return;
    }
    
    console.log("📊 عرض الخطط، التصنيف:", currentMainCategory, "->", currentSubCategory);
    console.log("📊 عدد الخطط الكلي:", allPlans.length);
    
    // تصفية الخطط
    const filtered = allPlans.filter(p => 
        p.mainCategory === currentMainCategory && 
        p.subCategory === currentSubCategory
    );
    
    console.log("📊 الخطط بعد التصفية:", filtered.length);
    
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

// ─── طلب خطة ───
let currentOrderPlanId = null;

async function orderPlan(planId) {
    console.log("🛒 طلب خطة:", planId);
    
    if (!authSystem.isLoggedIn || !authSystem.currentUser) {
        showToast('يرجى تسجيل الدخول أولاً لإتمام الطلب', 'warning');
        return;
    }
    
    const plan = allPlans.find(p => p.id === planId);
    if (!plan) {
        showToast('الخطة غير موجودة', 'error');
        return;
    }
    
    currentOrderPlanId = planId;
    document.getElementById('orderPlanName').textContent = plan.name;
    
    const userEmail = authSystem.currentUser.email || '';
    document.getElementById('orderGmail').value = userEmail;
    
    const username = authSystem.currentUser.username || authSystem.currentUser.full_name || '';
    document.getElementById('orderUsername').value = username;
    
    document.getElementById('orderModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}
window.orderPlan = orderPlan;

function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('orderDetailsForm')?.reset();
    const user = authSystem.currentUser;
    if (user) {
        document.getElementById('orderGmail').value = user.email || '';
        document.getElementById('orderUsername').value = user.username || user.full_name || '';
    }
}
window.closeOrderModal = closeOrderModal;

// ─── معالجة تقديم نموذج الطلب ───
document.addEventListener('DOMContentLoaded', function() {
    const orderForm = document.getElementById('orderDetailsForm');
    if (orderForm) {
        orderForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const gmail = document.getElementById('orderGmail').value.trim();
            const username = document.getElementById('orderUsername').value.trim();
            const password = document.getElementById('orderPassword').value;
            const hostName = document.getElementById('orderHostName').value.trim();
            const serverType = document.getElementById('orderServerType').value;
            
            if (!gmail || !username || !password || !hostName || !serverType) {
                showToast('يرجى إدخال جميع البيانات المطلوبة', 'warning');
                return;
            }
            
            if (password.length < 6) {
                showToast('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'warning');
                return;
            }
            
            const plan = allPlans.find(p => p.id === currentOrderPlanId);
            if (!plan) {
                showToast('حدث خطأ، الرجاء المحاولة مرة أخرى', 'error');
                return;
            }
            
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
                gmail: gmail,
                orderUsername: username,
                orderPassword: password,
                hostName: hostName,
                serverType: serverType,
                status: 'جديد',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            try {
                await db.collection('orders').add(orderData);
                showToast(`✅ تم طلب "${plan.name}" بنجاح!`, 'success');
                closeOrderModal();
                
                if (document.getElementById('page-dashboard').classList.contains('active')) {
                    if (typeof loadDashboard === 'function') loadDashboard();
                }
            } catch (error) {
                console.error('❌ خطأ في الطلب:', error);
                showToast('❌ فشل إرسال الطلب: ' + error.message, 'error');
            }
        });
    }
    
    // تهيئة التصنيفات الفرعية
    renderSubCategories();
    
    // تحميل الخطط
    if (typeof loadPlans === 'function') {
        loadPlans();
    }
});

console.log('✅ store.js جاهز');