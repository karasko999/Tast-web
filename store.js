// ─── طلب خطة (مع نموذج متقدم) ───
let currentOrderPlanId = null;

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
    
    // حفظ معرف الخطة الحالية
    currentOrderPlanId = planId;
    
    // عرض اسم الخطة في المودال
    document.getElementById('orderPlanName').textContent = plan.name;
    
    // تعبئة البريد الإلكتروني تلقائياً
    const userEmail = authSystem.currentUser.email || '';
    document.getElementById('orderGmail').value = userEmail;
    
    // تعبئة اسم المستخدم تلقائياً
    const username = authSystem.currentUser.username || authSystem.currentUser.full_name || '';
    document.getElementById('orderUsername').value = username;
    
    // إظهار المودال
    document.getElementById('orderModal').style.display = 'flex';
    
    // منع التمرير في الخلفية
    document.body.style.overflow = 'hidden';
}
window.orderPlan = orderPlan;

// ─── إغلاق المودال ───
function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('orderDetailsForm').reset();
    // إعادة تعبئة البريد والاسم بعد الإغلاق
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
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // جلب البيانات من النموذج
            const gmail = document.getElementById('orderGmail').value.trim();
            const username = document.getElementById('orderUsername').value.trim();
            const password = document.getElementById('orderPassword').value;
            const hostName = document.getElementById('orderHostName').value.trim();
            const serverType = document.getElementById('orderServerType').value;
            
            // التحقق من صحة البيانات
            if (!gmail || !username || !password || !hostName || !serverType) {
                showToast('يرجى إدخال جميع البيانات المطلوبة', 'warning');
                return;
            }
            
            if (password.length < 6) {
                showToast('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'warning');
                return;
            }
            
            // البحث عن الخطة
            const plan = allPlans.find(p => p.id === currentOrderPlanId);
            if (!plan) {
                showToast('حدث خطأ، الرجاء المحاولة مرة أخرى', 'error');
                return;
            }
            
            // تحضير بيانات الطلب
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
                // 🔥 بيانات الدخول
                gmail: gmail,
                orderUsername: username,
                orderPassword: password,
                hostName: hostName,
                serverType: serverType,
                status: 'جديد',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            console.log("📦 بيانات الطلب:", orderData);
            
            try {
                await db.collection('orders').add(orderData);
                showToast(`✅ تم طلب "${plan.name}" بنجاح! سيتم التواصل معك قريباً.`, 'success');
                closeOrderModal();
                
                // تحديث لوحة التحكم إذا كانت مفتوحة
                if (document.getElementById('page-dashboard').classList.contains('active')) {
                    if (typeof loadDashboard === 'function') loadDashboard();
                }
            } catch (error) {
                console.error('❌ خطأ في الطلب:', error);
                showToast('❌ فشل إرسال الطلب: ' + error.message, 'error');
            }
        });
    }
});