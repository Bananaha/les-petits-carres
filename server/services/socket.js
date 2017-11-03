// Modules
const moment = require('moment');

const userService = require('./userService');
const roomService = require('./roomService');
const gameService = require('./gameService');
const socketAction = require('./socketActions');

module.exports = io => {
  io.on('connection', socket => {
    console.log('ws connecté');
    socketAction.attachDispatcher(socket);
    let user, room, roomId, game;

    socket.on('sendToken', async token => {
      user = await userService.findById(token);
      room = roomService.checkRoom(user);
      roomId = room.id;
      socket.join(roomId);
      game = gameService.getOrCreate(roomId);

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
        socket.broadcast.to(roomId).emit('turn', {
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

        io.to(roomId).emit('initGame', secondConnexionInfos);
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
            gameService.saveScores(room.players[0], room.players[1], roomId);
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

        io.to(roomId).emit('allowToPlay', gameUpdateDatas);
      }
    });

    socket.on('disconnect', () => {
      console.log('user in disconnect', user);
      console.log('user.mail: ', user.mail, ' disconnected');
      // if (user && user.mail) userService.removeInMemoryUser(user.mail);
      if (!room) {
        socket.to(roomId).emit('disconnected');
        return;
      }
      if (room.players.length === 2) {
        socket.to(roomId).emit('disconnected', {
          message: 'Votre adversaire a quitté la partie.'
        });
      }
    });
  });
};
