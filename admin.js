// admin.js - إدارة الخطط (للمسؤول فقط)

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
                            <th>الميزات</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        plans.forEach(plan => {
            const features = plan.features ? plan.features.join('، ') : '--';
            const categoryLabel = plan.category === 'game' ? '🎮 لعبة' : '🤖 بوت';
            html += `
                <tr>
                    <td><strong>${plan.name}</strong></td>
                    <td>$${plan.price}</td>
                    <td>${categoryLabel}</td>
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

// ─── إضافة خطة جديدة ───
async function addPlan(e) {
    e.preventDefault();
    
    const name = document.getElementById('adminPlanName').value.trim();
    const price = parseFloat(document.getElementById('adminPlanPrice').value);
    const category = document.getElementById('adminPlanCategory').value;
    const ram = document.getElementById('adminPlanRam').value.trim();
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
        ram: ram || 'غير محدد',
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
        
        // نافذة تعديل بسيطة
        const newName = prompt('✏️ اسم الخطة الجديد:', plan.name);
        if (newName === null) return; // ألغى المستخدم
        
        const newPrice = prompt('💰 السعر الجديد ($):', plan.price);
        if (newPrice === null) return;
        if (isNaN(newPrice) || parseFloat(newPrice) < 0) {
            showToast('السعر يجب أن يكون رقماً موجباً', 'error');
            return;
        }
        
        const currentFeatures = plan.features ? plan.features.join('، ') : '';
        const newFeaturesInput = prompt('📝 الميزات (افصلها بفواصل):', currentFeatures);
        if (newFeaturesInput === null) return;
        
        const newFeatures = newFeaturesInput ? newFeaturesInput.split(',').map(f => f.trim()).filter(f => f) : [];
        
        // تحديث البيانات في Firestore
        await db.collection('plans').doc(planId).update({
            name: newName,
            price: parseFloat(newPrice),
            features: newFeatures,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showToast('✅ تم تحديث الخطة بنجاح!', 'success');
        loadAdminPlans(); // تحديث جدول الأدمن
        if (typeof loadPlans === 'function') loadPlans(); // تحديث المتجر
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
        loadAdminPlans(); // تحديث جدول الأدمن
        if (typeof loadPlans === 'function') loadPlans(); // تحديث المتجر
    } catch (error) {
        console.error("خطأ في الحذف:", error);
        showToast('❌ فشل الحذف: ' + error.message, 'error');
    }
}
window.deletePlan = deletePlan;

console.log('✅ admin.js جاهز');