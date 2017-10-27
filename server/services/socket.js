// Modules
const userService = require('./userService');
const roomService = require('./roomService');
const gameService = require('./gameService');

// Global variables
const GAME_SIZE = 500;
const SQUARE_SIZE = GAME_SIZE / 10;
const CLICK_TOLERANCE = 7;
const FENCE_SIZE = {
  longSide: 46,
  shortSide: 2
};

module.exports = io => {
  io.on('connection', socket => {
    console.log('ws connecté');

    let user, room, roomId, game;

    socket.on('sendToken', token => {
      user = userService.findUser(token);
      room = roomService.checkRoom(user);
      roomId = room.id;
      socket.join(roomId);
      game = gameService.getOrCreate(roomId);

      if (room.players.length < 2) {
        socket.emit('justOneGamer', {
          player1: user.mail,
          color: user.color,
          message: "Patientez jusqu'à l'arrivée d'un joueur"
        });
      } else {
        const beginner = gameService.firstToPlay(room, user);

        socket.emit('turn', {
          turn: user.turnToPlay
        });
        socket.broadcast.to(roomId).emit('turn', {
          turn: room.players[0].turnToPlay
        });

        io.to(roomId).emit('initGame', {
          coord: game.coord,
          squares: game.squares,
          player1: room.players[0].mail,
          colorPlayer1: room.players[0].color,
          scorePlayer1: room.players[0].score,
          player2: user.mail,
          colorPlayer2: user.color,
          scorePlayer2: user.score,
          message: beginner + ' commence à jouer'
        });
      }
    });

    socket.on('canvasClicked', data => {
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
        if (winSquares === 0) {
          gameService.togglePlayerTurn(room);
          io.to(roomId).emit('togglePlayerTurn');
        } else {
          user.score += winSquares;

          if (room.players[1].score + room.players[0].score === 100) {
            gameService.saveScores(room.players[0], room.players[1]);
            if (room.players[1].score > room.players[0].score) {
              message = room.players[1].mail + ' gagne la partie';
            } else {
              message = room.players[0].mail + ' gagne la partie';
            }
          }
        }
        io.to(roomId).emit('allowToPlay', {
          fenceConfig,
          squaresChanged,
          scorePlayer1: room.players[0].score,
          scorePlayer2: room.players[1].score,
          message: message
        });
      }
    });
    socket.on('disconnect', () => {
      if (room.players.length === 2) {
        io.broadcast.to(roomId).emit('disconnected', {
          message: 'Votre adversaire a quitté la partie.'
        });
      }
    });
  });
};
