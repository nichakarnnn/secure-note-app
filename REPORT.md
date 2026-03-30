# 📝 SecureNote - Conceptual Report

## 1. JS Engine vs. Runtime Environment
**Explanation:** โค้ด JavaScript ในโปรเจกต์นี้ถูกประมวลผลและทำงานใน 2 สภาพแวดล้อม (Environment) ที่แตกต่างกันอย่างชัดเจน:
* **Frontend (Browser Runtime):** โค้ดในไฟล์ `app.js` ทำงานอยู่บนเบราว์เซอร์ ซึ่งใช้ JS Engine (เช่น V8 Engine ใน Chrome) ในการคอมไพล์และรันโค้ด โดย Browser Runtime จะจัดเตรียม Web APIs มาให้เราเรียกใช้งาน เช่น `window`, `document` (สำหรับการจัดการ DOM) และ `fetch` API สำหรับการดึงข้อมูลผ่านเครือข่าย
* **Backend (Node.js Runtime):** โค้ดในไฟล์ `server.js` ทำงานอยู่บน Node.js แม้ว่า Node.js จะขับเคลื่อนด้วย V8 Engine เหมือนกัน แต่ Runtime นี้จะไม่มี Web APIs (ไม่มี `window` หรือ `document`) แต่จะจัดเตรียม APIs สำหรับฝั่งเซิร์ฟเวอร์มาให้แทน เช่น การจัดการ Network, สร้าง HTTP Server (ผ่าน Express) และ File System (`fs`) สำหรับจัดการไฟล์ในระบบ

## 2. DOM (Document Object Model) Update Mechanism
**Explanation:** เนื่องจากโปรเจกต์นี้ใช้ Vanilla JavaScript (HTML/CSS/JS บริสุทธิ์) กลไกการอัปเดตหน้าจอจึงทำผ่านการจัดการ DOM Tree โดยตรง:
1. เมื่อได้รับข้อมูลโน้ตจากการใช้ `fetch` หน้าบ้านจะเรียกใช้ฟังก์ชัน `renderNotes()`
2. ฟังก์ชันนี้จะนำอาร์เรย์ `notes` มาวนลูปด้วย `.map()` เพื่อแปลงข้อมูลให้กลายเป็น String ของ HTML Tags (เช่น `<div class="note-card">...</div>`)
3. จากนั้นใช้คำสั่ง `document.getElementById('notesContainer').innerHTML = ...` เพื่อแทรก HTML String ชุดนี้เข้าไปในหน้าเว็บ
4. เบราว์เซอร์จะรับรู้ถึงการเปลี่ยนแปลงและทำการอัปเดต (Render) DOM Tree ใหม่ทันที ทำให้หน้าจอแสดงข้อมูลโน้ตใหม่ๆ ได้แบบไดนามิก (Dynamic) โดยที่ผู้ใช้ไม่ต้องกดรีเฟรชหน้าเว็บ (Page Reload)

## 3. HTTP Request/Response & The Importance of HTTPS
**Explanation:** วงจรการรับส่งข้อมูลเมื่อผู้ใช้สร้างโน้ตใหม่:
1. หน้าบ้านจะส่ง **HTTP POST Request** ไปที่ Backend API (เช่น `https://secure-note-app-2k7r.vercel.app/api/notes`)
2. ในส่วน **Headers** ของ Request จะแนบข้อมูลสำคัญ 2 ส่วนคือ:
   - `Content-Type: application/json` (ระบุรูปแบบข้อมูล)
   - `Authorization: <token>` (ส่งรหัสผ่านที่ได้จาก prompt เพื่อยืนยันสิทธิ์)
3. ในส่วน **Body** จะแนบข้อมูลโน้ตเป็น JSON `{ title, content }`
4. Backend รับข้อมูล ตรวจสอบ Token ว่าตรงกับ `.env` หรือไม่ หากสำเร็จจะบันทึกข้อมูลและตอบกลับด้วย **Status Code 201 (Created)** หาก Token ผิด จะปฏิเสธพร้อมส่ง **401 (Unauthorized)** กลับไป

**ความสำคัญของ HTTPS:**
หากระบบใช้เพียง HTTP ข้อมูลทั้งหมดที่รับส่ง (รวมถึง Secret Token ใน Header) จะถูกส่งเป็น Plain Text ซึ่งเสี่ยงต่อการถูกดักจับข้อมูลระหว่างทาง (Man-in-the-Middle Attack) การใช้งานบน Vercel ซึ่งรองรับ **HTTPS** จะช่วยเข้ารหัสข้อมูลทั้งหมด ทำให้แฮกเกอร์ไม่สามารถอ่านข้อมูลความลับนี้ได้

## 4. Environment Variables & Security Implications
**Explanation:** โปรเจกต์นี้จัดการความปลอดภัยโดยเก็บค่าความลับ เช่น `SECRET_TOKEN`, `PORT`, `POCKET_URL` และ `POCKET_TOKEN` ไว้ในไฟล์ `.env` ที่ฝั่ง Backend:
* ตัวแปรเหล่านี้จะถูกโหลดเข้าไปใน Node.js ระหว่างที่เซิร์ฟเวอร์ทำงาน และจะไม่ถูกส่งกลับไปยังฝั่ง Client อย่างเด็ดขาด
* มีการตั้งค่าไฟล์ `.gitignore` เพื่อป้องกันไม่ให้ไฟล์ `.env` ถูกพุชขึ้นไปยัง Public Repository บน GitHub
* **ผลกระทบหากนำ Secrets ไปไว้ใน Frontend:** หากเราฝัง (Hardcode) `SECRET_TOKEN` หรือ `POCKET_TOKEN` ไว้ในไฟล์ `app.js` ข้อมูลเหล่านี้จะหลุดไปสู่สาธารณะทันที ผู้ใช้งานทุกคนสามารถกด Inspect (F12) ไปที่แท็บ Sources เพื่อดูโค้ดและขโมย Token ไปแก้ไขหรือลบฐานข้อมูลทั้งหมดของเราได้อย่างง่ายดาย

## 5. Bonus: Secure Data Architecture & Local Backup
**Explanation:** โปรเจกต์นี้มีการออกแบบสถาปัตยกรรมข้อมูลที่ปลอดภัย (Proxy Architecture) ควบคู่กับระบบสำรองข้อมูล:
* **Proxy API:** Frontend จะไม่พูดคุยกับฐานข้อมูล (PocketHost) โดยตรง แต่จะส่ง Request มาที่ Backend ก่อน Backend จะทำหน้าที่เป็นตัวกลางนำ `POCKET_TOKEN` ที่ซ่อนไว้ไปคุยกับฐานข้อมูลแทน ทำให้ Access Token ของ Cloud Database ปลอดภัย 100%
* **Local Persistence:** ทุกครั้งที่มีการแก้ไขข้อมูล (POST, PATCH, DELETE) Backend จะเรียกใช้ฟังก์ชันดึงข้อมูลล่าสุดจาก PocketHost และใช้โมดูล `fs.writeFileSync` เพื่อสำรองข้อมูลลงไฟล์ `notes.json` ในเซิร์ฟเวอร์โดยอัตโนมัติ เพื่อเป็น Backup อีกชั้นหนึ่ง