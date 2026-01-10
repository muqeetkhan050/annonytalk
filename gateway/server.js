const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');

const app = express();

// Prevent spamming the anonymous chat
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: "Too many messages, please slow down."
});
app.use(limiter);

// Proxy WebSocket connections to the chat-service
app.use('/socket.io', createProxyMiddleware({
  target: 'http://chat-service:3001',
  ws: true,
  changeOrigin: true
}));

app.listen(8080, () => {
  console.log('✅ Gateway running on port 8080');
});

