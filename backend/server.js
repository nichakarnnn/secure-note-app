require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_TOKEN = process.env.SECRET_TOKEN;
const POCKET_URL = process.env.POCKET_URL;
const POCKET_TOKEN = process.env.POCKET_TOKEN;
const LOCAL_FILE = path.join(__dirname, 'notes.json');

app.use(cors());
app.use(express.json());

// ฟังก์ชันสำหรับบันทึกข้อมูลลงไฟล์ JSON (Local Persistence Bonus)
const saveToLocalFile = async () => {
    try {
        const response = await fetch(POCKET_URL, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${POCKET_TOKEN}` }
        });
        const data = await response.json();
        fs.writeFileSync(LOCAL_FILE, JSON.stringify(data.items || [], null, 2));
        console.log('✅ Backup to local JSON successful');
    } catch (error) {
        console.error('❌ Local backup failed:', error);
    }
};

// Middleware ตรวจสอบรหัสผ่าน
const checkAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader === SECRET_TOKEN) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// 1. GET Notes - ดึงข้อมูลทั้งหมด
app.get('/api/notes', async (req, res) => {
    try {
        const response = await fetch(POCKET_URL, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${POCKET_TOKEN}` }
        });
        const data = await response.json();
        res.status(200).json(data.items || []);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch' });
    }
});

// 2. POST Note - เพิ่มโน้ตใหม่
app.post('/api/notes', checkAuth, async (req, res) => {
    const { title, content } = req.body;
    try {
        const response = await fetch(POCKET_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${POCKET_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content, title })
        });
        const data = await response.json();
        await saveToLocalFile(); 
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Save failed' });
    }
});

// 3. DELETE Note - ลบโน้ต
app.delete('/api/notes/:id', checkAuth, async (req, res) => {
    const { id } = req.params;
    try {
        await fetch(`${POCKET_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${POCKET_TOKEN}` }
        });
        await saveToLocalFile();
        res.status(200).json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

// 4. PATCH Note - แก้ไขโน้ต (เพิ่มส่วนนี้เข้าไปและวางก่อน listen)
app.patch('/api/notes/:id', checkAuth, async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    try {
        const response = await fetch(`${POCKET_URL}/${id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${POCKET_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, content })
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Failed to update in Cloud' });
        }

        const data = await response.json();
        await saveToLocalFile(); // อัปเดตไฟล์ JSON ทันทีที่แก้ไขสำเร็จ
        res.status(200).json(data);
    } catch (error) {
        console.error('Update Error:', error);
        res.status(500).json({ error: 'Failed to update' });
    }
});

// บรรทัดนี้ต้องอยู่ล่างสุดเสมอ
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});