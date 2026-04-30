// HuaHua Space localStorage app v3
const STORAGE_KEY = 'huahua_space_v3';

const defaultData = {
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

let data = loadData();

function loadData() {
  try {
    const v3 = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (v3) return { ...defaultData, ...v3 };

    const v2 = JSON.parse(localStorage.getItem('huahua_space_v2'));
    if (v2) return { ...defaultData, ...v2 };
  } catch (error) {
    console.warn('Failed to read saved HuaHua data:', error);
  }

  return { ...defaultData };
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  render();
}

function $(id) {
  return document.getElementById(id);
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

function todayString() {
  return new Date().toISOString().split('T')[0];
}

function setupNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-section');

      document.querySelectorAll('.section').forEach(section => {
        section.classList.toggle('active', section.id === target);
      });

      document.querySelectorAll('.nav-btn').forEach(item => {
        item.classList.toggle('active', item === btn);
      });
    });
  });
}

function setupForms() {
  $('couple-form').addEventListener('submit', event => {
    event.preventDefault();

    data.coupleName = $('coupleName').value.trim();
    data.name1 = $('name1').value.trim();
    data.name2 = $('name2').value.trim();
    data.startDate = $('startDate').value;
    data.declaration = $('declarationInput').value.trim();

    saveData();
  });

  $('reset').addEventListener('click', () => {
    if (!confirm('Clear all saved HuaHua Space data?')) return;

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('huahua_space_v2');
    data = { ...defaultData };
    render();
  });

  $('message-form').addEventListener('submit', event => {
    event.preventDefault();

    const from = $('msgFrom').value || data.name1 || data.name2 || 'Someone';
    const text = $('msgText').value.trim();
    if (!text) return;

    data.messages = ensureArray(data.messages);
    data.messages.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      from,
      text,
      date: todayString()
    });

    $('msgText').value = '';
    saveData();
  });

  $('timeline-form').addEventListener('submit', event => {
    event.preventDefault();

    const eventDate = $('eventDate').value;
    const title = $('eventTitle').value.trim();
    const desc = $('eventDesc').value.trim();
    if (!eventDate || !title) return;

    data.timeline = ensureArray(data.timeline);
    data.timeline.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      date: eventDate,
      title,
      desc
    });

    $('eventDate').value = '';
    $('eventTitle').value = '';
    $('eventDesc').value = '';
    saveData();
  });

  $('wishlist-form').addEventListener('submit', event => {
    event.preventDefault();

    const text = $('wishText').value.trim();
    if (!text) return;

    data.wishlist = ensureArray(data.wishlist);
    data.wishlist.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      text,
      done: false
    });

    $('wishText').value = '';
    saveData();
  });

  $('wishlistList').addEventListener('change', event => {
    if (!event.target.classList.contains('wish-checkbox')) return;

    const index = Number(event.target.dataset.index);
    if (!data.wishlist[index]) return;

    data.wishlist[index].done = event.target.checked;
    saveData();
  });

  $('anniversary-form').addEventListener('submit', event => {
    event.preventDefault();

    const title = $('annivTitle').value.trim();
    const date = $('annivDate').value;
    const repeat = $('annivRepeat').checked;
    if (!title || !date) return;

    data.anniversaries = ensureArray(data.anniversaries);
    data.anniversaries.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      title,
      date,
      repeat
    });

    $('annivTitle').value = '';
    $('annivDate').value = '';
    $('annivRepeat').checked = false;
    saveData();
  });
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function computeDaysSinceStart() {
  if (!data.startDate) return null;

  const start = new Date(`${data.startDate}T00:00:00`);
  const today = new Date();
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));

  return diff >= 0 ? diff : null;
}

function computeNextAnniversary() {
  const anniversaries = ensureArray(data.anniversaries);
  if (!anniversaries.length) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let next = null;
  let minDiff = Infinity;

  anniversaries.forEach(item => {
    const base = new Date(`${item.date}T00:00:00`);
    if (Number.isNaN(base.getTime())) return;

    let annivDate = new Date(base);
    if (item.repeat) {
      annivDate.setFullYear(today.getFullYear());
      if (annivDate < today) annivDate.setFullYear(today.getFullYear() + 1);
    }

    const diff = Math.ceil((annivDate - today) / (1000 * 60 * 60 * 24));
    if (diff >= 0 && diff < minDiff) {
      minDiff = diff;
      next = { ...item, days: diff };
    }
  });

  return next;
}

function render() {
  renderProfileForm();
  renderHero();
  renderMessageOptions();
  renderMessages();
  renderTimeline();
  renderWishlist();
  renderAnniversaries();
  renderRecentFeed();
}

function renderProfileForm() {
  $('coupleName').value = data.coupleName || '';
  $('name1').value = data.name1 || '';
  $('name2').value = data.name2 || '';
  $('startDate').value = data.startDate || '';
  $('declarationInput').value = data.declaration || '';
}

function renderHero() {
  const coupleTitle = data.coupleName || buildCoupleTitle() || 'Build your little universe together';
  const days = computeDaysSinceStart();
  const next = computeNextAnniversary();
  const messages = ensureArray(data.messages);
  const timeline = ensureArray(data.timeline);
  const wishlist = ensureArray(data.wishlist);
  const unfinishedWishes = wishlist.filter(item => !item.done).length;

  $('heroTitle').textContent = coupleTitle;
  $('declaration').textContent = data.declaration || 'Add your names, first day and declaration to light up this space.';
  $('dayCount').textContent = days === null ? '—' : days;
  $('sideDayCount').textContent = days === null ? 'Set your start date' : `Day ${days}`;
  $('messageCount').textContent = messages.length;
  $('timelineCount').textContent = timeline.length;
  $('wishCount').textContent = unfinishedWishes;
  $('sideNextAnniversary').textContent = next ? `${next.title}: ${next.days} days left` : 'No anniversary yet';
}

function buildCoupleTitle() {
  if (data.name1 && data.name2) return `${data.name1} × ${data.name2}`;
  return data.name1 || data.name2 || '';
}

function renderMessageOptions() {
  const msgFromSelect = $('msgFrom');
  const names = [data.name1, data.name2].filter(Boolean);

  msgFromSelect.innerHTML = '';

  if (!names.length) {
    const option = document.createElement('option');
    option.value = 'Someone';
    option.textContent = 'Someone';
    msgFromSelect.appendChild(option);
    return;
  }

  names.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    msgFromSelect.appendChild(option);
  });
}

function renderMessages() {
  const list = $('msgList');
  const messages = ensureArray(data.messages);

  if (!messages.length) {
    list.innerHTML = '<li class="empty-state">No messages yet. Write the first one.</li>';
    return;
  }

  list.innerHTML = messages.map(msg => `
    <li class="card-item">
      <header>
        <strong>${escapeHtml(msg.from || 'Someone')}</strong>
        <span class="meta">${formatDate(msg.date)}</span>
      </header>
      <p>${escapeHtml(msg.text)}</p>
    </li>
  `).join('');
}

function renderTimeline() {
  const list = $('timelineList');
  const timeline = ensureArray(data.timeline).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));

  if (!timeline.length) {
    list.innerHTML = '<li class="empty-state">No memories yet. Capture a special day.</li>';
    return;
  }

  list.innerHTML = timeline.map(event => `
    <li class="timeline-item">
      <header>
        <strong>${escapeHtml(event.title)}</strong>
        <span class="meta">${formatDate(event.date)}</span>
      </header>
      <p>${escapeHtml(event.desc || 'No description')}</p>
    </li>
  `).join('');
}

function renderWishlist() {
  const list = $('wishlistList');
  const wishlist = ensureArray(data.wishlist);

  if (!wishlist.length) {
    list.innerHTML = '<li class="empty-state">No wishes yet. Add something you want to do together.</li>';
    return;
  }

  list.innerHTML = wishlist.map((wish, index) => `
    <li class="card-item ${wish.done ? 'done' : ''}">
      <label class="wish-row">
        <input type="checkbox" class="wish-checkbox" data-index="${index}" ${wish.done ? 'checked' : ''}>
        <span class="wish-text">${escapeHtml(wish.text)}</span>
      </label>
    </li>
  `).join('');
}

function renderAnniversaries() {
  const next = computeNextAnniversary();
  const list = $('anniversaryList');
  const anniversaries = ensureArray(data.anniversaries).slice().sort((a, b) => String(a.date).localeCompare(String(b.date)));

  $('nextAnniversary').textContent = next
    ? `Next: ${next.title} · ${next.days === 0 ? 'today' : `${next.days} days left`}`
    : 'No upcoming anniversary yet';

  if (!anniversaries.length) {
    list.innerHTML = '<li class="empty-state">No anniversaries saved yet.</li>';
    return;
  }

  list.innerHTML = anniversaries.map(item => `
    <li class="card-item">
      <header>
        <strong>${escapeHtml(item.title)}</strong>
        <span class="meta">${formatDate(item.date)}</span>
      </header>
      <p>${item.repeat ? 'Repeats every year' : 'One-time important day'}</p>
    </li>
  `).join('');
}

function renderRecentFeed() {
  const feed = $('recentFeed');
  const items = [
    ...ensureArray(data.messages).map(item => ({ type: 'Message', title: item.from || 'Someone', text: item.text, date: item.date })),
    ...ensureArray(data.timeline).map(item => ({ type: 'Memory', title: item.title, text: item.desc, date: item.date })),
    ...ensureArray(data.wishlist).map(item => ({ type: item.done ? 'Completed wish' : 'Wish', title: item.text, text: item.done ? 'Marked as done' : 'Waiting to happen', date: todayString() }))
  ].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 5);

  if (!items.length) {
    feed.className = 'feed-list empty-state';
    feed.textContent = 'Add a message, memory or wish to start the feed.';
    return;
  }

  feed.className = 'feed-list';
  feed.innerHTML = items.map(item => `
    <article class="feed-item">
      <header>
        <strong>${escapeHtml(item.title)}</strong>
        <span class="meta">${escapeHtml(item.type)} · ${formatDate(item.date)}</span>
      </header>
      <p>${escapeHtml(item.text || '')}</p>
    </article>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  setupNav();
  setupForms();
  render();
});
