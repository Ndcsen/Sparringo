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

// Загрузка при старте
loadData();
renderCategories();
renderParticipants();

// === Категории ===
let editingCategoryIndex = null;

function addCategory() {
  const name = document.getElementById('cat-name').value.trim();
  const minAge = parseInt(document.getElementById('cat-min-age').value, 10);
  const maxAge = parseInt(document.getElementById('cat-max-age').value, 10);
  const minWeight = parseFloat(document.getElementById('cat-min-weight').value);
  const maxWeight = parseFloat(document.getElementById('cat-max-weight').value);

  // Валидация...
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
    document.querySelector('#category-form button').textContent = 'Добавить категорию';
  }

  clearCategoryForm();
  saveData();
  renderCategories();
}

function renderCategories() {
  const list = document.getElementById('category-list');
  list.innerHTML = '';
  categories.forEach((c, i) => {
    const li = document.createElement('li');
    li.textContent = `${c.name}: ${c.minAge}-${c.maxAge} лет, ${c.minWeight}-${c.maxWeight} кг`;

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
  document.querySelector('#category-form button').textContent = 'Сохранить изменения';
}

function clearCategoryForm() {
  ['cat-name','cat-min-age','cat-max-age','cat-min-weight','cat-max-weight']
    .forEach(id => document.getElementById(id).value = '');
}

// === Участники ===
let editingParticipantIndex = null;

function addParticipant() {
  const name = document.getElementById('name').value.trim();
  const age = parseInt(document.getElementById('age').value, 10);
  const weight = parseFloat(document.getElementById('weight').value);

  if (!name || isNaN(age) || isNaN(weight)) {
    alert('Заполните все поля участника корректно.');
    return;
  }

  const category = categories.find(c =>
    age >= c.minAge && age <= c.maxAge &&
    weight >= c.minWeight && weight <= c.maxWeight
  );
  if (!category) {
    alert('Нет подходящей категории для этого участника.');
    return;
  }

  const newP = { name, age, weight, category: category.name };
  if (editingParticipantIndex === null) {
    participants.push(newP);
  } else {
    participants[editingParticipantIndex] = newP;
    editingParticipantIndex = null;
    document.querySelector('#form button').textContent = 'Добавить участника';
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
    delBtn.onclick = () => {
      participants.splice(i, 1);
      saveData();
      renderParticipants();
    };
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
  document.querySelector('#form button').textContent = 'Сохранить участника';
}

function clearParticipantForm() {
  ['name','age','weight'].forEach(id => document.getElementById(id).value = '');
}

// === Генерация пар ===
function generatePairs() {
  const container = document.getElementById('pairs-container');
  container.innerHTML = '';

  const byCategory = categories.map(c => ({
    category: c.name,
    list: participants.filter(p => p.category === c.name)
  }));

  byCategory.forEach(group => {
    const title = document.createElement('h3');
    title.textContent = `Категория "${group.category}" (${group.list.length})`;
    container.appendChild(title);

    if (group.list.length < 2) {
      const note = document.createElement('p');
      note.textContent = 'Недостаточно участников для пар.';
      container.appendChild(note);
      return;
    }

    const shuffled = [...group.list].sort(() => Math.random() - 0.5);
    const ul = document.createElement('ul');

    for (let i = 0; i < shuffled.length - 1; i += 2) {
      const li = document.createElement('li');
      li.textContent = `${shuffled[i].name} vs ${shuffled[i + 1].name}`;
      ul.appendChild(li);
    }
    if (shuffled.length % 2) {
      const li = document.createElement('li');
      li.textContent = `${shuffled[shuffled.length - 1].name} (бай)`;
      ul.appendChild(li);
    }

    container.appendChild(ul);
  });
}
