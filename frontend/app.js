let notes = [];
const API_URL = 'http://localhost:3000/api/notes';

// 1. โหลดข้อมูลจาก Backend
async function fetchNotes() {
  const container = document.getElementById('notesContainer');

  // --- 🌟 เริ่มส่วน Loading State (+5 คะแนน) 🌟 ---
  // แสดงข้อความโหลดรอก่อนที่ fetch จะทำงาน
  container.innerHTML = `
    <div style="text-align: center; grid-column: 1 / -1; padding: 3rem; color: var(--text-color);">
      <h2>⏳ กำลังโหลดข้อมูล... (Loading...)</h2>
    </div>
  `;
  // ---------------------------------------------

  try {
    const response = await fetch(API_URL);
    notes = await response.json();
    renderNotes(); // พอข้อมูลมา renderNotes จะวาดโน้ตทับข้อความ Loading ให้เอง
  } catch (error) {
    console.error('Error fetching notes:', error);
    container.innerHTML = '<p style="color:red; text-align:center; grid-column: 1 / -1;">Cannot connect to backend server.</p>';
  }
}

// 2. บันทึกข้อมูลไปยัง Backend (ส่งแบบ POST และแนบ Token)
async function saveNote(event) {
  event.preventDefault();

  const title = document.getElementById('noteTitle').value.trim();
  const content = document.getElementById('noteContent').value.trim();

  // ขอรหัสลับก่อนบันทึกข้อมูล (เพื่อความปลอดภัย ห้ามฝังรหัสในโค้ด)
  const token = prompt("Enter Secret Token to authorize this action:");
  if (!token) return;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token // แนบ Headers
      },
      body: JSON.stringify({ title, content })
    });

    if (response.status === 401) {
      alert('Error 401 Unauthorized: Invalid Secret Token!'); // Error Handling
      return;
    }

    if (response.ok) {
      closeNoteDialog();
      fetchNotes(); // โหลดข้อมูลใหม่หลังจากเซฟเสร็จ (จะเห็น Loading แว๊บนึงด้วย!)
    }
  } catch (error) {
    console.error('Error saving note:', error);
  }
}

// 3. ลบข้อมูลจาก Backend (ส่งแบบ DELETE และแนบ Token)
async function deleteNote(noteId) {
  const token = prompt("Enter Secret Token to authorize deletion:");
  if (!token) return;

  try {
    const response = await fetch(`${API_URL}/${noteId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token // แนบ Headers
      }
    });

    if (response.status === 401) {
      alert('Error 401 Unauthorized: Invalid Secret Token!');
      return;
    }

    if (response.ok) {
      fetchNotes(); // โหลดข้อมูลใหม่หลังจากลบเสร็จ
    }
  } catch (error) {
    console.error('Error deleting note:', error);
  }
}

// 4. แสดงผลโน้ต (เอาปุ่ม Edit ออกเพราะโจทย์ไม่ได้สั่งให้ทำ Update API)
function renderNotes() {
  const notesContainer = document.getElementById('notesContainer');

  if(notes.length === 0) {
    notesContainer.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
        <h2>No notes yet</h2>
        <p>Create your first note to get started!</p>
        <button class="add-note-btn" onclick="openNoteDialog()" style="margin-top: 1rem;">+ Add Your First Note</button>
      </div>
    `;
    return;
  }

  notesContainer.innerHTML = notes.map(note => `
    <div class="note-card">
      <h3 class="note-title">${note.title}</h3>
      <p class="note-content">${note.content}</p>
      <div class="note-actions">
        <button class="delete-btn" onclick="deleteNote('${note.id}')" title="Delete Note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.88c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/>
          </svg>
        </button>
      </div>
    </div>
    `).join('');
}

function openNoteDialog() {
  const dialog = document.getElementById('noteDialog');
  const titleInput = document.getElementById('noteTitle');
  const contentInput = document.getElementById('noteContent');

  document.getElementById('dialogTitle').textContent = 'Add New Note';
  titleInput.value = '';
  contentInput.value = '';

  dialog.showModal();
  titleInput.focus();
}

function closeNoteDialog() {
  document.getElementById('noteDialog').close();
}

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-theme');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  document.getElementById('themeToggleBtn').textContent = isDark ? '☀️' : '🌙';
}

function applyStoredTheme() {
  if(localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
    document.getElementById('themeToggleBtn').textContent = '☀️';
  }
}

// ผูก Event Listeners ต่างๆ เมื่อหน้าเว็บโหลดเสร็จ
document.addEventListener('DOMContentLoaded', function() {
  applyStoredTheme();
  
  // เรียกดูข้อมูลทันทีที่เปิดหน้าเว็บ
  fetchNotes();

  document.getElementById('noteForm').addEventListener('submit', saveNote);
  document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);

  document.getElementById('noteDialog').addEventListener('click', function(event) {
    if(event.target === this) {
      closeNoteDialog();
    }
  });
});