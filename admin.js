// admin.js - إدارة الخطط (للمسؤول فقط)

// ─── تحميل الخطط في لوحة الأدمن ───
async function loadAdminPlans() {
    console.log("📊 تحميل خطط الأدمن...");
    
    if (!authSystem.isAdmin) {
        console.warn("⚠️ المستخدم ليس أدمن");
        const container = document.getElementById('adminPlansList');
        if (container) {
            container.innerHTML = `<p class="empty-state">⚠️ غير مصرح لك بالوصول</p>`;
        }
        return;
    }
    
    const container = document.getElementById('adminPlansList');
    if (!container) {
        console.warn("⚠️ adminPlansList غير موجود");
        return;
    }
    container.innerHTML = `<p class="loading-text"><i class="fa-solid fa-spinner fa-spin"></i> جاري التحميل...</p>`;
    
    try {
        const result = await window.getPlans();
        console.log("📦 نتيجة جلب الخطط للأدمن:", result);
        
        let plans = [];
        if (result.success && result.plans && result.plans.length > 0) {
            plans = result.plans;
        } else {
            container.innerHTML = `<p class="empty-state"><i class="fa-regular fa-folder-open"></i> لا توجد خطط مضافة بعد</p>`;
            return;
        }

        let html = `
            <div class="table-responsive">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>الاسم</th>
                            <th>السعر</th>
                            <th>التصنيف</th>
                            <th>النوع</th>
                            <th>CPU</th>
                            <th>RAM</th>
                            <th>Disk</th>
                            <th>الميزات</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        plans.forEach(plan => {
            const features = plan.features ? plan.features.join('، ') : '--';
            const mainLabel = getMainCategoryLabel(plan.mainCategory);
            const subLabel = getSubCategoryLabel(plan.subCategory);
            html += `
                <tr>
                    <td><strong>${plan.name}</strong></td>
                    <td>$${plan.price}</td>
                    <td>${mainLabel}</td>
                    <td>${subLabel}</td>
                    <td>${plan.cpu || '--'}</td>
                    <td>${plan.ram || '--'}</td>
                    <td>${plan.disk || '--'}</td>
                    <td style="font-size:13px;color:var(--text-muted);">${features}</td>
                    <td>
                        <button class="btn-edit" onclick="editPlan('${plan.id}')" title="تعديل">
                            <i class="fa-regular fa-pen-to-square"></i>
                        </button>
                        <button class="btn-delete" onclick="deletePlan('${plan.id}')" title="حذف">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;
        container.innerHTML = html;
    } catch (error) {
        console.error("❌ خطأ في تحميل الخطط:", error);
        container.innerHTML = `<p class="empty-state" style="color:var(--danger);">⚠️ فشل تحميل الخطط</p>`;
    }
}
window.loadAdminPlans = loadAdminPlans;

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

// ─── تحديث قائمة التصنيفات الفرعية ───
function updateSubCategoryOptions() {
    const mainSelect = document.getElementById('adminMainCategory');
    const subSelect = document.getElementById('adminSubCategory');
    if (!mainSelect || !subSelect) {
        console.warn("⚠️ عناصر الأدمن غير موجودة");
        return;
    }
    
    const mainCat = mainSelect.value;
    subSelect.innerHTML = '';
    
    const subMap = {
        'games': [
            { id: 'cs2', label: '🎯 CS2' },
            { id: 'minecraft', label: '⛏️ Minecraft' },
            { id: 'samp', label: '🚗 SAMP' },
            { id: 'mta', label: '🏎️ MTA' }
        ],
        'servers': [
            { id: 'rdp', label: '🖥️ RDP' },
            { id: 'vps', label: '☁️ VPS' }
        ],
        'bots': [
            { id: 'discord', label: '🤖 Discord' },
            { id: 'telegram', label: '📱 Telegram' }
        ]
    };
    
    const options = subMap[mainCat] || [];
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.id;
        option.textContent = opt.label;
        subSelect.appendChild(option);
    });
}

// ─── إضافة خطة جديدة (في main.js مباشرة) ───
// تم نقل هذه الوظيفة إلى main.js

// ─── تعديل خطة ───
async function editPlan(planId) {
    if (!authSystem.isAdmin) {
        showToast('⚠️ فقط المسؤول يمكنه تعديل الخطط', 'error');
        return;
    }
    
    try {
        const doc = await db.collection('plans').doc(planId).get();
        if (!doc.exists) {
            showToast('الخطة غير موجودة', 'error');
            return;
        }
        const plan = doc.data();
        
        const newName = prompt('✏️ اسم الخطة الجديد:', plan.name);
        if (newName === null) return;
        if (!newName.trim()) {
            showToast('الاسم مطلوب', 'error');
            return;
        }
        
        const newPrice = prompt('💰 السعر الجديد ($):', plan.price);
        if (newPrice === null) return;
        if (isNaN(newPrice) || parseFloat(newPrice) < 0) {
            showToast('السعر يجب أن يكون رقماً موجباً', 'error');
            return;
        }
        
        const newCpu = prompt('🖥️ عدد النوى (CPU):', plan.cpu || '');
        if (newCpu === null) return;
        
        const newRam = prompt('🧠 الرام (RAM):', plan.ram || '');
        if (newRam === null) return;
        
        const newDisk = prompt('💾 المساحة التخزينية (Disk):', plan.disk || '');
        if (newDisk === null) return;
        
        const currentFeatures = plan.features ? plan.features.join('، ') : '';
        const newFeaturesInput = prompt('📝 الميزات (افصلها بفواصل):', currentFeatures);
        if (newFeaturesInput === null) return;
        
        const newFeatures = newFeaturesInput ? newFeaturesInput.split(',').map(f => f.trim()).filter(f => f) : [];
        
        await db.collection('plans').doc(planId).update({
            name: newName.trim(),
            price: parseFloat(newPrice),
            cpu: newCpu.trim() || 'غير محدد',
            ram: newRam.trim() || 'غير محدد',
            disk: newDisk.trim() || 'غير محدد',
            features: newFeatures,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showToast('✅ تم تحديث الخطة بنجاح!', 'success');
        loadAdminPlans();
        if (typeof loadPlans === 'function') loadPlans();
    } catch (error) {
        console.error("خطأ في التعديل:", error);
        showToast('❌ فشل التعديل: ' + error.message, 'error');
    }
}
window.editPlan = editPlan;

// ─── حذف خطة ───
async function deletePlan(planId) {
    if (!authSystem.isAdmin) {
        showToast('⚠️ فقط المسؤول يمكنه حذف الخطط', 'error');
        return;
    }
    
    if (!confirm('⚠️ هل أنت متأكد من حذف هذه الخطة؟ لا يمكن التراجع عن هذا الإجراء.')) {
        return;
    }
    
    try {
        await db.collection('plans').doc(planId).delete();
        showToast('🗑️ تم حذف الخطة بنجاح', 'success');
        loadAdminPlans();
        if (typeof loadPlans === 'function') loadPlans();
    } catch (error) {
        console.error("خطأ في الحذف:", error);
        showToast('❌ فشل الحذف: ' + error.message, 'error');
    }
}
window.deletePlan = deletePlan;

// ─── تهيئة التصنيفات الفرعية عند تحميل الصفحة ───
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ admin.js تم تحميله");
    const mainSelect = document.getElementById('adminMainCategory');
    if (mainSelect) {
        mainSelect.addEventListener('change', updateSubCategoryOptions);
    }
    updateSubCategoryOptions();
});

console.log('✅ admin.js جاهز');