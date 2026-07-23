// ─── جلب الطلبات وعرضها ───
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
                            <th>السيرفر</th>
                            <th>المضيف</th>
                            <th>الحالة</th>
                            <th>التاريخ</th>
                            <th>التفاصيل</th>
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
            const serverTypeLabel = getServerTypeLabel(order.serverType);
            
            // 🔥 عرض بيانات الدخول في نافذة منبثقة
            const detailsBtn = `
                <button class="btn-details" onclick="showOrderDetails('${order.id}')" title="عرض التفاصيل">
                    <i class="fa-regular fa-eye"></i>
                </button>
            `;
            
            html += `
                <tr>
                    <td><strong>${order.planName || '--'}</strong></td>
                    <td>$${order.planPrice || 0}</td>
                    <td>${serverTypeLabel}</td>
                    <td>${order.hostName || '--'}</td>
                    <td><span class="status-badge ${statusClass}">${order.status || 'جديد'}</span></td>
                    <td>${date}</td>
                    <td>${detailsBtn}</td>
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

// ─── دالة مساعدة لعرض نوع السيرفر ───
function getServerTypeLabel(type) {
    const labels = {
        'vps': '☁️ VPS',
        'rdp': '🖥️ RDP',
        'game': '🎮 Game Server',
        'bot': '🤖 Bot Hosting'
    };
    return labels[type] || type || '--';
}

// ─── عرض تفاصيل الطلب ───
async function showOrderDetails(orderId) {
    try {
        const doc = await db.collection('orders').doc(orderId).get();
        if (!doc.exists) {
            showToast('الطلب غير موجود', 'error');
            return;
        }
        const order = doc.data();
        
        // إنشاء نافذة منبثقة للتفاصيل
        const detailsHtml = `
            <div style="background:var(--bg-primary);padding:20px;border-radius:var(--radius-sm);margin-top:10px;text-align:right;">
                <p><strong>📧 البريد الإلكتروني:</strong> ${order.gmail || '--'}</p>
                <p><strong>👤 اسم المستخدم:</strong> ${order.orderUsername || '--'}</p>
                <p><strong>🔑 كلمة المرور:</strong> <span style="color:var(--accent);">${order.orderPassword || '--'}</span></p>
                <p><strong>📛 اسم المضيف:</strong> ${order.hostName || '--'}</p>
                <p><strong>🖥️ نوع السيرفر:</strong> ${getServerTypeLabel(order.serverType)}</p>
                <p><strong>💻 الخطة:</strong> ${order.planName || '--'} ($${order.planPrice || 0})</p>
                <p><strong>📊 الحالة:</strong> ${order.status || 'جديد'}</p>
                ${order.createdAt?.toDate ? `<p><strong>📅 تاريخ الطلب:</strong> ${order.createdAt.toDate().toLocaleDateString('ar-EG')}</p>` : ''}
            </div>
        `;
        
        // عرض في نافذة منبثقة
        const modal = document.createElement('div');
        modal.className = 'order-modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="order-modal-content">
                <div class="order-modal-header">
                    <h3><i class="fa-regular fa-file-lines"></i> تفاصيل الطلب</h3>
                    <span class="order-modal-close" onclick="this.closest('.order-modal').remove()">&times;</span>
                </div>
                ${detailsHtml}
                <button class="btn-primary" style="width:100%;margin-top:20px;" onclick="this.closest('.order-modal').remove()">
                    <i class="fa-solid fa-xmark"></i> إغلاق
                </button>
            </div>
        `;
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // إغلاق عند الضغط خارج المودال
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                document.body.style.overflow = 'auto';
            }
        });
        
    } catch (error) {
        console.error('خطأ في عرض التفاصيل:', error);
        showToast('فشل تحميل التفاصيل', 'error');
    }
}
window.showOrderDetails = showOrderDetails;