const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static('public'));

const USERS_FILE = path.join(__dirname, 'users.json');
const REQUESTS_FILE = path.join(__dirname, 'chat_requests.json');
const MESSAGES_FILE = path.join(__dirname, 'messages.json');

function load(file) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : [];
}
function save(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

app.post('/register', async (req, res) => {
  const users = load(USERS_FILE);
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).send('Το όνομα χρήστη υπάρχει ήδη.');
  }
  const hashed = await bcrypt.hash(password, 10);
  users.push({ username, password: hashed });
  save(USERS_FILE, users);
  res.send('Επιτυχής εγγραφή!');
});

app.post('/login', async (req, res) => {
  const users = load(USERS_FILE);
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).send('Λανθασμένο όνομα χρήστη.');
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).send('Λανθασμένος κωδικός.');
  res.send('Σύνδεση επιτυχής');
});

app.get('/users', (req, res) => {
  const users = load(USERS_FILE).map(u => u.username);
  res.json(users);
});

app.post('/chat-request', (req, res) => {
  const { from, to } = req.body;
  const requests = load(REQUESTS_FILE);
  if (!requests.find(r => r.from === from && r.to === to)) {
    requests.push({ from, to, accepted: false });
    save(REQUESTS_FILE, requests);
  }
  res.send('Αίτημα αποθηκεύτηκε');
});

app.post('/accept-request', (req, res) => {
  const { from, to } = req.body;
  const requests = load(REQUESTS_FILE);
  const reqFound = requests.find(r => r.from === from && r.to === to);
  if (reqFound) reqFound.accepted = true;
  save(REQUESTS_FILE, requests);
  res.send('Αποδοχή αιτήματος');
});

app.post('/messages', (req, res) => {
  const { user1, user2 } = req.body;
  const all = load(MESSAGES_FILE);
  const msgs = all.filter(m =>
    (m.from === user1 && m.to === user2) ||
    (m.from === user2 && m.to === user1)
  );
  res.json(msgs);
});

io.on('connection', (socket) => {
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
  });

  socket.on('chat message', (data) => {
    const all = load(MESSAGES_FILE);
    all.push(data);
    save(MESSAGES_FILE, all);
    io.to(data.room).emit('chat message', data);
  });
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
