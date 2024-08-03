const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

function initializeSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: 'https://niteshramola.in',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', async (socket) => {
    try {
      const token = socket.handshake.headers.cookie
        ?.split('; ')
        .find((c) => c.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        logger.log('Unauthorized attempt via socket', 'warn');
        return socket.disconnect(true);
      }

      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
          logger.log('Invalid token attempt via socket', 'warn');
          return socket.disconnect(true);
        }
        socket.user = user;
        logger.log(
          `User connected with socket: ${socket?.id} ${socket?.user?._id}`,
        );

        socket.join(socket?.user?._id);
      });

      socket.on('disconnect', () => {
        logger.log(
          `User disconnected with socket: ${socket?.id} ${socket?.user?._id}`,
        );
        socket.leave(socket?.user?._id);
      });
    } catch (error) {
      logger.log(`Error occurred in socket: ${error}`, 'error');
      socket.disconnect(true);
    }
  });
}

function getIo() {
  if (!io) {
    throw new Error('Socket.IO has not been initialized yet.');
  }
  return io;
}

function sendEvent(eventName, roomId, data = {}) {
  io.to(roomId).emit(eventName, { data });
  logger.log(`Event Name: '${eventName}' and roomId: '${roomId}'`);
}

module.exports = {
  initializeSocket,
  getIo,
  sendEvent,
};
