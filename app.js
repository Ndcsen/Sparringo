// Массивы для хранения данных
const categories = [];
const participants = [];

// --- Категории ---
function addCategory() {
  const name = document.getElementById('cat-name').value.trim();
  const minAge = parseInt(document.getElementById('cat-min-age').value);
  const maxAge = parseInt(document.getElementById('cat-max-age').value);
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

  categories.push({ name, minAge, maxAge, minWeight, maxWeight });
  clearCategoryForm();
  renderCategories();
}

function clearCategoryForm() {
  ['cat-name','cat-min-age','cat-max-age','cat-min-weight','cat-max-weight']
    .forEach(id => document.getElementById(id).value = '');
}

function renderCategories() {
  const list = document.getElementById('category-list');
  list.innerHTML = '';
  categories.forEach((c, i) => {
    const li = document.createElement('li');
    li.textContent = `${c.name}: возраст ${c.minAge}-${c.maxAge} лет, вес ${c.minWeight}-${c.maxWeight} кг`;
    list.appendChild(li);
  });
}

// --- Участники ---
function addParticipant() {
  const name = document.getElementById('name').value.trim();
  const age = parseInt(document.getElementById('age').value);
  const weight = parseFloat(document.getElementById('weight').value);

  if (!name || isNaN(age) || isNaN(weight)) {
    alert('Заполните все поля участника корректно.');
    return;
  }

  // Определяем категорию
  const category = categories.find(c =>
    age >= c.minAge && age <= c.maxAge &&
    weight >= c.minWeight && weight <= c.maxWeight
  );

  if (!category) {
    alert('Нет подходящей категории для этого участника.');
    return;
  }

  participants.push({ name, age, weight, category: category.name });
  clearParticipantForm();
  renderParticipants();
}

function clearParticipantForm() {
  ['name','age','weight'].forEach(id => document.getElementById(id).value = '');
}

function renderParticipants() {
  const list = document.getElementById('participant-list');
  list.innerHTML = '';
  participants.forEach((p, i) => {
    const li = document.createElement('li');
    li.textContent = `${p.name} — ${p.age} лет, ${p.weight} кг, кат. "${p.category}"`;
    list.appendChild(li);
  });
}

// --- Генерация пар ---
function generatePairs() {
  const container = document.getElementById('pairs-container');
  container.innerHTML = '';

  // Группируем по категории
  const byCategory = categories.map(c => {
    return {
      category: c.name,
      list: participants.filter(p => p.category === c.name)
    };
  });

  byCategory.forEach(group => {
    const title = document.createElement('h3');
    title.textContent = `Категория "${group.category}" (${group.list.length} участник${group.list.length % 10 === 1 ? '' : 'ов'})`;
    container.appendChild(title);

    if (group.list.length < 2) {
      const note = document.createElement('p');
      note.textContent = 'Недостаточно участников для пар.';
      container.appendChild(note);
      return;
    }

    // Перемешиваем и формируем пары
    const shuffled = [...group.list].sort(() => Math.random() - 0.5);
    const ul = document.createElement('ul');

    for (let i = 0; i < shuffled.length - 1; i += 2) {
      const li = document.createElement('li');
      li.textContent = `${shuffled[i].name} vs ${shuffled[i + 1].name}`;
      ul.appendChild(li);
    }
    // Если нечётный — оставляем бай
    if (shuffled.length % 2) {
      const li = document.createElement('li');
      li.textContent = `${shuffled[shuffled.length - 1].name} (бай)`;
      ul.appendChild(li);
    }

    container.appendChild(ul);
  });
}
