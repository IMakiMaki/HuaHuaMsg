(function(){
const STORAGE_KEY = 'huahua_space';
let data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  render();
}

function setup() {
  document.getElementById('save').addEventListener('click', ()=> {
    data.coupleName = document.getElementById('coupleName').value;
    data.name1 = document.getElementById('name1').value;
    data.name2 = document.getElementById('name2').value;
    data.startDate = document.getElementById('startDate').value;
    data.declaration = document.getElementById('declarationInput').value;
    data.messages = data.messages || [];
    data.timeline = data.timeline || [];
    saveData();
  });
  document.getElementById('reset').addEventListener('click', ()=> {
    if (confirm('Clear all data?')) {
      localStorage.removeItem(STORAGE_KEY);
      data = {};
      render();
    }
  });
  document.getElementById('msgForm').addEventListener('submit', (e)=> {
    e.preventDefault();
    const msg = {
      from: document.getElementById('msgFrom').value,
      text: document.getElementById('msgText').value,
      date: new Date().toISOString().slice(0,10)
    };
    if (!data.messages) data.messages = [];
    data.messages.unshift(msg);
    saveData();
    document.getElementById('msgText').value = '';
  });
  document.getElementById('timelineForm').addEventListener('submit', (e)=> {
    e.preventDefault();
    const event = {
      date: document.getElementById('eventDate').value,
      title: document.getElementById('eventTitle').value,
      desc: document.getElementById('eventDesc').value
    };
    if (!data.timeline) data.timeline = [];
    data.timeline.unshift(event);
    saveData();
    document.getElementById('eventDate').value = '';
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventDesc').value = '';
  });
}

function render() {
  document.getElementById('title').textContent = data.coupleName ? data.coupleName : 'Your Couple Space';
  document.getElementById('declaration').textContent = data.declaration || '';
  if (data.startDate) {
    const start = new Date(data.startDate);
    const diff = Math.floor((Date.now() - start.getTime()) / (1000*60*60*24));
    document.getElementById('dayCount').textContent = `Together for ${diff} days`;
  } else {
    document.getElementById('dayCount').textContent = '';
  }
  document.getElementById('coupleName').value = data.coupleName || '';
  document.getElementById('name1').value = data.name1 || '';
  document.getElementById('name2').value = data.name2 || '';
  document.getElementById('startDate').value = data.startDate || '';
  document.getElementById('declarationInput').value = data.declaration || '';

  const msgFrom = document.getElementById('msgFrom');
  msgFrom.innerHTML = '';
  if (data.name1) {
    const opt1 = document.createElement('option');
    opt1.value = data.name1;
    opt1.textContent = data.name1;
    msgFrom.appendChild(opt1);
  }
  if (data.name2) {
    const opt2 = document.createElement('option');
    opt2.value = data.name2;
    opt2.textContent = data.name2;
    msgFrom.appendChild(opt2);
  }
  const msgList = document.getElementById('msgList');
  msgList.innerHTML = '';
  if (data.messages) {
    data.messages.forEach((m)=>{
      const li = document.createElement('li');
      li.textContent = `${m.date} ${m.from}: ${m.text}`;
      msgList.appendChild(li);
    });
  }

  const timelineList = document.getElementById('timelineList');
  timelineList.innerHTML = '';
  if (data.timeline) {
    data.timeline.forEach(event => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${event.date} ${event.title}</strong><p>${event.desc}</p>`;
      timelineList.appendChild(li);
    });
  }
}

setup();
render();
})();
