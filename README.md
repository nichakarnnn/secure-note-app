# 📝 SecureNote Application - Project Report & Documentation

**SecureNote Application** เป็นเว็บแอปพลิเคชันสำหรับจดบันทึกย่อ (Notes) ที่ถูกออกแบบมาโดยเน้นความปลอดภัยและโครงสร้างระบบที่ได้มาตรฐาน (Client-Server Architecture) ผู้ใช้งานสามารถดู เพิ่ม แก้ไข และลบโน้ตได้ โดยการเปลี่ยนแปลงข้อมูลจะต้องใช้รหัสผ่าน (Secret Token) ในการยืนยันตัวตนเสมอ

---

## ✨ ฟีเจอร์หลัก (Features)
- **Client-Server Architecture:** แยกการทำงานระหว่างหน้าบ้าน (Frontend UI) และหลังบ้าน (Backend Logic) อย่างชัดเจน
- **Secure Operations:** การจัดการข้อมูล (เพิ่ม/แก้ไข/ลบ) ต้องใส่รหัสผ่าน (Secret Token) เสมอ โดยไม่มีการฝังรหัสผ่านไว้ในฝั่งหน้าบ้าน
- **RESTful API:** พัฒนาระบบหลังบ้านด้วย Node.js & Express เพื่อเชื่อมต่อกับฐานข้อมูลบนคลาวด์ (PocketHost)
- **Dynamic UI & UX:** พัฒนาด้วย Vanilla JavaScript (Async/Await, Fetch API) มีระบบ Loading State แจ้งเตือนสถานะการโหลดข้อมูล
- **Dark/Light Mode:** ผู้ใช้สามารถสลับโหมดหน้าจอได้ และระบบจะจดจำการตั้งค่าไว้ใน `LocalStorage`
- **Local Data Backup:** ระบบหลังบ้านจะทำการสำรองข้อมูลอัตโนมัติลงในไฟล์ `notes.json` ทุกครั้งที่มีการเปลี่ยนแปลงข้อมูล

## 🛠️ เครื่องมือที่ใช้ (Tech Stack)
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** PocketBase / PocketHost (ผ่าน REST API)
- **Deployment:** Vercel (สำหรับรันเซิร์ฟเวอร์แบบ Serverless)

---

## 🚀 วิธีการติดตั้งและรันโปรเจกต์ (How to Run)

### 1. ฝั่ง Backend (การรันเซิร์ฟเวอร์ส่วนตัว)
1. เปิด Terminal เข้าไปที่โฟลเดอร์ของโปรเจกต์
2. ติดตั้ง Dependencies ทั้งหมดด้วยคำสั่ง:
   ```bash
   npm install
3. สร้างไฟล์ .env ในระดับเดียวกันกับไฟล์ server.js และใส่ค่าคอนฟิกดังนี้:
PORT=3000
SECRET_TOKEN=ใส่รหัสผ่านของคุณ เช่น 66010277
POCKET_URL=ลิงก์_API_ของ_PocketHost
POCKET_TOKEN=API_Token_ของ_PocketHost
4. รันเซิร์ฟเวอร์ด้วยคำสั่ง:npm start

### 2. ฝั่ง Frontend (การแสดงผลหน้าเว็บ)
1. เปิดไฟล์ app.js และตรวจสอบให้แน่ใจว่าตัวแปร API_URL ชี้ไปยังเซิร์ฟเวอร์ที่ถูกต้อง (เช่น ใช้ http://localhost:3000/api/notes สำหรับทดสอบในเครื่อง หรือลิงก์จาก Vercel สำหรับระบบจริงคือ https://secure-note-app-2k7r.vercel.app/)
2. เปิดไฟล์ index.html ผ่านเบราว์เซอร์ หรือใช้งานผ่าน Extension Live Server บน VS Code ได้ทันที

## 📡 สรุป API Endpoints

ระบบหลังบ้าน (Backend) มีการเปิดรับ Request ทั้งหมด 4 เส้นทาง ดังนี้:

* **GET `/api/notes`** : ใช้สำหรับดึงข้อมูลโน้ตทั้งหมด (ไม่ต้องยืนยันตัวตน)
* **POST `/api/notes`** : ใช้สำหรับสร้างโน้ตใหม่ (ต้องส่งรหัสผ่านใน Header)
* **PATCH `/api/notes/:id`** : ใช้สำหรับแก้ไขโน้ตเดิมตาม ID (ต้องส่งรหัสผ่านใน Header)
* **DELETE `/api/notes/:id`** : ใช้สำหรับลบโน้ตตาม ID (ต้องส่งรหัสผ่านใน Header)

*(หมายเหตุ: API ที่ต้องยืนยันตัวตน จะต้องส่งรหัสผ่าน `SECRET_TOKEN` ไปใน `Authorization` Header ของ HTTP Request เสมอ)*