const uuidv4 = require('uuid/v4');

const players = [];

const LOGINMESSAGE = [
  'Aucun joueur en ligne',
  'Il y a un joueur en ligne',
  'Veuillez attendre la fin de la session pour jouer'
];

const random = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports = io => {
  io.on('connection', socket => {});
};

// console.log('new connection');
// socket.emit('connection');

// let currentPlayer;

// socket.on('assignToken', token => {
//   const matchingPlayer = players.find(player => {
//     return player.player.id === token;
//   });
//   if (matchingPlayer) {
//     console.log('assignToken');
//     currentPlayer = matchingPlayer.player;
//     matchingPlayer.socket = socket;
//     // console.log('curentPlayer', matchingPlayer.socket.id);
//     // console.log('players', players[0].socket.id);
//     // console.log('socket', socket.id);

//     // players.forEach(socket => {
//     //   console.log('in Players', socket.socket.id);
//     // });
//   } else {
//     socket.emit('forbiddenAccess');
//   }
// });

// io.emit('loginMessage', {
//   message: LOGINMESSAGE[players.length]
// });

// socket.on('newPlayer', data => {
//   if (players.length >= 2) {
//     socket.disconnect();
//     return;
//   }

//   currentPlayer = {
//     id: uuidv4(),
//     username: data.username,
//     password: data.password,
//     color: data.color,
//     turnToPlay: false
//   };

//   socket.emit('TOKEN', currentPlayer.id);

//   players.push({ player: currentPlayer, socket });

//   socket.broadcast.emit('loginMessage', {
//     message: LOGINMESSAGE[players.length]
//   });

//   if (players.length === 2) {
//     const firstToPlayRandom = random(0, 1);

//     players.forEach((player, index) => {
//       player.player.turnToPlay = firstToPlayRandom === index;
//     });

//     const firstToPlayMessage =
//       players[firstToPlayRandom].player.username + ' commence à jouer';

//     io.emit('firstToBegin', {
//       message: firstToPlayMessage
//     });

//     players.forEach(joueur => {
//       console.log('player turn');
//       joueur.socket.emit('playerTurn', {
//         id: joueur.player.id,
//         message: firstToPlayMessage
//       });
//     });
//   } else {
//     io.emit('firstToBegin', {
//       message: "Dans l'attente d'un autre joueur"
//     });
//   }
// });

// socket.on('mouseClicked', (data, currentPlayer) => {
//   let monTour;
//   if (currentPlayer.turnToPlay) {
//     monTour = true;
//   } else {
//     monTour = false;
//   }
//   socket.emit('TurnToPlay', { monTour });
// });
// });
// };

//client.emit => n'envoit rien
//io.emit => envoi à l'autre client
//client.broadcast.emit => envoi à l'autre client

// for (var i = 0; i < players.length; i++) {
//   console.log(players[i].client);
//   players[i].client.emit('initGame', {
//     message: firstToPlayMessage,
//     username: 'toto'
//   });
// }
// players.forEach(element => {
//   console.log(element.client);
//   var wsClient = element.client;
//   wsClient.emit('initGame', {
//     message: firstToPlayMessage,
//     username: element.player.username
//   });
// });
