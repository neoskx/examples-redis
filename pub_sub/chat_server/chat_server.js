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
    console.log('New client connected');

    redisSubscriber.subscribe('chat');

    socket.on('chat message', (msg) => {
      redisPublisher.publish('chat', msg);
    });

    redisSubscriber.on('message', (channel, message) => {
      socket.emit('chat message', message);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
}

module.exports = { initChatServer };
