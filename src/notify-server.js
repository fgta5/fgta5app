import express from 'express';
import http from 'node:http'
import { WebSocketServer } from 'ws';

const clients = new Map();


function setupWebSocket(wss) {
  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId');
	
	const sessionId = req.sessionID;

	console.log(sessionId)

    if (!userId) {
      ws.close(1008, 'Missing userId');
      return;
    }

    clients.set(userId, ws);
    console.log(`Client connected: ${userId}`);

    ws.on('close', () => {
      clients.delete(userId);
      console.log(`Client disconnected: ${userId}`);
    });
  });
}

function sendToClient(userId, payload) {
  const ws = clients.get(userId);
  if (ws && ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function handleNotify(req, res) {
  const { userId, jobId, status } = req.body;

  if (!userId || !jobId || !status) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const payload = { jobId, status };
  sendToClient(userId, payload);

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