// นำเข้า Supabase Client จากไฟล์ config กลางที่เราตั้งไว้
import { supabase } from './supabase-config.js';

// 1. ฟังก์ชันสมัครสมาชิก (Register)
window.handleRegister = async function(email, password, redirectUrl = 'home.html') {
    if (!email || !password) {
        alert("กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน");
        return;
    }

    try {
        // สมัครสมาชิกผ่าน Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password
        });

        if (authError) throw authError;

        // ตรวจสอบว่ามีข้อมูลผู้ใช้นี้ในตาราง users หรือยัง
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', email)
            .single();

        // ถ้ายังไม่มี ให้สร้างข้อมูลตั้งต้นสำหรับผู้ใช้ใหม่
        if (!existingUser) {
            const newAcc = Math.floor(1000000000 + Math.random() * 9000000000).toString();
            const newUserId = Math.floor(100000 + Math.random() * 900000).toString();
            
            const { error: insertError } = await supabase
                .from('users')
                .insert([
                    {
                        id: email,
                        userId: newUserId,
                        accountNumber: newAcc,
                        balance: 1000000,
                        email: email,
                        realName: "",
                        nickName: "",
                        age: "",
                        birthDate: "",
                        agency: "independent",
                        profileImg: "https://via.placeholder.com/150",
                        contacts: []
                    }
                ]);

            if (insertError) throw insertError;
        }

        // บันทึกลง localStorage เพื่อความสะดวกในการดึงค่าข้ามหน้า HTML
        localStorage.setItem('userEmail', email);
        
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
        // เข้าสู่ระบบผ่าน Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (authError) throw authError;

        // ตรวจสอบข้อมูลสำรองในตาราง users ว่ามีหรือยัง (กันพลาดกรณีสมัครข้ามระบบ)
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', email)
            .single();
        
        if (!existingUser) {
            const newAcc = Math.floor(1000000000 + Math.random() * 9000000000).toString();
            const newUserId = Math.floor(100000 + Math.random() * 900000).toString();
            
            await supabase
                .from('users')
                .insert([
                    {
                        id: email,
                        userId: newUserId,
                        accountNumber: newAcc,
                        balance: 1000000,
                        email: email,
                        realName: "",
                        nickName: "",
                        age: "",
                        birthDate: "",
                        agency: "independent",
                        profileImg: "https://via.placeholder.com/150",
                        contacts: []
                    }
                ]);
        }

        // บันทึกอีเมลลง localStorage
        localStorage.setItem('userEmail', email);

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
        await supabase.auth.signOut();
        localStorage.removeItem('userEmail');
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Logout Error:", error);
    }
};

// 4. ระบบตรวจสอบสถานะอัตโนมัติ (ใส่ไว้เช็คสิทธิ์ในหน้าหลักหรือหน้าย่อย)
export function checkAuth(onLoggedInCallback) {
    // ตรวจสอบเซสชันปัจจุบันจาก Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && session.user) {
            const email = session.user.email;
            localStorage.setItem('userEmail', email);
            if (onLoggedInCallback) onLoggedInCallback(session.user);
        } else {
            // เช็คสำรองจาก localStorage
            const localEmail = localStorage.getItem('userEmail');
            if (localEmail) {
                if (onLoggedInCallback) onLoggedInCallback({ email: localEmail });
                return;
            }

            // ถ้าไม่ได้ล็อกอิน ให้เคลียร์ค่าและดีดกลับหน้าแรก
            localStorage.removeItem('userEmail');
            if (window.location.pathname.includes('home.html') || 
                window.location.pathname.includes('profile.html') || 
                window.location.pathname.includes('virtual-bank.html')) {
                window.location.href = 'index.html';
            }
        }
    });

    // ดักฟังการเปลี่ยนแปลงสถานะ Login/Logout แบบ Real-time
    supabase.auth.onAuthStateChange((event, session) => {
        if (session && session.user) {
            localStorage.setItem('userEmail', session.user.email);
        } else {
            localStorage.removeItem('userEmail');
            if (window.location.pathname.includes('home.html') || 
                window.location.pathname.includes('profile.html') || 
                window.location.pathname.includes('virtual-bank.html')) {
                window.location.href = 'index.html';
            }
        }
    });
}
