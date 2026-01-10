const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" } 
});

const pubClient = createClient({ url: process.env.REDIS_URL || 'redis://redis:6379' });
const subClient = pubClient.duplicate();

async function start() {
  await Promise.all([pubClient.connect(), subClient.connect()]);
  io.adapter(createAdapter(pubClient, subClient));

  io.on('connection', (socket) => {
    const username = `Anon-${socket.id.substring(0, 4)}`;
    
    socket.on('send_message', (data) => {
      // io.emit ensures the message goes to EVERY instance via Redis
      io.emit('receive_message', {
        text: data.text,
        sender: username,
        time: new Date().toLocaleTimeString()
      });
    });
  });

  httpServer.listen(3001, () => console.log('🚀 Chat Service on 3001'));
}

start();