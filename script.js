// HuaHua Space localStorage app v2
const STORAGE_KEY = 'huahua_space_v2';

// Load data from localStorage or initialize default structure
let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
  coupleName: '',
  name1: '',
  name2: '',
  startDate: '',
  declaration: '',
  messages: [],
  timeline: [],
  wishlist: [],
  anniversaries: []
};

// Save data and re-render
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  render();
}

// Setup navigation buttons
function setupNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-section');
      // Toggle section visibility
      document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
      const sectionEl = document.getElementById(target);
      if (sectionEl) sectionEl.classList.add('active');
      // Toggle active nav button
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// Setup all forms and buttons
function setupForms() {
  // Couple form
  const coupleForm = document.getElementById('couple-form');
  coupleForm.addEventListener('submit', e => {
    e.preventDefault();
    data.coupleName = document.getElementById('coupleName').value.trim();
    data.name1 = document.getElementById('name1').value.trim();
    data.name2 = document.getElementById('name2').value.trim();
    data.startDate = document.getElementById('startDate').value;
    data.declaration = document.getElementById('declarationInput').value.trim();
    saveData();
  });

  // Reset button
  const resetBtn = document.getElementById('reset');
  resetBtn.addEventListener('click', () => {
    if (confirm('Clear all data?')) {
      localStorage.removeItem(STORAGE_KEY);
      data = {
        coupleName: '',
        name1: '',
        name2: '',
        startDate: '',
        declaration: '',
        messages: [],
        timeline: [],
        wishlist: [],
        anniversaries: []
      };
      render();
    }
  });

  // Message form
  const messageForm = document.getElementById('message-form');
  messageForm.addEventListener('submit', e => {
    e.preventDefault();
    const from = document.getElementById('msgFrom').value;
    const text = document.getElementById('msgText').value.trim();
    if (!text) return;
    const date = new Date().toISOString().split('T')[0];
    if (!Array.isArray(data.messages)) data.messages = [];
    data.messages.unshift({ from, text, date });
    document.getElementById('msgText').value = '';
    saveData();
  });

  // Timeline form
  const timelineForm = document.getElementById('timeline-form');
  timelineForm.addEventListener('submit', e => {
    e.preventDefault();
    const eventDate = document.getElementById('eventDate').value;
    const title = document.getElementById('eventTitle').value.trim();
    const desc = document.getElementById('eventDesc').value.trim();
    if (eventDate && title) {
      if (!Array.isArray(data.timeline)) data.timeline = [];
      data.timeline.unshift({ date: eventDate, title, desc });
      document.getElementById('eventDate').value = '';
      document.getElementById('eventTitle').value = '';
      document.getElementById('eventDesc').value = '';
      saveData();
    }
  });

  // Wishlist form
  const wishlistForm = document.getElementById('wishlist-form');
  wishlistForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = document.getElementById('wishText').value.trim();
    if (text) {
      if (!Array.isArray(data.wishlist)) data.wishlist = [];
      data.wishlist.unshift({ text, done: false });
      document.getElementById('wishText').value = '';
      saveData();
    }
  });

  // Wishlist checkbox toggle
  const wishlistList = document.getElementById('wishlistList');
  wishlistList.addEventListener('change', e => {
    if (e.target.classList.contains('wish-checkbox')) {
      const idx = parseInt(e.target.dataset.index, 10);
      if (!isNaN(idx) && data.wishlist && data.wishlist[idx]) {
        data.wishlist[idx].done = e.target.checked;
        saveData();
      }
    }
  });

  // Anniversary form
  const anniversaryForm = document.getElementById('anniversary-form');
  anniversaryForm.addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('annivTitle').value.trim();
    const date = document.getElementById('annivDate').value;
    const repeat = document.getElementById('annivRepeat').checked;
    if (title && date) {
      if (!Array.isArray(data.anniversaries)) data.anniversaries = [];
      data.anniversaries.unshift({ title, date, repeat });
      document.getElementById('annivTitle').value = '';
      document.getElementById('annivDate').value = '';
      document.getElementById('annivRepeat').checked = false;
      saveData();
    }
  });
}

// Compute days since start date
function computeDaysSinceStart() {
  if (!data.startDate) return '';
  const start = new Date(data.startDate);
  const today = new Date();
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff : '';
}

// Compute next upcoming anniversary
function computeNextAnniversary() {
  if (!data.anniversaries || data.anniversaries.length === 0) return null;
  const today = new Date();
  let next = null;
  let minDiff = Infinity;
  data.anniversaries.forEach(item => {
    const base = new Date(item.date);
    let annivDate = new Date(base);
    if (item.repeat) {
      annivDate.setFullYear(today.getFullYear());
      if (annivDate < today) {
        annivDate.setFullYear(today.getFullYear() + 1);
      }
    }
    const diff = (annivDate - today) / (1000 * 60 * 60 * 24);
    if (diff >= 0 && diff < minDiff) {
      minDiff = diff;
      next = { title: item.title, days: Math.ceil(diff) };
    }
  });
  return next;
}

// Render all UI sections
function render() {
  // Update day count and declaration
  const dayCountEl = document.getElementById('dayCount');
  const declarationEl = document.getElementById('declaration');
  if (data.startDate) {
    const days = computeDaysSinceStart();
    dayCountEl.textContent = days ? `Day ${days}` : '';
  } else {
    dayCountEl.textContent = '';
  }
  declarationEl.textContent = data.declaration || '';

  // Populate message sender options
  const msgFromSelect = document.getElementById('msgFrom');
  msgFromSelect.innerHTML = '';
  ['name1', 'name2'].forEach(key => {
    if (data[key]) {
      const opt = document.createElement('option');
      opt.value = data[key];
      opt.textContent = data[key];
      msgFromSelect.appendChild(opt);
    }
  });

  // Messages list
  const msgList = document.getElementById('msgList');
  msgList.innerHTML = '';
  (data.messages || []).forEach(msg => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${msg.from}:</strong> ${msg.text} <small>${msg.date}</small>`;
    msgList.appendChild(li);
  });

  // Timeline list
  const timelineList = document.getElementById('timelineList');
  timelineList.innerHTML = '';
  (data.timeline || []).forEach(ev => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${ev.date} - ${ev.title}</strong><p>${ev.desc || ''}</p>`;
    timelineList.appendChild(li);
  });

  // Wishlist list
  const wishlistList = document.getElementById('wishlistList');
  wishlistList.innerHTML = '';
  (data.wishlist || []).forEach((wish, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `<label><input type="checkbox" class="wish-checkbox" data-index="${idx}" ${wish.done ? 'checked' : ''}> ${wish.text}</label>`;
    if (wish.done) {
      li.style.textDecoration = 'line-through';
      li.style.opacity = '0.6';
    }
    wishlistList.appendChild(li);
  });

  // Anniversaries list and next
  const annivList = document.getElementById('anniversaryList');
  annivList.innerHTML = '';
  (data.anniversaries || []).forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.title} - ${item.date}${item.repeat ? ' (every year)' : ''}`;
    annivList.appendChild(li);
  });
  const next = computeNextAnniversary();
  const nextAnnivEl = document.getElementById('nextAnniversary');
  if (next) {
    nextAnnivEl.textContent = `Next: ${next.title} in ${next.days} days`;
  } else {
    nextAnnivEl.textContent = '';
  }
}

// Initialize after DOM ready
document.addEventListener('DOMContentLoaded', () => {
  setupNav();
  setupForms();
  render();
});
