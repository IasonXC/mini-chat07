const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('Κάποιος συνδέθηκε');

  socket.on('chat message', (data) => {
    io.emit('chat message', data);
  });
});

http.listen(3000, () => {
  console.log('Το chat είναι διαθέσιμο στο http://localhost:3000');
});
