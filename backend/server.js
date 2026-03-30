require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_TOKEN = process.env.SECRET_TOKEN;
const POCKET_URL = process.env.POCKET_URL;
const POCKET_TOKEN = process.env.POCKET_TOKEN;

app.use(cors());
app.use(express.json());

// ฟังก์ชันเช็คว่า User มีสิทธิ์ไหม (ป้องกันคนอื่นที่ไม่รู้รหัสมาลบข้อมูล)
const checkAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader === SECRET_TOKEN) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized: Invalid Secret Token' });
    }
};

// 1. GET /api/notes - ไปดึงข้อมูลจาก PocketHost มาส่งให้ Frontend
app.get('/api/notes', async (req, res) => {
    try {
        const response = await fetch(POCKET_URL, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${POCKET_TOKEN}` }
        });
        const data = await response.json();
        // PocketHost จะเก็บข้อมูลแบบ Array ไว้ในตัวแปรชื่อ items
        res.status(200).json(data.items || []);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch notes from Database' });
    }
});

// 2. POST /api/notes - รับข้อมูลจาก Frontend ไปบันทึกลง PocketHost
app.post('/api/notes', checkAuth, async (req, res) => {
    const { title, content } = req.body;
    try {
        const response = await fetch(POCKET_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${POCKET_TOKEN}`,
                'Content-Type': 'application/json'
            },
            // ส่งข้อมูลตาม format ที่อาจารย์ต้องการเป๊ะๆ
            body: JSON.stringify({ content: content, title: title, user_id: 2 })
        });
        const data = await response.json();
        res.status(201).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save note to Database' });
    }
});

// 3. DELETE /api/notes/:id - ส่งคำสั่งลบไปยัง PocketHost
app.delete('/api/notes/:id', checkAuth, async (req, res) => {
    const { id } = req.params;
    try {
        const response = await fetch(`${POCKET_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${POCKET_TOKEN}` }
        });
        
        if (response.ok) {
            res.status(200).json({ message: 'Note deleted successfully' });
        } else {
            res.status(404).json({ error: 'Note not found in Database' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

// เริ่มต้นรันเซิร์ฟเวอร์
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});