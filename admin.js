// admin.js - إدارة الخطط (معدّل مع CPU, RAM, Disk, SubCategory)

// ─── تحميل الخطط في لوحة الأدمن ───
async function loadAdminPlans() {
    const container = document.getElementById('adminPlansList');
    container.innerHTML = `<p class="loading-text"><i class="fa-solid fa-spinner fa-spin"></i> جاري التحميل...</p>`;
    
    try {
        const result = await window.getPlans();
        let plans = [];
        if (result.success && result.plans.length > 0) {
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
                            <th>الفئة</th>
                            <th>التصنيف</th>
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
            const categoryLabel = plan.category === 'game' ? '🎮 لعبة' : '🤖 بوت';
            const subCategoryLabel = getSubCategoryLabel(plan.subCategory);
            html += `
                <tr>
                    <td><strong>${plan.name}</strong></td>
                    <td>$${plan.price}</td>
                    <td>${categoryLabel}</td>
                    <td>${subCategoryLabel}</td>
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
        console.error("خطأ في تحميل الخطط:", error);
        container.innerHTML = `<p class="empty-state" style="color:var(--danger);">⚠️ فشل تحميل الخطط</p>`;
    }
}
window.loadAdminPlans = loadAdminPlans;

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

// ─── إضافة خطة جديدة (مع CPU, RAM, Disk, SubCategory) ───
async function addPlan(e) {
    e.preventDefault();
    
    const name = document.getElementById('adminPlanName').value.trim();
    const price = parseFloat(document.getElementById('adminPlanPrice').value);
    const category = document.getElementById('adminPlanCategory').value;
    const subCategory = document.getElementById('adminPlanSubCategory').value;
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
        category: category,
        subCategory: subCategory,
        cpu: cpu || 'غير محدد',
        ram: ram || 'غير محدد',
        disk: disk || 'غير محدد',
        features: features,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection('plans').add(planData);
        showToast('✅ تم إضافة الخطة بنجاح!', 'success');
        document.getElementById('addPlanForm').reset();
        loadAdminPlans(); // تحديث جدول الأدمن
        if (typeof loadPlans === 'function') loadPlans(); // تحديث المتجر
    } catch (error) {
        console.error("خطأ في الإضافة:", error);
        showToast('❌ فشل الإضافة: ' + error.message, 'error');
    }
}
window.addPlan = addPlan;

// ─── تعديل خطة ───
async function editPlan(planId) {
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

console.log('✅ admin.js (معدّل مع CPU, RAM, Disk) جاهز');