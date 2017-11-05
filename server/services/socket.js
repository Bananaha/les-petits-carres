const socketAction = require('./socketActions');

module.exports = io => {
  io.on('connection', socket => {
    console.log('ws connecté');
    socketAction.attachDispatcher(socket, io);
  });
};
