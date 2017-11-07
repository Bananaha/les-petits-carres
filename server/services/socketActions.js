const moment = require('moment');

const userService = require('./userService');
const roomService = require('./roomService');
const gameService = require('./gameService');
const socketAction = require('./socketActions');

const eventTypes = {
  sendToken: 'sendToken',
  canvasClicked: 'canvasClicked',
  disconnect: 'disconnect',
  deleteRoom: 'deleteRoom'
};

function attachDispatcher(socket, io) {
  // Initialise l'écoute des évenements sur chaque event pour la connection WS
  Object.values(eventTypes).forEach(eventType => {
    // on $event...
    socket.on(eventType, payload => {
      // ... appelle le dispatcher en lui passant l'event type et le payload
      dispatchSocketEvent(eventType, { payload, socket, io });
    });
  });
}

function dispatchSocketEvent(eventType, { payload, socket, io }) {
  switch (eventType) {
    case eventTypes.sendToken:
      return sendTokenFunction(payload, socket, io);
      breack;
    case eventTypes.canvasClicked:
      return canvasClickedFunction(payload, socket, io);
      breack;
    case eventTypes.disconnect:
      return disconnectFunction(socket, io);
      breack;
    case eventTypes.deleteRoom:
      return deleteRoomFunction(socket);
      breack;
  }
}

const sendTokenFunction = async (token, socket, io) => {
  const user = await userService.findById(token);
  const room = roomService.checkRoom(user);
  socket.join(room.id);
  const game = gameService.getOrCreate(room.id);
  socket.APP_roomId = room.id;
  socket.APP_user = user;

  const firstConnexionInfos = {
    player1: user.mail,
    scorePlayer1: user.score,
    message: "Patientez jusqu'à l'arrivée d'un joueur",
    avatarPlayer1: user.avatar
  };

  if (room.players.length < 2) {
    socket.emit('justOneGamer', firstConnexionInfos);
  } else {
    const beginner = gameService.firstToPlay(room, user);

    socket.emit('turn', {
      turn: user.turnToPlay
    });
    socket.broadcast.to(room.id).emit('turn', {
      turn: room.players[0].turnToPlay
    });

    const secondConnexionInfos = {
      coord: game.coord,
      squares: game.squares,
      player1: room.players[0].mail,
      scorePlayer1: room.players[0].score,
      avatarPlayer1: room.players[0].avatar,
      player2: user.mail,
      scorePlayer2: user.score,
      avatarPlayer2: user.avatar,
      message: beginner + ' commence à jouer'
    };

    io.to(room.id).emit('initGame', secondConnexionInfos);
  }
};

const canvasClickedFunction = (data, socket, io) => {
  const user = socket.APP_user;
  const room = roomService.findRoom(socket.APP_roomId);
  const game = gameService.getById(socket.APP_roomId);
  const fenceConfig = {};
  if (!user.turnToPlay) {
    return;
  } else {
    let squaresChanged;
    gameService.computeFence(game.coord, data, user, fenceConfig);

    if (Object.keys(fenceConfig).length === 0) {
      return;
    }
    // Si c'est le premier, on regarde quels sont les carrés dont il dépend et on modifie les carrés concernés en conséquence.
    if (game.fences.length === 0) {
      squaresChanged = gameService.assignFenceProps(
        fenceConfig,
        user,
        game.squares,
        game.fences
      );
    } else {
      // Si des traits ont déjà été ajoutés au tableau regroupant les traits valides, on regarde si les coordonnées du trait sont déjà prises.
      const fenceAlreadyDrawn = existingFence => {
        return (
          existingFence.x === fenceConfig.x &&
          existingFence.y === fenceConfig.y &&
          existingFence.w === fenceConfig.w &&
          existingFence.h === fenceConfig.h
        );
      };
      // Si les coordonnées sont prises, on n'enregistre pas le trait dans le tableau regroupant les traits déjà créés
      if (game.fences.find(fenceAlreadyDrawn)) {
        return;
      }
      //Sinon on ajoute le trait dans le tableau et vérifie la dépendence de ce trait avec les carrés.
      squaresChanged = gameService.assignFenceProps(
        fenceConfig,
        user,
        game.squares,
        game.fences
      );
    }
    let winSquares = 0;
    squaresChanged.forEach(square => {
      if (square.isComplete) {
        winSquares++;
      }
    });

    let message = '';
    // Si le joueur n'a pas reporté de carré, on autorise l'autre joueur a joué
    if (winSquares === 0) {
      gameService.togglePlayerTurn(room);
      io.to(socket.APP_roomId).emit('togglePlayerTurn');
      // Si le joueur a gagné un carré,
    } else {
      user.score += winSquares;

      if (room.players[1].score + room.players[0].score === 100) {
        gameService.saveScores(
          room.players[0],
          room.players[1],
          socket.APP_roomId
        );

        if (room.players[1].score > room.players[0].score) {
          message = room.players[1].mail + ' gagne la partie';
        } else {
          if (room.players[1].score === room.players[0].score) {
            message = 'Match nul';
          } else {
            message = room.players[0].mail + ' gagne la partie';
          }
        }
      }
    }

    const gameUpdateDatas = {
      fenceConfig,
      squaresChanged,
      scorePlayer1: room.players[0].score,
      scorePlayer2: room.players[1].score,
      message: message
    };

    io.to(socket.APP_roomId).emit('allowToPlay', gameUpdateDatas);
  }
};
const disconnectFunction = (socket, io) => {
  const user = socket.APP_user;
  const room = roomService.findRoom(socket.APP_roomId);
  const game = gameService.getById(socket.APP_roomId);
  if (!room) {
    socket.to(socket.APP_roomId).emit('disconnected');
    return;
  }
  if (room.players.length === 2) {
    socket.to(socket.APP_roomId).emit('disconnected', {
      message: 'Votre adversaire a quitté la partie.'
    });
  }
};

const deleteRoomFunction = socket => {
  console.log('in deleteRoomFunction');
  roomService.deleteRoom(socket.APP_roomId);
};

module.exports = {
  attachDispatcher
};
