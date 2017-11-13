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
  let user;
  if (socket.APP_user) {
    user = socket.APP_user;
  } else {
    user = await userService.findById(token);
  }
  if (!user) {
    socket.disconnect();
    return;
  }
  userService.connect(user.id);

  const room = roomService.checkRoom(user);
  user = room.players.find(player => player.id === user.id);
  if (!socket.APP_user) {
    socket.APP_user = user;
  }
  socket.join(room.id);
  const game = gameService.getOrCreate(room.id);
  socket.APP_roomId = room.id;

  const firstConnexionInfos = {
    player1: user.mail,
    scorePlayer1: user.score,
    message: "Patientez jusqu'à l'arrivée d'un joueur",
    avatarPlayer1: user.avatar
  };

  if (room.players.length < 2) {
    socket.emit('justOneGamer', firstConnexionInfos);
    return;
  }
  let message;
  let playingUser;

  socket.APP_opponent = userService.findOpponent(socket.APP_user.id);

  const secondConnexionInfos = {
    coord: game.coord,
    squares: game.squares,
    player2: socket.APP_opponent.mail,
    scorePlayer2: socket.APP_opponent.score,
    avatarPlayer2: socket.APP_opponent.avatar,
    player1: socket.APP_user.mail,
    scorePlayer1: socket.APP_user.score,
    avatarPlayer1: socket.APP_user.avatar
  };

  if (!game.initialized) {
    playingUser = gameService.firstToPlay(room, user);
    game.playingUser = playingUser.id;
    message = playingUser.mail + ' commence à jouer';

    socket.broadcast.to(room.id).emit('turn', {
      turn: socket.APP_opponent.turnToPlay
    });
    socket.broadcast
      .to(room.id)
      .emit(
        'initGame',
        gameService.computeStartedGameData(game, socket, message, false)
      );
    socket.emit(
      'initGame',
      gameService.computeStartedGameData(game, socket, message, true)
    );
  } else {
    socket.APP_user.turnToPlay = game.playingUser === user.id;
    const playingUserMail = socket.APP_user.turnToPlay
      ? user.mail
      : socket.APP_opponent.mail;
    message = "C'est à " + playingUserMail + ' de jouer';
    socket.emit(
      'initGame',
      gameService.computeStartedGameData(game, socket, message, true)
    );
  }

  game.initialized = true;
  socket.emit('turn', {
    turn: socket.APP_user.turnToPlay
  });
  socket.emit('setGame', {
    fences: game.fences,
    squares: game.squares
  });
};

const canvasClickedFunction = (data, socket, io) => {
  const user = socket.APP_user;
  const room = roomService.findRoom(socket.APP_roomId);
  const game = gameService.getById(socket.APP_roomId);

  socket.APP_opponent = userService.findOpponent(socket.APP_user.id);
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
      game.playingUser = socket.APP_opponent.id;
      message = `C'est à ${socket.APP_opponent.mail} de jouer`;
      // Si le joueur a gagné un carré,
    } else {
      user.score += winSquares;
      message = `C'est toujours à ${socket.APP_user.mail} de jouer`;

      if (socket.APP_user.score + socket.APP_opponent.score === 100) {
        gameService.saveScores(
          socket.APP_opponent,
          socket.APP_user,
          socket.APP_roomId
        );

        if (socket.APP_user.score === socket.APP_opponent.score) {
          message = 'Match nul';
        } else {
          message =
            (socket.APP_user.score > socket.APP_opponent.score
              ? socket.APP_user.mail
              : socket.APP_opponent.mail) + ' gagne la partie';
        }

        io.to(socket.APP_roomId).emit('turn', {
          turn: false
        });
        deleteRoomFunction(socket);
      }
    }

    const gameUpdateDatas = {
      fenceConfig,
      squaresChanged,
      message
    };

    socket.emit(
      'allowToPlay',
      Object.assign(
        {
          scorePlayer1: socket.APP_user.score,
          scorePlayer2: socket.APP_opponent.score
        },
        gameUpdateDatas
      )
    );

    socket.broadcast.to(socket.APP_roomId).emit(
      'allowToPlay',
      Object.assign(
        {
          scorePlayer1: socket.APP_opponent.score,
          scorePlayer2: socket.APP_user.score
        },
        gameUpdateDatas
      )
    );
  }
};
const disconnectFunction = (socket, io) => {
  const user = socket.APP_user;
  if (!user || !user.id) {
    return;
  }

  const room = roomService.findRoom(socket.APP_roomId);
  const game = gameService.getById(socket.APP_roomId);
  userService.disconnect(user.id);

  socket.to(socket.APP_roomId).emit('disconnected', {
    message: 'Votre adversaire a quitté la partie.'
  });
};

const deleteRoomFunction = socket => {
  console.log('coucou');
  roomService.deleteRoom(socket.APP_roomId);
  gameService.deleteGame(socket.APP_roomId);
};

module.exports = {
  attachDispatcher
};
