// dashboard.js - لوحة التحكم مع جلب البيانات من Firestore

// ─── تحميل لوحة التحكم ───
async function loadDashboard() {
    if (!authSystem.isLoggedIn || !authSystem.currentUser) {
        showToast('يرجى تسجيل الدخول أولاً', 'warning');
        return;
    }
    
    const user = authSystem.currentUser;
    console.log("📦 بيانات المستخدم الحالية:", user);
    
    // 🔥 إذا كانت البيانات غير مكتملة، نحاول جلبها من Firestore مباشرة
    let userData = user;
    if (!user.email || user.email === 'username@' || !user.created_at) {
        try {
            const doc = await db.collection('users').doc(user.uid || user.id).get();
            if (doc.exists) {
                userData = { id: doc.id, ...doc.data() };
                console.log("✅ تم جلب البيانات من Firestore:", userData);
            } else {
                console.warn("⚠️ لا يوجد مستند للمستخدم في Firestore");
            }
        } catch (error) {
            console.error("❌ خطأ في جلب بيانات المستخدم:", error);
        }
    }
    
    // ─── عرض البيانات ───
    // الاسم الكامل
    document.getElementById('profileFullName').textContent = userData.full_name || userData.username || userData.displayName || 'مستخدم';
    
    // البريد الإلكتروني
    document.getElementById('profileEmail').textContent = userData.email || 'البريد غير متوفر';
    
    // اسم المستخدم
    const username = userData.username || userData.email?.split('@')[0] || 'user';
    document.getElementById('profileUsername').textContent = '@' + username;
    
    // تاريخ التسجيل
    if (userData.created_at) {
        let date;
        if (userData.created_at.toDate) {
            date = userData.created_at.toDate();
        } else if (typeof userData.created_at === 'string') {
            date = new Date(userData.created_at);
        } else {
            date = new Date(userData.created_at);
        }
        
        // التحقق من أن التاريخ صحيح
        if (!isNaN(date.getTime())) {
            document.getElementById('profileSince').textContent = date.toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } else {
            document.getElementById('profileSince').textContent = 'اليوم';
        }
    } else {
        document.getElementById('profileSince').textContent = 'اليوم';
    }
    
    // جلب الطلبات
    await loadOrders(userData);
}
window.loadDashboard = loadDashboard;

// ─── جلب الطلبات ───
async function loadOrders(userData) {
    const userId = userData?.id || userData?.uid || authSystem.currentUser?.id || authSystem.currentUser?.uid;
    if (!userId) {
        console.warn("⚠️ لا يوجد معرف للمستخدم");
        return;
    }
    
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
        console.error('❌ خطأ في جلب الطلبات:', error);
        listEl.innerHTML = `
            <p class="empty-state" style="color:var(--danger);">
                <i class="fa-solid fa-circle-exclamation"></i>
                حدث خطأ في تحميل الطلبات
            </p>
        `;
    }
}
window.loadOrders = loadOrders;

console.log('✅ dashboard.js (محسّن مع جلب البيانات) جاهز');