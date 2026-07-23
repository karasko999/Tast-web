// store.js - إدارة المتجر مع خلفيات مميزة لكل خطة

let allPlans = [];
let currentMainCategory = 'games';
let currentSubCategory = 'cs2';

// أنماط الخلفيات المتاحة (مطورة)
const backgroundStyles = {
    // خلفيات بريميوم
    'premium-gold': 'linear-gradient(145deg, #1a140a 0%, #4a3510 30%, #8a6a20 60%, #4a3510 85%, #1a140a 100%)',
    'premium-silver': 'linear-gradient(145deg, #1a1a1a 0%, #3a3a4a 30%, #6a6a7a 60%, #3a3a4a 85%, #1a1a1a 100%)',
    'premium-bronze': 'linear-gradient(145deg, #1a0f0a 0%, #4a2a15 30%, #8a5a2a 60%, #4a2a15 85%, #1a0f0a 100%)',
    'premium-platinum': 'linear-gradient(145deg, #0a0a1a 0%, #2a2a4a 30%, #5a5a7a 60%, #2a2a4a 85%, #0a0a1a 100%)',
    'premium-diamond': 'linear-gradient(145deg, #0a1a2a 0%, #1a4a6a 30%, #4a8aaa 60%, #1a4a6a 85%, #0a1a2a 100%)',
    'premium-ruby': 'linear-gradient(145deg, #1a0a0a 0%, #4a1a1a 30%, #8a2a2a 60%, #4a1a1a 85%, #1a0a0a 100%)',
    'premium-sapphire': 'linear-gradient(145deg, #0a0a1a 0%, #1a1a5a 30%, #2a2a8a 60%, #1a1a5a 85%, #0a0a1a 100%)',
    'premium-emerald': 'linear-gradient(145deg, #0a1a0a 0%, #1a4a1a 30%, #2a8a2a 60%, #1a4a1a 85%, #0a1a0a 100%)',
    // خلفيات سايبر
    'gradient-cyber': 'linear-gradient(145deg, #0a0a1a 0%, #0a1a3a 30%, #1a3a6a 60%, #0a1a3a 85%, #0a0a1a 100%)',
    'gradient-neon': 'linear-gradient(145deg, #1a0a2a 0%, #2a1a5a 30%, #4a2a8a 60%, #2a1a5a 85%, #1a0a2a 100%)',
    'gradient-ocean': 'linear-gradient(145deg, #0a1a2a 0%, #0a3a5a 30%, #1a6a8a 60%, #0a3a5a 85%, #0a1a2a 100%)',
    'gradient-sunset': 'linear-gradient(145deg, #2a0a0a 0%, #5a2a1a 30%, #8a4a2a 60%, #5a2a1a 85%, #2a0a0a 100%)',
    'gradient-dark': 'linear-gradient(145deg, #0a0a0a 0%, #1a1a2a 30%, #2a2a3a 60%, #1a1a2a 85%, #0a0a0a 100%)'
};

// ألوان النصوص المناسبة لكل خلفية
const textColors = {
    'premium-gold': '#ffd700',
    'premium-silver': '#c0c0d0',
    'premium-bronze': '#cd7f32',
    'premium-platinum': '#e5e4e2',
    'premium-diamond': '#b9f2ff',
    'premium-ruby': '#ff4444',
    'premium-sapphire': '#4444ff',
    'premium-emerald': '#44ff44',
    'gradient-cyber': '#00d4ff',
    'gradient-neon': '#ff6bff',
    'gradient-ocean': '#00d4ff',
    'gradient-sunset': '#ff8844',
    'gradient-dark': '#e0e0e0'
};

// ألوان البادج المناسبة لكل خلفية
const badgeColors = {
    'premium-gold': 'rgba(255, 215, 0, 0.25)',
    'premium-silver': 'rgba(192, 192, 208, 0.25)',
    'premium-bronze': 'rgba(205, 127, 50, 0.25)',
    'premium-platinum': 'rgba(229, 228, 226, 0.25)',
    'premium-diamond': 'rgba(185, 242, 255, 0.25)',
    'premium-ruby': 'rgba(255, 68, 68, 0.25)',
    'premium-sapphire': 'rgba(68, 68, 255, 0.25)',
    'premium-emerald': 'rgba(68, 255, 68, 0.25)',
    'gradient-cyber': 'rgba(0, 212, 255, 0.25)',
    'gradient-neon': 'rgba(255, 107, 255, 0.25)',
    'gradient-ocean': 'rgba(0, 212, 255, 0.2)',
    'gradient-sunset': 'rgba(255, 136, 68, 0.25)',
    'gradient-dark': 'rgba(255, 255, 255, 0.1)'
};

// أيقونات لكل نوع خلفية
const backgroundIcons = {
    'premium-gold': '👑',
    'premium-silver': '⚪',
    'premium-bronze': '🟠',
    'premium-platinum': '💎',
    'premium-diamond': '💠',
    'premium-ruby': '🔴',
    'premium-sapphire': '🔵',
    'premium-emerald': '🟢',
    'gradient-cyber': '💠',
    'gradient-neon': '🌈',
    'gradient-ocean': '🌊',
    'gradient-sunset': '🌅',
    'gradient-dark': '🌑'
};

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
        const bgStyle = backgroundStyles[plan.background] || backgroundStyles['gradient-dark'];
        const textColor = textColors[plan.background] || '#ffffff';
        const badgeColor = badgeColors[plan.background] || 'rgba(255,255,255,0.1)';
        const bgIcon = backgroundIcons[plan.background] || '⭐';
        const subtitle = plan.subtitle || 'خطة احترافية للسيرفرات';
        const slots = plan.slots || 'غير محدد';
        
        html += `
            <div class="plan-card premium-card" style="background: ${bgStyle};">
                <div class="plan-card-glow"></div>
                <div class="plan-card-content">
                    <div class="plan-card-header">
                        <span class="plan-badge" style="background: ${badgeColor}; color: ${textColor};">
                            ${bgIcon} ${getMainCategoryLabel(plan.mainCategory)} • ${getSubCategoryLabel(plan.subCategory)}
                        </span>
                        <span class="plan-price-badge" style="color: ${textColor};">
                            $${plan.price}
                        </span>
                    </div>
                    <h3 style="color: ${textColor};">${plan.name}</h3>
                    <p class="plan-subtitle" style="color: ${textColor};">${subtitle}</p>
                    <div class="plan-specs">
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
                    <ul class="plan-features" style="color: ${textColor};">
                        ${features.map(f => `<li><i class="fa-solid fa-check" style="color: ${textColor};"></i> ${f}</li>`).join('')}
                    </ul>
                    <button class="btn-order premium-btn" onclick="orderPlan('${plan.id}')" 
                            style="background: ${textColor}; color: #0a0a1a;">
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

console.log('✅ store.js جاهز');