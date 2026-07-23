// dashboard.js - لوحة التحكم مع عرض البيانات المخزنة

// ─── تحميل لوحة التحكم ───
async function loadDashboard() {
    if (!authSystem.isLoggedIn || !authSystem.currentUser) {
        showToast('يرجى تسجيل الدخول أولاً', 'warning');
        return;
    }
    
    const user = authSystem.currentUser;
    console.log("📦 بيانات المستخدم في loadDashboard:", user);
    
    // 🔥 تحديث المعلومات الشخصية من كائن user
    document.getElementById('profileFullName').textContent = user.full_name || user.displayName || 'مستخدم';
    document.getElementById('profileEmail').textContent = user.email || 'البريد غير متوفر';
    document.getElementById('profileUsername').textContent = user.username ? '@' + user.username : '@' + (user.email?.split('@')[0] || 'user');
    
    // عرض تاريخ التسجيل إذا كان موجوداً
    if (user.created_at) {
        const date = user.created_at.toDate ? user.created_at.toDate() : new Date(user.created_at);
        document.getElementById('profileSince').textContent = date.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } else {
        document.getElementById('profileSince').textContent = 'اليوم';
    }
    
    // جلب الطلبات
    await loadOrders();
}
window.loadDashboard = loadDashboard;

// ─── جلب الطلبات ───
async function loadOrders() {
    const userId = authSystem.currentUser?.id || authSystem.currentUser?.uid;
    if (!userId) return;
    
    const listEl = document.getElementById('ordersList');
    const countEl = document.getElementById('orderCount');
    const activeEl = document.getElementById('activeOrders');
    
    try {
        const snapshot = await db.collection('orders')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();
        
        const orders = [];
        snapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        
        countEl.textContent = orders.length;
        const activeCount = orders.filter(o => o.status === 'جديد' || o.status === 'نشط').length;
        activeEl.textContent = activeCount;
        
        if (orders.length === 0) {
            listEl.innerHTML = `
                <p class="empty-state">
                    <i class="fa-regular fa-inbox"></i>
                    لا توجد طلبات حتى الآن
                    <br />
                    <small style="color:var(--text-muted);font-size:13px;">
                        <a href="#" onclick="navigateTo('store')" style="color:var(--accent);">
                            <i class="fa-solid fa-arrow-left"></i> تصفح المتجر
                        </a>
                    </small>
                </p>
            `;
            return;
        }
        
        let html = `
            <div class="orders-table-wrap">
                <table class="orders-table">
                    <thead>
                        <tr>
                            <th>الخطة</th>
                            <th>السعر</th>
                            <th>الفئة</th>
                            <th>الحالة</th>
                            <th>التاريخ</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        orders.forEach(order => {
            const date = order.createdAt?.toDate ? 
                order.createdAt.toDate().toLocaleDateString('ar-EG') : 
                '--';
            
            const statusMap = {
                'جديد': 'new',
                'نشط': 'active',
                'مكتمل': 'completed',
                'ملغي': 'cancelled'
            };
            const statusClass = statusMap[order.status] || 'new';
            const categoryIcon = order.category === 'game' ? '🎮' : '🤖';
            const categoryLabel = order.category === 'game' ? 'لعبة' : 'بوت';
            
            html += `
                <tr>
                    <td><strong>${order.planName || '--'}</strong></td>
                    <td>$${order.planPrice || 0}</td>
                    <td>${categoryIcon} ${categoryLabel}</td>
                    <td><span class="status-badge ${statusClass}">${order.status || 'جديد'}</span></td>
                    <td>${date}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        listEl.innerHTML = html;
        
    } catch (error) {
        console.error('خطأ في جلب الطلبات:', error);
        listEl.innerHTML = `
            <p class="empty-state" style="color:var(--danger);">
                <i class="fa-solid fa-circle-exclamation"></i>
                حدث خطأ في تحميل الطلبات
            </p>
        `;
    }
}
window.loadOrders = loadOrders;

console.log('✅ dashboard.js (محسّن) جاهز');