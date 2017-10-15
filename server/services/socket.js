// Modules
const userService = require('./user');
const gameService = require('./game');

// Global variables
const GAME_SIZE = 500;
const SQUARE_SIZE = GAME_SIZE / 10;
const CLICK_TOLERANCE = 5;
const FENCE_SIZE = {
  longSide: 46,
  shortSide: 2
};
const coord = [];
const squares = [];
const fences = [];

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

const togglePlayerTurn = room => {
  room.players.forEach(player => {
    player.turnToPlay = !player.turnToPlay;
  });
};

const setGameVariables = function() {
  let squareId = 0;
  for (var x = 0; x < GAME_SIZE; x = x + SQUARE_SIZE) {
    coord.push(x);

    for (var y = 0; y < GAME_SIZE; y = y + SQUARE_SIZE) {
      var squareOrigin = {
        xPos: x,
        yPos: y,
        id: squareId
      };
      squares.push(squareOrigin);
      squareId++;
    }
  }
  coord.push(coord[coord.length - 1] + SQUARE_SIZE);
};

var findAttachedSquare = function(fence, user) {
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
        squares[i].fenceTop = user.mail;
        if (Object.keys(squares[i]).length === 7) {
          squares[i].isComplete = user.mail;
          squaresrs[i].color = user.color;
        }
        squareA = squares[i];
      }
      if (
        squares[i].xPos === fence.x - FENCE_SIZE.shortSide &&
        squares[i].yPos === fence.y - SQUARE_SIZE
      ) {
        squares[i].fenceBottom = user.mail;
        if (Object.keys(squares[i]).length === 7) {
          squares[i].isComplete = user.mail;
          squares[i].color = user.color;
        }
        squareB = squares[i];
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
        squares[i].fenceLeft = user.mail;
        if (Object.keys(squares[i]).length === 7) {
          squares[i].isComplete = user.mail;
          squares[i].color = user.color;
        }
        squareA = squares[i];
      }
      if (
        squares[i].xPos === fence.x - SQUARE_SIZE &&
        squares[i].yPos === fence.y - FENCE_SIZE.shortSide
      ) {
        squares[i].fenceRight = user.mail;
        if (Object.keys(squares[i]).length === 7) {
          squares[i].isComplete = user.mail;
          squares[i].color = user.color;
        }
        squareB = squares[i];
      }
    }
  }
  return [squareA, squareB];
};

// Sockets
module.exports = io => {
  io.on('connection', socket => {
    console.log('ws connecté');

    let user, room, roomId;

    socket.on('sendToken', token => {
      user = userService.findUser(token);
      room = gameService.checkRoom(user);
      roomId = room.id;
      socket.join(roomId);

      if (room.players.length < 2) {
        socket.emit('justOneGamer', {
          player1: user.mail,
          color: user.color,
          message: "Patientez jusqu'à l'arrivée d'un joueur"
        });
      } else {
        setGameVariables(coord, squares);

        io.to(roomId).emit('gameVariables', {
          coord,
          squares
        });

        const beginner = firstToPlay(room, user);

        io.to(roomId).emit('initGame', {
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
      console.log(user.turnToPlay);
      if (!user.turnToPlay) {
        console.log(user.mail, 'not your turn');
        return;
      } else {
        let squaresChanged;
        coord.forEach(function(xPos) {
          coord.forEach(function(yPos) {
            // trait vertical
            if (
              data.mousePosY > yPos - CLICK_TOLERANCE &&
              data.mousePosY < yPos + FENCE_SIZE.longSide &&
              data.mousePosX > xPos - CLICK_TOLERANCE &&
              data.mousePosX < xPos + CLICK_TOLERANCE
            ) {
              fenceConfig.y = yPos + FENCE_SIZE.shortSide;
              fenceConfig.x = xPos;
              fenceConfig.w = FENCE_SIZE.shortSide;
              fenceConfig.h = SQUARE_SIZE - FENCE_SIZE.shortSide;
              fenceConfig.owner = user.mail;
            }
            // trait horizontal
            if (
              data.mousePosY > yPos - CLICK_TOLERANCE &&
              data.mousePosY < yPos + CLICK_TOLERANCE &&
              data.mousePosX > xPos - CLICK_TOLERANCE &&
              data.mousePosX < xPos + FENCE_SIZE.longSide
            ) {
              fenceConfig.y = yPos;
              fenceConfig.x = xPos + FENCE_SIZE.shortSide;
              fenceConfig.w = SQUARE_SIZE - FENCE_SIZE.shortSide;
              fenceConfig.h = FENCE_SIZE.shortSide;
              fenceConfig.owner = user.mail;
            }
          });
        });

        if (Object.keys(fenceConfig).length === 0) {
          return;
        } else {
          // Si c'est le premier, on regarde quels sont les carrés dont il dépend et on modifie les carrés concernés en conséquence.
          if (fences.length === 0) {
            fenceConfig.color = user.color;
            fences.push(fenceConfig);
            squaresChanged = findAttachedSquare(fenceConfig, user);
          } else {
            // Si des traits ont déjà été ajoutés au tableau regroupant les traits valides, on regarde si les coordonnées du trait sont déjà prises.
            function fenceAlreadyDrawn(existingFence) {
              return (
                existingFence.x === fenceConfig.x &&
                existingFence.y === fenceConfig.y &&
                existingFence.w === fenceConfig.w &&
                existingFence.h === fenceConfig.h
              );
            }
            // Si les coordonnées sont prises, on n'enregistre pas le trait dans le tableau regroupant les traits déjà créés

            if (fences.find(fenceAlreadyDrawn)) {
              return;
            } else {
              //Sinon on ajoute le trait dans le tableau et vérifie la dépendence de ce trait avec les carrés.

              fenceConfig.color = user.color;
              fences.push(fenceConfig);
              squaresChanged = findAttachedSquare(fenceConfig, user);
            }
          }
        }
        let message;
        const squareIsComplete = squaresChanged.find(square => {
          return square.isComplete;
        });

        if (!squareIsComplete) {
          togglePlayerTurn(room);
        } else {
          user.score++;
          console.log(user);
          if (user.score + room.players[0].score === 100) {
            if (user.score > room.players[0].score) {
              message = user.mail + ' gagne la partie';
            } else {
              message = room.players[0].mail + ' gagne la partie';
            }
          }
        }

        console.log(user.mail, 'your turn');
        io.to(roomId).emit('allowToPlay', {
          fenceConfig,
          squaresChanged,
          message
        });
      }
    });
  });
};
