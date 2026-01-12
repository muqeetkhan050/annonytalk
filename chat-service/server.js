

// const express = require('express');
// const { createServer } = require('http');
// const { Server } = require('socket.io');
// const { createClient } = require('redis');
// const { createAdapter } = require('@socket.io/redis-adapter');
// const mongoose = require('mongoose');

// const app = express();
// const httpServer = createServer(app);
// const io = new Server(httpServer, {
//   cors: { origin: "*" } // allow all origins (adjust in production)
// });

// app.use(express.json());

// // -------------------
// // MongoDB Connection
// // -------------------
// const mongoUrl = process.env.MONGO_URL || 'mongodb://mongodb:27017/annony-talk';

// mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(async () => {
//     console.log('✅ Connected to MongoDB');

//     // Define message schema
//     const messageSchema = new mongoose.Schema({
//       text: String,
//       sender: String,
//       time: String,
//     });

//     const Message = mongoose.model('Message', messageSchema);

//     // If DB is empty, insert first message
//     const count = await Message.estimatedDocumentCount();
//     if (count === 0) {
//       await Message.create({ text: "Welcome to AnnonyTalk!", sender: "System", time: new Date().toLocaleTimeString() });
//       console.log('📝 First message created — database now exists');
//     }

//     // Attach Message model to app for later use in Socket.IO
//     app.locals.Message = Message;
//   })
//   .catch(err => console.error('❌ MongoDB connection error:', err));

// // -------------------
// // Redis Adapter Setup
// // -------------------
// const pubClient = createClient({ url: process.env.REDIS_URL || 'redis://redis:6379' });
// const subClient = pubClient.duplicate();

// async function startSocket() {
//   await Promise.all([pubClient.connect(), subClient.connect()]);
//   io.adapter(createAdapter(pubClient, subClient));

//   io.on('connection', (socket) => {
//     const username = `Anon-${socket.id.substring(0, 4)}`;
//     console.log(`🟢 User connected: ${username}`);

//     // Listen for messages
//     socket.on('send_message', async (data) => {
//       const Message = app.locals.Message;

//       // Save message in MongoDB
//       if (Message) {
//         await Message.create({ text: data.text, sender: username, time: new Date().toLocaleTimeString() });
//       }

//       // Emit to all clients via Socket.IO (Redis ensures multi-instance)
//       io.emit('receive_message', {
//         text: data.text,
//         sender: username,
//         time: new Date().toLocaleTimeString()
//       });
//     });

//     socket.on('disconnect', () => {
//       console.log(`🔴 User disconnected: ${username}`);
//     });
//   });

//   const port = process.env.PORT || 3001;
//   httpServer.listen(port, () => console.log(`🚀 Chat Service running on port ${port}`));
// }

// // Start Socket.IO after Redis is ready
// startSocket().catch(console.error);


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
