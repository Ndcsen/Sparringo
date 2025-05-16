// ==== LocalStorage ====
function saveData() {
  localStorage.setItem('sparringo_categories', JSON.stringify(categories));
  localStorage.setItem('sparringo_participants', JSON.stringify(participants));
}

function loadData() {
  const cats = localStorage.getItem('sparringo_categories');
  const parts = localStorage.getItem('sparringo_participants');
  if (cats) categories.splice(0, categories.length, ...JSON.parse(cats));
  if (parts) participants.splice(0, participants.length, ...JSON.parse(parts));
}

// Массивы для хранения данных
const categories = [];
const participants = [];

// Турнирные данные для выбранной категории
let tournamentRounds = [];
let currentRound = 0;
let selectedTournamentCategory = null;

// Общие результаты по категориям
const tournamentResults = {};

// Индексы редактирования
let editingCategoryIndex = null;
let editingParticipantIndex = null;

// ==== Основная инициализация после загрузки DOM ====
document.addEventListener('DOMContentLoaded', () => {
  // Загрузка сохранённых данных
  loadData();
  renderCategories();
  renderParticipants();
  populateCategorySelect();

  // Навешиваем обработчики
  document.getElementById('category-form-btn').onclick = addCategory;
  document.getElementById('participant-form-btn').onclick = addParticipant;
  document.getElementById('start-tournament-btn').onclick = startTournament;
  document.getElementById('next-round-btn').onclick = nextRound;
});

// === Категории ===
function addCategory() {
  const name = document.getElementById('cat-name').value.trim();
  const minAge = parseInt(document.getElementById('cat-min-age').value, 10);
  const maxAge = parseInt(document.getElementById('cat-max-age').value, 10);
  const minWeight = parseFloat(document.getElementById('cat-min-weight').value);
  const maxWeight = parseFloat(document.getElementById('cat-max-weight').value);

  if (!name || isNaN(minAge) || isNaN(maxAge) || isNaN(minWeight) || isNaN(maxWeight)) {
    alert('Заполните все поля категории корректно.');
    return;
  }
  if (minAge > maxAge || minWeight > maxWeight) {
    alert('Минимальные значения не могут быть больше максимальных.');
    return;
  }

  const newCat = { name, minAge, maxAge, minWeight, maxWeight };
  if (editingCategoryIndex === null) {
    categories.push(newCat);
  } else {
    categories[editingCategoryIndex] = newCat;
    editingCategoryIndex = null;
    document.getElementById('category-form-btn').textContent = 'Добавить категорию';
  }

  clearCategoryForm();
  saveData();
  renderCategories();
  populateCategorySelect();
}

function renderCategories() {
  const list = document.getElementById('category-list');
  list.innerHTML = '';
  categories.forEach((c, i) => {
    const li = document.createElement('li');
    li.textContent = `${c.name}: возраст ${c.minAge}-${c.maxAge} лет, вес ${c.minWeight}-${c.maxWeight} кг`;

    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.onclick = () => startEditCategory(i);
    li.appendChild(editBtn);

    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑️';
    delBtn.onclick = () => {
      categories.splice(i, 1);
      saveData();
      renderCategories();
      populateCategorySelect();
    };
    li.appendChild(delBtn);

    list.appendChild(li);
  });
}

function startEditCategory(index) {
  editingCategoryIndex = index;
  const c = categories[index];
  document.getElementById('cat-name').value = c.name;
  document.getElementById('cat-min-age').value = c.minAge;
  document.getElementById('cat-max-age').value = c.maxAge;
  document.getElementById('cat-min-weight').value = c.minWeight;
  document.getElementById('cat-max-weight').value = c.maxWeight;
  document.getElementById('category-form-btn').textContent = 'Сохранить изменения';
}

function clearCategoryForm() {
  ['cat-name','cat-min-age','cat-max-age','cat-min-weight','cat-max-weight']
    .forEach(id => document.getElementById(id).value = '');
}

function populateCategorySelect() {
  const select = document.getElementById('tournament-category-select');
  if (!select) return;
  select.innerHTML = '<option value="">Выберите категорию</option>';
  categories.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.name;
    opt.textContent = c.name;
    select.appendChild(opt);
  });
}

// === Участники ===
function addParticipant() {
  const name = document.getElementById('name').value.trim();
  const age = parseInt(document.getElementById('age').value, 10);
  const weight = parseFloat(document.getElementById('weight').value);

  if (!name || isNaN(age) || isNaN(weight)) {
    alert('Заполните все поля участника корректно.');
    return;
  }

  // Ищем категорию по совпадению
  let category = categories.find(c =>
    age >= c.minAge && age <= c.maxAge &&
    weight >= c.minWeight && weight <= c.maxWeight
  );

  // Если нет точной, ищем ближайшую по весу среди подходящих по возрасту
  if (!category) {
    const ageFit = categories.filter(c => age >= c.minAge && age <= c.maxAge);
    if (ageFit.length) {
      let minDiff = Infinity;
      ageFit.forEach(c => {
        const diff = weight < c.minWeight ? c.minWeight - weight : weight > c.maxWeight ? weight - c.maxWeight : 0;
        if (diff < minDiff) { minDiff = diff; category = c; }
      });
      alert(`Участник автоматически отнесён к категории "${category.name}"`);
    }
  }

  if (!category) {
    alert('Нет подходящей категории по возрасту. Добавьте категорию или исправьте данные.');
    return;
  }

  const newP = { name, age, weight, category: category.name };
  if (editingParticipantIndex === null) {
    participants.push(newP);
  } else {
    participants[editingParticipantIndex] = newP;
    editingParticipantIndex = null;
    document.getElementById('participant-form-btn').textContent = 'Добавить участника';
  }

  clearParticipantForm();
  saveData();
  renderParticipants();
}

function renderParticipants() {
  const list = document.getElementById('participant-list');
  list.innerHTML = '';
  participants.forEach((p, i) => {
    const li = document.createElement('li');
    li.textContent = `${p.name} — ${p.age} лет, ${p.weight} кг, кат. "${p.category}"`;

    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.onclick = () => startEditParticipant(i);
    li.appendChild(editBtn);

    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑️';
    delBtn.onclick = () => { participants.splice(i, 1); saveData(); renderParticipants(); };
    li.appendChild(delBtn);

    list.appendChild(li);
  });
}

function startEditParticipant(index) {
  editingParticipantIndex = index;
  const p = participants[index];
  document.getElementById('name').value = p.name;
  document.getElementById('age').value = p.age;
  document.getElementById('weight').value = p.weight;
  document.getElementById('participant-form-btn').textContent = 'Сохранить участника';
}

function clearParticipantForm() {
  ['name','age','weight'].forEach(id => document.getElementById(id).value = '');
}

// === Турнир ===
function createRound(list) {
  const shuffled = [...list].sort(() => Math.random() - 0.5);
  const pairs = [];
  for (let i = 0; i < shuffled.length - 1; i += 2) pairs.push({ a: shuffled[i], b: shuffled[i+1], winner: null });
  if (shuffled.length % 2 === 1) pairs.push({ a: shuffled[shuffled.length-1], b: null, winner: shuffled[shuffled.length-1] });
  return pairs;
}

function renderRound() {
  const container = document.getElementById('round-container');
  container.innerHTML = `<h2>Турнир: ${selectedTournamentCategory} (Этап ${currentRound+1})</h2>`;
  const round = tournamentRounds[currentRound];
  round.forEach((pair, i) => {
    const div = document.createElement('div'); div.className = 'tournament-pair';
    if (pair.b) {
      div.innerHTML = `<span>${pair.a.name}</span><button data-index="${i}" data-choice="a">✔</button><button data-index="${i}" data-choice="b">✔</button><span>${pair.b.name}</span>`;
    } else {
      div.innerHTML = `<span>${pair.a.name} (бай) — проходит автоматически</span>`; pair.winner = pair.a;
    }
    container.appendChild(div);
  });

  container.querySelectorAll('button[data-index]').forEach(btn => btn.onclick = e => {
    const idx = +e.target.dataset.index, choice = e.target.dataset.choice;
    tournamentRounds[currentRound][idx].winner = choice==='a'?tournamentRounds[currentRound][idx].a:tournamentRounds[currentRound][idx].b;
    renderRound();
  });

  const allChosen = tournamentRounds[currentRound].every(p => p.winner);
  document.getElementById('next-round-btn').style.display = allChosen?'block':'none';
}

function startTournament() {
  const select = document.getElementById('tournament-category-select');
  const cat = select.value;
  if (!cat) { alert('Выберите категорию турнира'); return; }
  selectedTournamentCategory = cat;
  const list = participants.filter(p => p.category===cat);
  if (list.length<2) { alert('Недостаточно участников в этой категории'); return; }
  tournamentRounds=[createRound(list)]; currentRound=0; renderRound();
}

function nextRound() {
  const winners = tournamentRounds[currentRound].map(p=>p.winner);
  if (winners.length===1) { tournamentResults[selectedTournamentCategory]=winners[0].name; renderSummary(); return; }
  tournamentRounds.push(createRound(winners)); currentRound++; renderRound();
}

function renderSummary() {
  const container = document.getElementById('summary-container');
  container.innerHTML = '<h2>Итоги турниров</h2>';
  const ul=document.createElement('ul');
  for(const [cat,w] of Object.entries(tournamentResults)){
    const li=document.createElement('li'); li.textContent=`Категория "${cat}": победитель — ${w}`; ul.appendChild(li);
  }
  container.appendChild(ul);
}
