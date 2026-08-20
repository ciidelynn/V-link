// โหลด Supabase SDK จาก CDN (หรือใช้แบบ npm ตามความเหมาะสม)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://pjapezytmawescgcbyxd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_bAQw8ZRxU7djRR3w11vsfQ__ig0uUuX';

// สร้างตัวแปรกลางชื่อ db หรือ supabase เพื่อให้หน้าอื่นเรียกใช้
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
