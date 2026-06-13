
let tasks = [];

// Load from localStorage if available
const STORAGE_KEY = 'flowtask_app_data';
function loadFromStorage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      tasks = JSON.parse(stored);
      
      if (!Array.isArray(tasks)) tasks = [];
    } catch(e) { tasks = []; }
  }
  if (!tasks.length) {
    
    const now = new Date();
    tasks = [
      {
        id: '1',
        title: 'Review design draft',
        details: 'Share feedback with team',
        status: 'pending',
        createdAt: new Date(now.getTime() - 86400000).toISOString(),
        completedAt: null,
      },
      {
        id: '2',
        title: 'Write weekly report',
        details: 'Include metrics and KPIs',
        status: 'completed',
        createdAt: new Date(now.getTime() - 172800000).toISOString(),
        completedAt: new Date(now.getTime() - 3600000).toISOString(),
      }
    ];
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Helper: format datetime nicely
function formatDateTime(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return 'invalid date';
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// generate unique ID
function generateId() {
  return Date.now() + '-' + Math.random().toString(36).substr(2, 6);
}

// add new task
function addTask(titleRaw, detailsRaw) {
  let title = titleRaw.trim();
  if (title === "") {
    alert("Please enter a task description");
    return false;
  }
  const details = detailsRaw.trim() || "";
  const newTask = {
    id: generateId(),
    title: title,
    details: details,
    status: 'pending',
    createdAt: new Date().toISOString(),
    completedAt: null,
    updatedAt: null
  };
  tasks.push(newTask);
  saveToStorage();
  renderAll();
  return true;
}

// mark task as complete
function completeTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task && task.status === 'pending') {
    task.status = 'completed';
    task.completedAt = new Date().toISOString();
    task.updatedAt = new Date().toISOString();
    saveToStorage();
    renderAll();
  }
}

// revert task to pending (mark as incomplete)
function revertToPending(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task && task.status === 'completed') {
    task.status = 'pending';
    task.completedAt = null;
    task.updatedAt = new Date().toISOString();
    saveToStorage();
    renderAll();
  }
}

// delete task (from anywhere)
function deleteTask(taskId) {
  if (confirm("Delete this task permanently?")) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveToStorage();
    renderAll();
  }
}

// edit task: allow editing title and details, status remains same
function editTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  // use simple prompt for title, but better to use modal? but we can combine
  const newTitle = prompt("Edit task title:", task.title);
  if (newTitle === null) return; // cancel
  const trimmedTitle = newTitle.trim();
  if (trimmedTitle === "") {
    alert("Title cannot be empty.");
    return;
  }
  const newDetails = prompt("Edit details / notes:", task.details || "");
  if (newDetails === null) return;
  task.title = trimmedTitle;
  task.details = newDetails.trim();
  task.updatedAt = new Date().toISOString();
  saveToStorage();
  renderAll();
}

// ---- RENDER LOGIC: separate lists: pending and completed ----
function renderAll() {
  const pendingContainer = document.getElementById('pendingList');
  const completedContainer = document.getElementById('completedList');
  const pendingCountSpan = document.getElementById('pendingCount');
  const completedCountSpan = document.getElementById('completedCount');

  // Filter tasks
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  pendingCountSpan.innerText = pendingTasks.length;
  completedCountSpan.innerText = completedTasks.length;

  // render pending
  if (pendingTasks.length === 0) {
    pendingContainer.innerHTML = `<div class="empty-msg">📭 No pending tasks — enjoy!</div>`;
  } else {
    pendingContainer.innerHTML = pendingTasks.map(task => createTaskCard(task, 'pending')).join('');
  }

  // render completed
  if (completedTasks.length === 0) {
    completedContainer.innerHTML = `<div class="empty-msg">🏁 Completed tasks will be listed here</div>`;
  } else {
    completedContainer.innerHTML = completedTasks.map(task => createTaskCard(task, 'completed')).join('');
  }

  // Attach event listeners after innerHTML injection (dynamic buttons)
  attachCardEvents();
}

// Build HTML for a single task card
function createTaskCard(task, currentListType) {
  // Format timestamps
  const createdDate = formatDateTime(task.createdAt);
  let completedInfo = '';
  if (task.status === 'completed' && task.completedAt) {
    completedInfo = `<span>✅ Completed: ${formatDateTime(task.completedAt)}</span>`;
  }
  const updatedInfo = task.updatedAt ? `<span>✏️ Edited: ${formatDateTime(task.updatedAt)}</span>` : '';
  
  // Action buttons based on status (and list)
  let actionButtons = '';
  if (task.status === 'pending') {
    actionButtons = `
      <button class="btn-icon btn-complete" data-action="complete" data-id="${task.id}">✓ Complete</button>
      <button class="btn-icon btn-edit" data-action="edit" data-id="${task.id}">✎ Edit</button>
      <button class="btn-icon btn-delete" data-action="delete" data-id="${task.id}">🗑 Delete</button>
    `;
  } else { // completed task
    actionButtons = `
      <button class="btn-icon btn-pending" data-action="revert" data-id="${task.id}">↩️ Mark Pending</button>
      <button class="btn-icon btn-edit" data-action="edit" data-id="${task.id}">✎ Edit</button>
      <button class="btn-icon btn-delete" data-action="delete" data-id="${task.id}">🗑 Delete</button>
    `;
  }

  // optional details display
  const detailsHtml = task.details ? `<div style="font-size:0.8rem; color:#496f89; margin-top: 4px;">📎 ${escapeHtml(task.details)}</div>` : '';

  return `
    <div class="task-card" data-task-id="${task.id}">
      <div class="task-title">📌 ${escapeHtml(task.title)}</div>
      ${detailsHtml}
      <div class="task-meta">
        <span>🕒 Added: ${createdDate}</span>
        ${completedInfo}
        ${updatedInfo}
      </div>
      <div class="task-actions">
        ${actionButtons}
      </div>
    </div>
  `;
}

// simple escape to avoid XSS
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
    return c;
  });
}

// attach all dynamic button events
function attachCardEvents() {
  // complete buttons (for pending)
  document.querySelectorAll('[data-action="complete"]').forEach(btn => {
    btn.removeEventListener('click', handleComplete);
    btn.addEventListener('click', handleComplete);
  });
  // revert buttons (for completed -> pending)
  document.querySelectorAll('[data-action="revert"]').forEach(btn => {
    btn.removeEventListener('click', handleRevert);
    btn.addEventListener('click', handleRevert);
  });
  // edit buttons
  document.querySelectorAll('[data-action="edit"]').forEach(btn => {
    btn.removeEventListener('click', handleEdit);
    btn.addEventListener('click', handleEdit);
  });
  // delete buttons
  document.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.removeEventListener('click', handleDelete);
    btn.addEventListener('click', handleDelete);
  });
}

// event handlers
function handleComplete(e) {
  const btn = e.currentTarget;
  const id = btn.getAttribute('data-id');
  if (id) completeTask(id);
}
function handleRevert(e) {
  const btn = e.currentTarget;
  const id = btn.getAttribute('data-id');
  if (id) revertToPending(id);
}
function handleEdit(e) {
  const btn = e.currentTarget;
  const id = btn.getAttribute('data-id');
  if (id) editTask(id);
}
function handleDelete(e) {
  const btn = e.currentTarget;
  const id = btn.getAttribute('data-id');
  if (id) deleteTask(id);
}

// initialization and event listeners
document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  renderAll();

  const addBtn = document.getElementById('addTaskBtn');
  const titleInput = document.getElementById('taskTitleInput');
  const detailsInput = document.getElementById('taskDetailsInput');

  function onAdd() {
    const title = titleInput.value;
    const details = detailsInput.value;
    if (addTask(title, details)) {
      titleInput.value = '';
      detailsInput.value = '';
      titleInput.focus();
    }
  }

  addBtn.addEventListener('click', onAdd);
  titleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAdd();
    }
  });
  // optional: also pressing shift+enter on details? we skip, but fine
});