// firebase-config.js
// 🔥 إعدادات Firebase - استبدل بقيمك

const firebaseConfig = {
    apiKey: "AIzaSyC8Cpf7ze2K5D0wZY1eza8_INrEzY4C-ro",
    authDomain: "alpha-hosting-eba80.firebaseapp.com",
    projectId: "alpha-hosting-eba80",
    storageBucket: "alpha-hosting-eba80.firebasestorage.app",
    messagingSenderId: "347838103681",
    appId: "1:347838103681:web:331a53d77538ae6c464d80",
    measurementId: "G-MVQGKND12L"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

console.log("✅ Firebase متصل بنجاح!");
console.log("📁 Project ID:", firebaseConfig.projectId);

// ─── دوال قاعدة البيانات ───

// ✅ جلب بيانات المستخدم
async function getUserData(userId) {
    try {
        const doc = await db.collection('users').doc(userId).get();
        
        if (doc.exists) {
            return { success: true, user: { id: doc.id, ...doc.data() } };
        } else {
            return { success: false, message: 'المستخدم غير موجود' };
        }
    } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
        return { success: false, message: error.message };
    }
}

// ✅ جلب جميع الخطط
async function getPlans() {
    try {
        const snapshot = await db.collection('plans').get();
        const plans = [];
        snapshot.forEach((doc) => {
            plans.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, plans };
    } catch (error) {
        console.error("خطأ في جلب الخطط:", error);
        return { success: false, message: error.message };
    }
}

// جعل الدوال متاحة عالمياً
window.getUserData = getUserData;
window.getPlans = getPlans;
window.db = db;