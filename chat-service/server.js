
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.json());

// ---------------------
// MongoDB
// ---------------------
const mongoUrl = process.env.MONGO_URL;

mongoose.connect(mongoUrl)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ Mongo error:", err));

const messageSchema = new mongoose.Schema({
  text: String,
  sender: String,
  time: String
});

const Message = mongoose.model("Message", messageSchema);

// ---------------------
// Redis Adapter
// ---------------------
const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

async function start() {
  await pubClient.connect();
  await subClient.connect();

  io.adapter(createAdapter(pubClient, subClient));
  console.log("🧠 Redis adapter connected");

  io.on("connection", (socket) => {
    const username = "Anon-" + socket.id.slice(0, 5);
    console.log("🟢 Connected:", username);

    socket.on("send_message", async (data) => {
      console.log("💬", data.text);

      await Message.create({
        text: data.text,
        sender: username,
        time: new Date().toLocaleTimeString()
      });

      io.emit("receive_message", {
        text: data.text,
        sender: username,
        time: new Date().toLocaleTimeString()
      });
    });

    socket.on("disconnect", () => {
      console.log("🔴 Disconnected:", username);
    });
  });

  server.listen(process.env.PORT, () => {
    console.log("🚀 Chat service running");
  });
}

start();
