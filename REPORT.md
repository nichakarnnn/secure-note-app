# SecureNote - Conceptual Report

## 1. JS Engine vs. Runtime
**Explanation:** โค้ด JavaScript ของเราในโปรเจกต์นี้ถูกประมวลผลและทำงานใน 2 สภาพแวดล้อมที่แตกต่างกัน:
* **Frontend (Browser):** โค้ดในไฟล์ `app.js` ทำงานอยู่บน Browser Runtime Environment ซึ่งใช้ JS Engine (เช่น V8 Engine ใน Chrome) ในการคอมไพล์และรันโค้ด โดย Browser Runtime จะเตรียม Web APIs มาให้ใช้งาน เช่น `window`, `document` (DOM) และ `fetch` API เพื่อให้ปรับแต่งหน้าจอและดึงข้อมูลได้
* **Backend (Node.js):** โค้ดในไฟล์ `server.js` ทำงานอยู่บน Node.js Runtime Environment แม้ว่า Node.js จะใช้ V8 Engine เหมือนกัน แต่ Runtime นี้ไม่มี DOM ให้ใช้ (ไม่มี `window` หรือ `document`) แต่จะเตรียม APIs สำหรับฝั่งเซิร์ฟเวอร์มาให้แทน เช่น การจัดการ Network, HTTP Requests และ File System ทำให้สามารถสร้าง Web Server รับส่งข้อมูลได้

## 2. DOM (Document Object Model) Update Mechanism
**Explanation:**
เนื่องจากโปรเจกต์นี้ใช้ Vanilla JavaScript (HTML/CSS/JS บริสุทธิ์) จึงต้องทำการอัปเดตหน้าจอโดยการปรับแต่ง DOM Tree โดยตรงดังนี้:
1. เมื่อได้รับข้อมูลโน้ตจากการใช้ `fetch` โค้ดจะเรียกใช้ฟังก์ชัน `renderNotes()`
2. ฟังก์ชันนี้จะนำอาร์เรย์ `notes` มาทำการ `.map()` เพื่อสร้างเป็น String ของ HTML Tags (`<div class="note-card">...</div>`)
3. จากนั้นเราใช้คำสั่ง `document.getElementById('notesContainer').innerHTML = ...` เพื่อแทรก HTML String นั้นเข้าไปในหน้าเว็บ
4. เบราว์เซอร์จะทำการอัปเดต DOM Tree ทันที ทำให้หน้าจอแสดงข้อมูลโน้ตใหม่ๆ (หรือโน้ตที่ถูกลบหายไป) ได้แบบไดนามิกโดยที่ผู้ใช้ไม่ต้องกดรีโหลดหน้าเว็บใหม่เลย

## 3. HTTP Request/Response & The Importance of HTTPS
**Explanation:**
เมื่อผู้ใช้กรอกข้อมูลและกดปุ่ม "Save Note":
1. หน้าบ้านจะส่ง **HTTP POST Request** ไปที่ `http://localhost:3000/api/notes`
2. ใน Request จะมีการแนบ **Headers** สำคัญไป 2 ตัว คือ:
   - `Content-Type: application/json` (บอกเซิร์ฟเวอร์ว่าส่งข้อมูลไปเป็น JSON)
   - `Authorization: <token>` (ส่งรหัสผ่านเพื่อยืนยันสิทธิ์ที่ได้มาจาก prompt)
3. ส่วน **Body** จะแนบข้อมูล `{ title, content }` ไปด้วย
4. Backend รับข้อมูล เช็ก Token ว่าถูกต้องไหม แล้วบันทึกลง PocketHost หากสำเร็จจะตอบกลับด้วย **Status Code 201 (Created)** หรือถ้า Token ผิด จะตอบกลับด้วย **401 (Unauthorized)**
* **ทำไม HTTPS จึงสำคัญ?** ในระบบจริง หากเราใช้แค่ HTTP ข้อมูลทั้งหมด (รวมถึง Secret Token ใน Header) จะถูกส่งผ่านเครือข่ายเป็น Plain Text ซึ่งเสี่ยงต่อการถูกดักจับข้อมูล (Man-in-the-Middle Attack) การใช้ HTTPS จะเข้ารหัสข้อมูลทั้งหมด ทำให้แฮกเกอร์อ่านข้อมูลระหว่างทางไม่ได้

## 4. Environment Variables & Security
**Explanation:**
เก็บค่า `SECRET_TOKEN`, `PORT`, `POCKET_URL` และ `POCKET_TOKEN` ไว้ในไฟล์ `.env` ที่ฝั่ง Backend เพื่อความปลอดภัย:
* ตัวแปรเหล่านี้จะถูกโหลดเข้าไปใน Node.js ตอนรันเซิร์ฟเวอร์ และจะไม่ถูกส่งออกไปยังฝั่ง Client
* การที่นำไฟล์ `.env` ไปใส่ไว้ใน `.gitignore` ทำให้มั่นใจได้ว่าความลับเหล่านี้จะไม่ถูกพุช ขึ้นไปยัง GitHub ให้คนอื่นเห็น
* **ถ้าเอา Token เหล่านี้ไปไว้ใน Frontend จะเกิดอะไรขึ้น?** หากเขียนโค้ดฝัง `SECRET_TOKEN` หรือ `POCKET_TOKEN` ไว้ในไฟล์ `app.js` (Frontend) รหัสผ่านเหล่านี้จะหลุดไปสู่สาธารณะทันที เพราะผู้ใช้ทุกคนสามารถคลิกขวา -> "Inspect" (F12) -> แถบ "Sources" เพื่อดูโค้ด JS ทั้งหมดและขโมยรหัสไปลบหรือแก้ไขข้อมูลในฐานข้อมูลเรา

## 5. Bonus: Secure Data Architecture (PocketHost)
**Explanation:**
โปรเจกต์นี้มีการประยุกต์ใช้ **Proxy Architecture** กับ PocketHost API เพื่อความปลอดภัยสูงสุด:
Frontend จะไม่ยิง Request ไปที่ PocketHost โดยตรง แต่จะยิงมาหา Backend ของเราก่อน แล้ว Backend (ซึ่งซ่อน `POCKET_TOKEN` ไว้ใน `.env`) จะทำหน้าที่เป็นตัวแทน (Proxy) ไปคุยกับ PocketHost ให้ วิธีนี้ทำให้ระบบสามารถใช้ Database บน Cloud ได้โดยที่ Access Token ของ Database ไม่เสี่ยงต่อการรั่วไหล