const http = require('http');
const { DialogueStreamManager } = require('./dialogueGenerator');

const PORT = parseInt(process.env.PORT || '3002', 10);
const OPSGUARD_CORE_URL = process.env.OPSGUARD_CORE_URL || 'http://opsguard-core:3000';
const STREAM_INTERVAL_MS = parseInt(process.env.STREAM_INTERVAL_MS || '4000', 10);

const manager = new DialogueStreamManager(OPSGUARD_CORE_URL);

// Connected SSE clients
const sseClients = new Set();

function broadcastEvent(eventType, data) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

// Background discussion stepper
let streamTimer = null;
function startStreamLoop() {
  if (streamTimer) clearInterval(streamTimer);

  streamTimer = setInterval(async () => {
    try {
      // Simulate typing indicator 1.2s before message
      broadcastEvent('typing', { isTyping: true });

      setTimeout(async () => {
        try {
          const msg = await manager.advanceNextStep();
          broadcastEvent('typing', { isTyping: false });
          if (msg) {
            broadcastEvent('message', msg);
          }
        } catch (err) {
          console.error('[StreamLoop Error]', err);
        }
      }, 1200);
    } catch (e) {
      console.error('[StreamLoop Interval Error]', e);
    }
  }, STREAM_INTERVAL_MS);
}

startStreamLoop();

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    return res.end();
  }

  // 1. Healthcheck
  if (pathname === '/health' || pathname === '/status') {
    return sendJson(res, 200, {
      status: 'healthy',
      service: 'opsguard-whatsapp-stream',
      clientsConnected: sseClients.size,
      totalMessages: manager.getRecentMessages().length,
      isStreaming: manager.isStreaming,
      streamIntervalMs: STREAM_INTERVAL_MS,
      coreUrl: OPSGUARD_CORE_URL,
    });
  }

  // 2. Server-Sent Events (SSE) Stream
  if (pathname === '/stream' || pathname === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Accel-Buffering': 'no',
    });

    res.write(`event: init\ndata: ${JSON.stringify({ status: 'connected', history: manager.getRecentMessages() })}\n\n`);

    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
    return;
  }

  // 3. Message History
  if (pathname === '/messages' && req.method === 'GET') {
    return sendJson(res, 200, {
      messages: manager.getRecentMessages(),
      count: manager.getRecentMessages().length,
    });
  }

  // 4. Send Message (from app user)
  if (pathname === '/send' && req.method === 'POST') {
    let bodyStr = '';
    req.on('data', chunk => { bodyStr += chunk; });
    req.on('end', async () => {
      try {
        const body = JSON.parse(bodyStr || '{}');
        const text = body.text || body.message;
        if (!text) {
          return sendJson(res, 400, { error: 'Text field is required' });
        }

        const senderName = body.senderName || 'Lead AI Operator';
        const { userMsg, botReply } = await manager.handleUserMessage(text, senderName);

        // Broadcast both user message and bot response to all connected clients
        broadcastEvent('message', userMsg);
        setTimeout(() => {
          broadcastEvent('message', botReply);
        }, 800);

        return sendJson(res, 200, { success: true, userMsg, botReply });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    });
    return;
  }

  // 5. Trigger Scenario
  if (pathname.startsWith('/scenario/') && req.method === 'POST') {
    const scenarioKey = pathname.replace('/scenario/', '').trim();
    manager.triggerScenario(scenarioKey);
    broadcastEvent('system', { action: 'scenario_triggered', scenario: scenarioKey });
    return sendJson(res, 200, { success: true, scenario: scenarioKey });
  }

  // 6. Toggle Stream (Pause / Resume)
  if (pathname === '/toggle' && req.method === 'POST') {
    manager.isStreaming = !manager.isStreaming;
    broadcastEvent('system', { action: 'stream_toggled', isStreaming: manager.isStreaming });
    return sendJson(res, 200, { isStreaming: manager.isStreaming });
  }

  // Default 404
  return sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[OpsGuard WhatsApp Streamer] Running on port ${PORT}`);
  console.log(`[OpsGuard WhatsApp Streamer] Target OpsGuard Core: ${OPSGUARD_CORE_URL}`);
});
