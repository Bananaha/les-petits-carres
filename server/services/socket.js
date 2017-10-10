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
const fenceConfig = {};

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

const setGameVariables = function(coord, squares) {
  for (var x = 0; x < GAME_SIZE; x = x + SQUARE_SIZE) {
    coord.push(x);

    for (var y = 0; y < GAME_SIZE; y = y + SQUARE_SIZE) {
      var squareOrigin = {
        xPos: x,
        yPos: y
      };
      squares.push(squareOrigin);
    }
  }
  coord.push(coord[coord.length - 1] + SQUARE_SIZE);
};

var findAttachedSquare = function(fenceConfig) {
  // trait horizontal
  //Si la hauteur du coté cliqué est également à fenceShortSide (petite hauteur), alors il s'agît d'un trait horizontal
  if (fenceConfig.h === FENCE_SIZE.shortSide) {
    console.log('trait H');
    // on recherche les carrés dont le trait tracé dépend pour enregistrer qu'il est cliqué
    squares.forEach(square => {
      if (
        square.xPos === fenceConfig.x &&
        square.yPos === fenceConfig.y + FENCE_SIZE.shortSide
      ) {
        square.fenceTop = true;
      }
      if (
        square.xPos === fenceConfig.x &&
        square.yPos === fenceConfig.y + FENCE_SIZE.shortSide - SQUARE_SIZE
      ) {
        square.fenceBottom = true;
      }
    });
  }
  // trait vertical
  //Si la hauteur du coté cliqué est également à intervalBetween - fenceShortSide (grande hauteur), alors il s'agît d'un trait vertical
  if (fenceConfig.h === SQUARE_SIZE - FENCE_SIZE.shortSide) {
    squares.forEach(function(square) {
      // on recherche les carrés dont le trait tracé dépend pour enregistrer qu'il est cliqué
      if (
        square.xPos === fenceConfig.x + FENCE_SIZE.shortSide &&
        square.yPos === fenceConfig.y
      ) {
        square.fenceLeft = true;
      }
      if (
        square.xPos === fenceConfig.x + FENCE_SIZE.shortSide - SQUARE_SIZE &&
        square.yPos === fenceConfig.y
      ) {
        square.fenceRight = true;
      }
    });
  }
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

        // togglePlayerTurn(room);

        io.to(roomId).emit('initGame', {
          player1: room.players[0].mail,
          colorPlayer1: room.players[0].color,
          player2: user.mail,
          colorPlayer2: user.color,
          message: beginner + ' commence à jouer'
        });
      }
    });

    socket.on('canvasClicked', data => {
      console.log(user.turnToPlay);
      if (!user.turnToPlay) {
        console.log(user.mail, 'not your turn');
        return;
      } else {
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
              fenceConfig.owner = user.id;
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
              fenceConfig.owner = user.id;
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
            findAttachedSquare(fenceConfig);
          } else {
            // Si des traits ont déjà été ajoutés au tableau regroupant les traits valides, on regarde si les coordonnées du trait sont déjà prises.

            function fenceAlreadyDrawn(existingFence) {
              return (
                existingFence.x === fenceConfig.x &&
                existingFence.y === fenceConfig.x &&
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
              findAttachedSquare(fenceConfig);
            }
          }
        }
        console.log(user.mail, 'your turn');
        togglePlayerTurn(room);
        io.to(roomId).emit('allowToPlay', {
          fenceConfig
        });
      }
    });
  });
};
