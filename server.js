const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port: PORT });

let admin = null;
let user = null;

wss.on('connection', (ws) => {
  console.log('Client connecté');

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    // identification
    if (data.type === "identify") {
      if (data.role === "admin") admin = ws;
      if (data.role === "user") user = ws;
      console.log("Admin:", !!admin, "User:", !!user);
      return;
    }

    // relay
    if (data.type === "offer" && admin) admin.send(message);
    if (data.type === "answer" && user) user.send(message);
    if (data.type === "candidate") {
      if (data.role === "user" && admin) admin.send(message);
      if (data.role === "admin" && user) user.send(message);
    }
  });

  ws.on('close', () => {
    if (ws === admin) admin = null;
    if (ws === user) user = null;
    console.log('Client déconnecté');
  });
});

console.log(`Serveur WebSocket en écoute sur le port ${PORT}`);
