// นำเข้า Firebase SDK จาก CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// กำหนดค่า Firebase Config ของคุณ
const firebaseConfig = {
    apiKey: "AIzaSyCskpROK3OC55EXjDP-ywMiuaOen-fwr2Y",
    projectId: "v-link-5d0c8"
};

// เริ่มต้นระบบ Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 1. ฟังก์ชันสมัครสมาชิก (Register)
window.handleRegister = async function(email, password, redirectUrl = 'home.html') {
    if (!email || !password) {
        alert("กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน");
        return;
    }

    try {
        // สร้างบัญชีผู้ใช้ใน Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // สร้างข้อมูลตั้งต้นใน Firestore สำหรับผู้ใช้ใหม่ (เช่น ID 6 หลัก, เลขบัญชี 10 หลัก, ยอดเงินเริ่มต้น)
        const userRef = doc(db, "users", user.email);
        const snap = await getDoc(userRef);
        
        if (!snap.exists()) {
            const newAcc = Math.floor(1000000000 + Math.random() * 9000000000).toString();
            const newUserId = Math.floor(100000 + Math.random() * 900000).toString();
            await setDoc(userRef, {
                userId: newUserId,
                accountNumber: newAcc,
                balance: 1000000,
                email: user.email,
                realName: "",
                nickName: "",
                age: "",
                birthDate: "",
                agency: "independent",
                profileImg: "https://via.placeholder.com/150",
                contacts: []
            });
        }

        // บันทึกลง localStorage เพื่อความสะดวกในการดึงค่าข้ามหน้า HTML
        localStorage.setItem('userEmail', user.email);
        
        alert("🎉 สมัครสมาชิกสำเร็จ!");
        window.location.href = redirectUrl;

    } catch (error) {
        console.error("Register Error:", error);
        alert("❌ สมัครสมาชิกไม่สำเร็จ: " + error.message);
    }
};

// 2. ฟังก์ชันเข้าสู่ระบบ (Login)
window.handleLogin = async function(email, password, redirectUrl = 'home.html') {
    if (!email || !password) {
        alert("กรุณากรอกอีเมลและรหัสผ่าน");
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // ตรวจสอบว่าใน Firestore มีข้อมูลบัญชีหรือยัง ถ้ายังให้สร้างสำรองไว้กันพลาด
        const userRef = doc(db, "users", user.email);
        const snap = await getDoc(userRef);
        
        if (!snap.exists()) {
            const newAcc = Math.floor(1000000000 + Math.random() * 9000000000).toString();
            const newUserId = Math.floor(100000 + Math.random() * 900000).toString();
            await setDoc(userRef, {
                userId: newUserId,
                accountNumber: newAcc,
                balance: 1000000,
                email: user.email,
                realName: "",
                nickName: "",
                agency: "independent",
                profileImg: "https://via.placeholder.com/150",
                contacts: []
            });
        }

        // บันทึกอีเมลลง localStorage
        localStorage.setItem('userEmail', user.email);

        alert("เข้าสู่ระบบสำเร็จ!");
        window.location.href = redirectUrl;

    } catch (error) {
        console.error("Login Error:", error);
        alert("❌ เข้าสู่ระบบไม่สำเร็จ: อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
};

// 3. ฟังก์ชันออกจากระบบ (Logout)
window.handleLogout = async function() {
    try {
        await signOut(auth);
        localStorage.removeItem('userEmail');
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Logout Error:", error);
    }
};

// 4. ระบบตรวจสอบสถานะอัตโนมัติ (ใส่ไว้เช็คสิทธิ์ในหน้าหลักหรือหน้าย่อย)
export function checkAuth(onLoggedInCallback) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // ถ้ายืนยันตัวตนผ่าน อัปเดต localStorage ให้ตรงกันเสมอ
            localStorage.setItem('userEmail', user.email);
            if (onLoggedInCallback) onLoggedInCallback(user);
        } else {
            // ถ้าหลุดระบบหรือไม่ได้ล็อกอิน ให้เคลียร์ค่าและดีดกลับหน้าแรก
            localStorage.removeItem('userEmail');
            if (window.location.pathname.includes('home.html') || 
                window.location.pathname.includes('profile.html') || 
                window.location.pathname.includes('virtual-bank.html')) {
                window.location.href = 'index.html';
            }
        }
    });
}
