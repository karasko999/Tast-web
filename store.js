// store.js - إدارة المتجر مع صور الخلفيات

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

async function loadPlans() {
    const container = document.getElementById('plansContainer');
    if (!container) return;
    container.innerHTML = `<p class="loading-text"><i class="fa-solid fa-spinner fa-spin"></i> جاري تحميل الخطط...</p>`;
    
    try {
        const result = await window.getPlans();
        if (result.success && result.plans && result.plans.length > 0) {
            allPlans = result.plans;
        } else {
            allPlans = [];
        }
        renderPlans();
    } catch (error) {
        console.error('❌ خطأ في تحميل الخطط:', error);
        allPlans = [];
        renderPlans();
    }
}
window.loadPlans = loadPlans;

function renderSubCategories() {
    const container = document.getElementById('subCategoriesContainer');
    if (!container) return;
    
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

function switchMainCategory(category) {
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

function switchSubCategory(subId) {
    currentSubCategory = subId;
    renderSubCategories();
    renderPlans();
}
window.switchSubCategory = switchSubCategory;

function renderPlans() {
    const container = document.getElementById('plansContainer');
    if (!container) return;
    
    const filtered = allPlans.filter(p => 
        p.mainCategory === currentMainCategory && 
        p.subCategory === currentSubCategory
    );
    
    if (filtered.length === 0) {
        const isAdmin = authSystem.isAdmin === true;
        const adminButton = isAdmin ? `
            <button class="btn-primary" style="width:auto;padding:12px 35px;margin-top:15px;" onclick="navigateTo('admin')">
                <i class="fa-solid fa-plus"></i> إضافة خطة
            </button>
        ` : '';
        
        container.innerHTML = `
            <div class="empty-state-modern">
                <div class="empty-icon">📦</div>
                <h3>لا توجد خطط في هذا التصنيف</h3>
                <p class="muted">${isAdmin ? 'قم بإضافة خطط جديدة' : 'سيتم إضافة خطط قريباً'}</p>
                ${adminButton}
            </div>
        `;
        return;
    }
    
    let html = '';
    filtered.forEach(plan => {
        const features = plan.features || ['ميزة غير محددة'];
        const subtitle = plan.subtitle || 'خطة احترافية للسيرفرات';
        const slots = plan.slots || 'غير محدد';
        
        // 🔥 تحديد خلفية البطاقة (صورة أو تدرج لوني)
        let bgStyle;
        if (plan.imageUrl) {
            bgStyle = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5)), url('${plan.imageUrl}') center/cover no-repeat`;
        } else {
            bgStyle = 'linear-gradient(145deg, #0a0a1a 0%, #1a1a2a 50%, #0a0a1a 100%)';
        }
        
        const textColor = '#ffffff';
        
        html += `
            <div class="plan-card premium-card" style="background: ${bgStyle}; min-height: 480px; position: relative; border: 1px solid rgba(255,255,255,0.08);">
                <div class="plan-card-content" style="position:relative;z-index:1;padding:28px 24px;display:flex;flex-direction:column;flex:1;min-height:480px;backdrop-filter:blur(2px);">
                    <div class="plan-card-header">
                        <span class="plan-badge" style="background: rgba(0,0,0,0.5); color: ${textColor}; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1);">
                            ${getMainCategoryLabel(plan.mainCategory)} • ${getSubCategoryLabel(plan.subCategory)}
                        </span>
                        <span class="plan-price-badge" style="color: ${textColor}; background: rgba(0,0,0,0.5); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1);">
                            $${plan.price}
                        </span>
                    </div>
                    <h3 style="color: ${textColor}; text-shadow: 0 2px 20px rgba(0,0,0,0.8);">${plan.name}</h3>
                    <p class="plan-subtitle" style="color: ${textColor}; text-shadow: 0 2px 10px rgba(0,0,0,0.8); opacity:0.9;">${subtitle}</p>
                    <div class="plan-specs" style="background: rgba(0,0,0,0.5); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.05);">
                        <div class="spec-item">
                            <i class="fa-solid fa-users" style="color: ${textColor};"></i>
                            <span style="color: ${textColor};">${slots}</span>
                        </div>
                        <div class="spec-item">
                            <i class="fa-solid fa-microchip" style="color: ${textColor};"></i>
                            <span style="color: ${textColor};">${plan.cpu || '--'}</span>
                        </div>
                        <div class="spec-item">
                            <i class="fa-solid fa-memory" style="color: ${textColor};"></i>
                            <span style="color: ${textColor};">${plan.ram || '--'}</span>
                        </div>
                        <div class="spec-item">
                            <i class="fa-solid fa-hard-drive" style="color: ${textColor};"></i>
                            <span style="color: ${textColor};">${plan.disk || '--'}</span>
                        </div>
                    </div>
                    <ul class="plan-features" style="color: ${textColor}; text-shadow: 0 2px 10px rgba(0,0,0,0.8);">
                        ${features.map(f => `<li><i class="fa-solid fa-check" style="color: ${textColor};"></i> ${f}</li>`).join('')}
                    </ul>
                    <button class="btn-order premium-btn" onclick="orderPlan('${plan.id}')" 
                            style="background: ${textColor}; color: #0a0a1a; border: none; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                        <i class="fa-solid fa-rocket"></i> تقديم طلب
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}
window.renderPlans = renderPlans;

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

let currentOrderPlanId = null;

async function orderPlan(planId) {
    if (!authSystem.isLoggedIn || !authSystem.currentUser) {
        showToast('يرجى تسجيل الدخول أولاً', 'warning');
        return;
    }
    
    const plan = allPlans.find(p => p.id === planId);
    if (!plan) {
        showToast('الخطة غير موجودة', 'error');
        return;
    }
    
    currentOrderPlanId = planId;
    document.getElementById('orderPlanName').textContent = plan.name;
    document.getElementById('orderGmail').value = authSystem.currentUser.email || '';
    document.getElementById('orderUsername').value = authSystem.currentUser.username || authSystem.currentUser.full_name || '';
    
    document.getElementById('orderModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}
window.orderPlan = orderPlan;

function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}
window.closeOrderModal = closeOrderModal;

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
                showToast('يرجى إدخال جميع البيانات', 'warning');
                return;
            }
            
            if (password.length < 6) {
                showToast('كلمة المرور 6 أحرف على الأقل', 'warning');
                return;
            }
            
            const plan = allPlans.find(p => p.id === currentOrderPlanId);
            if (!plan) {
                showToast('حدث خطأ، حاول مرة أخرى', 'error');
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
            } catch (error) {
                console.error('❌ خطأ:', error);
                showToast('❌ فشل إرسال الطلب: ' + error.message, 'error');
            }
        });
    }
    
    renderSubCategories();
    if (typeof loadPlans === 'function') loadPlans();
});

console.log('✅ store.js (مع صور الخلفيات) جاهز');