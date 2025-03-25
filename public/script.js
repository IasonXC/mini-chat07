const socket = io();

function sendMessage() {
  const username = document.getElementById('username').value.trim();
  const message = document.getElementById('message').value.trim();

  if (username && message) {
    socket.emit('chat message', { username, message });
    document.getElementById('message').value = '';
  }
}

socket.on('chat message', (data) => {
  const messages = document.getElementById('messages');
  const msgDiv = document.createElement('div');
  msgDiv.textContent = `${data.username}: ${data.message}`;
  messages.appendChild(msgDiv);
  messages.scrollTop = messages.scrollHeight;
});
