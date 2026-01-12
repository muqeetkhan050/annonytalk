const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');

const app = express();
app.set('trust proxy', 1);

// Prevent spamming the anonymous chat
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: "Too many messages, please slow down."
});
app.use(limiter);

// Proxy WebSocket connections to the chat-service
app.use('/socket.io', createProxyMiddleware({
  target: process.env.CHAT_SERVICE_URL,
  ws: true,
  changeOrigin: true,
  secure: false
}));

app.listen(process.env.PORT || 8080, () => {
  console.log('✅ Gateway running on port 8080');
});

