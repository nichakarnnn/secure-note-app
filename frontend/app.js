let notes = [];
let editingNoteId = null; // เก็บ ID เมื่อต้องการแก้ไข
const API_URL = 'https://secure-note-app-2k7r.vercel.app/api/notes';

// 1. โหลดข้อมูลจาก Backend
async function fetchNotes() {
  const container = document.getElementById('notesContainer');
  // --- 🌟 Bonus: Loading State 🌟 ---
  container.innerHTML = `<div style="text-align: center; grid-column: 1 / -1; padding: 3rem; color: var(--secondary-text-color);"><h2>⏳ Loading Notes...</h2></div>`;

  try {
    const response = await fetch(API_URL);
    notes = await response.json();
    renderNotes();
  } catch (error) {
    console.error('Error:', error);
    container.innerHTML = '<p style="color:red; text-align:center; grid-column: 1 / -1;">Cannot connect to backend server.</p>';
  }
}

// 2. บันทึกข้อมูล (Add & Update)
async function saveNote(event) {
  event.preventDefault();
  const title = document.getElementById('noteTitle').value.trim();
  const content = document.getElementById('noteContent').value.trim();

  const token = prompt("Enter Secret Token:");
  if (!token) return;

  const method = editingNoteId ? 'PATCH' : 'POST';
  const url = editingNoteId ? `${API_URL}/${editingNoteId}` : API_URL;

  try {
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json', 'Authorization': token },
      body: JSON.stringify({ title, content })
    });

    if (response.ok) {
      editingNoteId = null;
      closeNoteDialog();
      fetchNotes(); // โหลดใหม่เพื่อ Update หน้าจอ
    } else {
      alert("Unauthorized or failed!");
    }
  } catch (error) {
    console.error('Error saving:', error);
  }
}

// 3. ลบโน้ต
async function deleteNote(noteId) {
  const token = prompt("Enter Secret Token to delete:");
  if (!token) return;

  try {
    const response = await fetch(`${API_URL}/${noteId}`, {
      method: 'DELETE',
      headers: { 'Authorization': token }
    });
    if (response.ok) fetchNotes();
  } catch (error) {
    console.error('Error deleting:', error);
  }
}

// 4. แสดงผลโน้ต
function renderNotes() {
  const container = document.getElementById('notesContainer');
  if (notes.length === 0) {
    container.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1;"><h2>No notes yet</h2><p>Start by adding one!</p></div>';
    return;
  }

  container.innerHTML = notes.map(note => `
    <div class="note-card">
      <h3 class="note-title">${note.title}</h3>
      <p class="note-content">${note.content}</p>
      <div class="note-actions">
        <button class="edit-btn" onclick="openNoteDialog('${note.id}')" title="Edit">✏️</button>
        <button class="delete-btn" onclick="deleteNote('${note.id}')" title="Delete">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.88c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/></svg>
        </button>
      </div>
    </div>
  `).join('');
}

// 5. จัดการ Dialog
function openNoteDialog(noteId = null) {
  const dialog = document.getElementById('noteDialog');
  const titleInput = document.getElementById('noteTitle');
  const contentInput = document.getElementById('noteContent');

  if (noteId) {
    editingNoteId = noteId;
    const note = notes.find(n => n.id === noteId);
    document.getElementById('dialogTitle').textContent = 'Edit Note';
    titleInput.value = note.title;
    contentInput.value = note.content;
  } else {
    editingNoteId = null;
    document.getElementById('dialogTitle').textContent = 'Add New Note';
    titleInput.value = '';
    contentInput.value = '';
  }
  dialog.showModal();
}

function closeNoteDialog() {
  document.getElementById('noteDialog').close();
}

// 6. Theme Logic
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-theme');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  document.getElementById('themeToggleBtn').textContent = isDark ? '☀️' : '🌙';
}

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
    document.getElementById('themeToggleBtn').textContent = '☀️';
  }
  fetchNotes();
  document.getElementById('noteForm').addEventListener('submit', saveNote);
  document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);
});