const socketAction = require('./socketActions');

module.exports = io => {
  io.on('connection', socket => {
    socketAction.attachDispatcher(socket, io);
  });
};
