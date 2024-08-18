const socketIo = require('socket.io');
const Redis = require('ioredis');

function initChatServer(server) {
  const io = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });
  const redisPublisher = new Redis();
  const redisSubscriber = new Redis();

  io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    // Join a chat group
    socket.on('join group', (group) => {
      console.log(`${socket.id} joined group ${group}`);
      socket.join(group);
    });

    // Handle group messages
    socket.on('group message', ({ group, message }) => {
      console.log(`[group:${group}]: ${message}`);
      redisPublisher.publish(group, JSON.stringify({ sender: socket.id, message }));
    });

    // Handle peer-to-peer messages
    socket.on('private message', ({ recipient, message }) => {
      console.log(`[private: ${recipient}]: ${message}`);
      io.to(recipient).emit('private message', { sender: socket.id, message });
    });

    // Listen for messages from Redis and broadcast to the appropriate group
    redisSubscriber.on('message', (channel, message) => {
      const parsedMessage = JSON.parse(message);
      io.to(channel).emit('group message', parsedMessage);
    });

    // Subscribe to group channels dynamically
    socket.on('subscribe group', (group) => {
      redisSubscriber.subscribe(group);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

module.exports = { initChatServer };
