import express from 'express';
import http from 'node:http'
import { WebSocketServer } from 'ws';

const clients = new Map();


function setupWebSocket(wss) {
  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const clientId = url.searchParams.get('clientId');

    if (!clientId) {
      ws.close(1008, 'Missing clientId');
      return;
    }    
   
    clients.set(clientId, ws);
    console.log(`Client connected: ${clientId}`);

    ws.on('close', () => {
      clients.delete(clientId);
      console.log(`Client disconnected: ${clientId}`);
    });
  });
}

function sendToClient(clientId, payload) {
  const ws = clients.get(clientId);
  if (ws && ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function handleNotify(req, res) {
  const { clientId, status, info } = req.body;

  if (!clientId || !status) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const payload = { status, info };

  console.log('notify to ', clientId)
  console.log(payload)
  sendToClient(clientId, payload);

  res.sendStatus(200);
}

const app = express();
app.use(express.json());

// HTTP endpoint untuk menerima notifikasi dari service utama
app.post('/notify', handleNotify);

// Buat HTTP server dan attach WebSocket
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Setup WebSocket handler
setupWebSocket(wss);

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});