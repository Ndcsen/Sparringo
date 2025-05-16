const participants = [];

function addParticipant() {
  const name = document.getElementById('name').value.trim();
  const age = parseInt(document.getElementById('age').value.trim());
  const weight = parseFloat(document.getElementById('weight').value.trim());

  if (!name || isNaN(age) || isNaN(weight)) {
    alert('Пожалуйста, заполните все поля корректно.');
    return;
  }

  participants.push({ name, age, weight });
  document.getElementById('name').value = '';
  document.getElementById('age').value = '';
  document.getElementById('weight').value = '';
  renderParticipants();
}

function renderParticipants() {
  const list = document.getElementById('participant-list');
  list.innerHTML = '';
  participants.forEach((p, i) => {
    const li = document.createElement('li');
    li.textContent = `${p.name} — ${p.age} лет, ${p.weight} кг`;
    list.appendChild(li);
  });
}

function generatePairs() {
  const shuffled = [...participants].sort(() => Math.random() - 0.5);
  const pairs = [];

  for (let i = 0; i < shuffled.length - 1; i += 2) {
    pairs.push([shuffled[i], shuffled[i + 1]]);
  }

  if (shuffled.length % 2 === 1) {
    pairs.push([shuffled[shuffled.length - 1]]);
  }

  const list = document.getElementById('pairs-list');
  list.innerHTML = '';
  pairs.forEach(pair => {
    const li = document.createElement('li');
    if (pair.length === 2) {
      li.textContent = `${pair[0].name} vs ${pair[1].name}`;
    } else {
      li.textContent = `${pair[0].name} без пары`;
    }
    list.appendChild(li);
  });
}
