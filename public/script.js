const currentUser = prompt("Ποιο είναι το όνομά σου;");

async function loadUsers() {
  const res = await fetch('/users');
  const users = await res.json();
  const container = document.getElementById('users');
  users.forEach(u => {
    if (u !== currentUser) {
      const div = document.createElement('div');
      div.className = 'user-item';
      div.innerHTML = `
        <span>${u}</span>
        <button onclick="sendRequest('${u}')">Αίτημα</button>
      `;
      container.appendChild(div);
    }
  });
}

async function sendRequest(toUser) {
  await fetch('/chat-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: currentUser, to: toUser })
  });
  alert("Αίτημα στάλθηκε!");
}

async function loadRequests() {
  const res = await fetch('/chat_requests.json');
  const requests = await res.json();
  const container = document.getElementById('requests');
  requests
    .filter(r => r.to === currentUser && !r.accepted)
    .forEach(r => {
      const div = document.createElement('div');
      div.className = 'user-item';
      div.innerHTML = `
        <span>${r.from}</span>
        <button onclick="acceptRequest('${r.from}')">Αποδοχή</button>
      `;
      container.appendChild(div);
    });
}

async function acceptRequest(fromUser) {
  await fetch('/accept-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: fromUser, to: currentUser })
  });
  alert("Αποδέχθηκες! Μεταφέρεσαι στο chat...");
  window.location = `/chat.html?user1=${currentUser}&user2=${fromUser}`;
} 

loadUsers();
loadRequests();
