// const express = require('express');
// const { createProxyMiddleware } = require('http-proxy-middleware');
// const rateLimit = require('express-rate-limit');

// const app = express();
// app.set('trust proxy', 1);

// // Prevent spamming the anonymous chat
// const limiter = rateLimit({
//   windowMs: 1 * 60 * 1000, // 1 minute
//   max: 60, // 60 requests per minute
//   message: "Too many messages, please slow down."
// });
// app.use(limiter);

// // Proxy WebSocket connections to the chat-service
// app.use('/socket.io', createProxyMiddleware({
//   target: process.env.CHAT_SERVICE_URL,
//   ws: true,
//   changeOrigin: true,
//   secure: false
// }));

// app.listen(process.env.PORT || 8080, () => {
//   console.log('✅ Gateway running on port 8080');
// });

const express = require("express");
const http = require("http");
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");

const app = express();
app.set("trust proxy", 1);

// Prevent spamming
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: "Too many messages, slow down."
});
app.use(limiter);

const chatTarget = process.env.CHAT_SERVICE_URL;

// Create proxy
const socketProxy = createProxyMiddleware({
  target: chatTarget,
  ws: true,
  changeOrigin: true,
  secure: false
});

// HTTP + WS route
app.use("/socket.io", socketProxy);

// Create raw HTTP server
const server = http.createServer(app);

// VERY IMPORTANT — forward WebSocket upgrades
server.on("upgrade", socketProxy.upgrade);

// Start gateway
server.listen(process.env.PORT || 8080, () => {
  console.log("🚀 Gateway running on port 8080");
});
