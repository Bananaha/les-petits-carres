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

// Functions
const random = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
const firstToPlay = (room, user) => {
  const firstToPlayRandom = random(0, 1);
  room.players.forEach((player, index) => {
    player.turnToPlay = firstToPlayRandom === index;
  });
  if (user.turnToPlay) {
    return user.mail;
  } else {
    return room.players[0].mail;
  }
};

const computeFence = (coord, clientData, client, fenceConfig) => {
  coord.forEach(function(xPos) {
    coord.forEach(function(yPos) {
      // trait vertical
      if (
        clientData.mousePosY > yPos - CLICK_TOLERANCE &&
        clientData.mousePosY < yPos + FENCE_SIZE.longSide &&
        clientData.mousePosX > xPos - CLICK_TOLERANCE &&
        clientData.mousePosX < xPos + CLICK_TOLERANCE
      ) {
        fenceConfig.y = yPos + FENCE_SIZE.shortSide;
        fenceConfig.x = xPos;
        fenceConfig.w = FENCE_SIZE.shortSide;
        fenceConfig.h = SQUARE_SIZE - FENCE_SIZE.shortSide;
        fenceConfig.owner = client.mail;
      }
      // trait horizontal
      if (
        clientData.mousePosY > yPos - CLICK_TOLERANCE &&
        clientData.mousePosY < yPos + CLICK_TOLERANCE &&
        clientData.mousePosX > xPos - CLICK_TOLERANCE &&
        clientData.mousePosX < xPos + FENCE_SIZE.longSide
      ) {
        fenceConfig.y = yPos;
        fenceConfig.x = xPos + FENCE_SIZE.shortSide;
        fenceConfig.w = SQUARE_SIZE - FENCE_SIZE.shortSide;
        fenceConfig.h = FENCE_SIZE.shortSide;
        fenceConfig.owner = client.mail;
      }
    });
  });
};

const assignFenceProps = (fence, user, squares, fences) => {
  fence.color = user.color;
  fences.push(fence);
  return findAttachedSquare(fence, user, squares);
};

const togglePlayerTurn = room => {
  room.players.forEach(player => {
    player.turnToPlay = !player.turnToPlay;
  });
};

const squareIsComplete = square =>
  square.top && square.bottom && square.left && square.right;

const changeSquareProps = (square, targetProp, user, squares) => {
  square[targetProp] = user.mail;
  if (squareIsComplete(square)) {
    square.isComplete = user.mail;
    square.color = user.color;
  }
  return square;
};

const findAttachedSquare = function(fence, user, squares) {
  let squareA, squareB;
  // trait horizontal
  //Si la hauteur du coté cliqué est également à fenceShortSide (petite hauteur), alors il s'agît d'un trait horizontal
  if (fence.h === FENCE_SIZE.shortSide) {
    // on recherche les carrés dont le trait tracé dépend pour enregistrer qu'il est cliqué
    for (let i = 0, len = squares.length; i < len; i++) {
      if (
        squares[i].xPos === fence.x - FENCE_SIZE.shortSide &&
        squares[i].yPos === fence.y
      ) {
        squareA = changeSquareProps(squares[i], 'top', user, squares);
      }
      if (
        squares[i].xPos === fence.x - FENCE_SIZE.shortSide &&
        squares[i].yPos === fence.y - SQUARE_SIZE
      ) {
        squareB = changeSquareProps(squares[i], 'bottom', user, squares);
      }
    }
  }

  // trait vertical
  //Si la hauteur du coté cliqué est également à intervalBetween - fenceShortSide (grande hauteur), alors il s'agît d'un trait vertical

  if (fence.h === SQUARE_SIZE - FENCE_SIZE.shortSide) {
    for (let i = 0, len = squares.length; i < len; i++) {
      // on recherche les carrés dont le trait tracé dépend pour enregistrer qu'il est cliqué

      if (
        squares[i].xPos === fence.x &&
        squares[i].yPos === fence.y - FENCE_SIZE.shortSide
      ) {
        squareA = changeSquareProps(squares[i], 'left', user, squares);
      }

      if (
        squares[i].xPos === fence.x - SQUARE_SIZE &&
        squares[i].yPos === fence.y - FENCE_SIZE.shortSide
      ) {
        squareB = changeSquareProps(squares[i], 'right', user, squares);
      }
    }
  }
  let attachedSquares = [];
  if (!squareA && squareB) {
    attachedSquares.push(squareB);
  }
  if (squareA && !squareB) {
    attachedSquares.push(squareA);
  }
  if (squareA && squareB) {
    attachedSquares.push(squareA, squareB);
  }
  return attachedSquares;
};

// Sockets
module.exports = io => {
  io.on('connection', socket => {
    console.log('ws connecté');

    let user, room, roomId, game, opponent;

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
        const beginner = firstToPlay(room, user);

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
        computeFence(game.coord, data, user, fenceConfig);

        if (Object.keys(fenceConfig).length === 0) {
          return;
        }
        // Si c'est le premier, on regarde quels sont les carrés dont il dépend et on modifie les carrés concernés en conséquence.
        if (game.fences.length === 0) {
          squaresChanged = assignFenceProps(
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
          squaresChanged = assignFenceProps(
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
          togglePlayerTurn(room);
          io.to(roomId).emit('togglePlayerTurn');
        } else {
          user.score += winSquares;

          if (room.players[1].score + room.players[0].score === 100) {
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
      socket.broadcast.to(roomId).emit('disconnected', {
        message: user.mail + ' a quitté la partie.'
      });
    });
  });
};
