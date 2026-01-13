

const express = require("express");
const http = require("http");
const cors = require("cors"); // 🔥 ADD THIS
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");

const app = express();
app.set("trust proxy", 1);

// 🔥 ADD CORS MIDDLEWARE
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: "Too many messages, slow down."
});
app.use(limiter);

const chatTarget = process.env.CHAT_SERVICE_URL;

console.log("🎯 Chat service target:", chatTarget);

// PROXY REST API ENDPOINT
app.use("/messages", createProxyMiddleware({
  target: chatTarget,
  changeOrigin: true,
  secure: false,
  onProxyReq: (proxyReq, req, res) => {
    console.log("📡 Proxying /messages to", chatTarget);
  },
  onError: (err, req, res) => {
    console.error("❌ Proxy error:", err.message);
    res.status(500).json({ error: "Proxy failed" });
  }
}));

// PROXY WEBSOCKET
const socketProxy = createProxyMiddleware({
  target: chatTarget,
  ws: true,
  changeOrigin: true,
  secure: false
});
app.use("/socket.io", socketProxy);

const server = http.createServer(app);
server.on("upgrade", socketProxy.upgrade);

server.listen(process.env.PORT || 8080, () => {
  console.log("🚀 Gateway running on port", process.env.PORT || 8080);
});