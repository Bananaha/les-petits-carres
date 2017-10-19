// Modules
const userService = require('./user');
const roomService = require('./room');
const gameService = require('./gameService');

// Global variables
const GAME_SIZE = 500;
const SQUARE_SIZE = GAME_SIZE / 10;
const CLICK_TOLERANCE = 5;
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
  console.log(fenceConfig);
};

const assignFenceProps = (fence, user, squares, fences) => {
  fence.color = user.color;
  fences.push(fence);
  squaresChanged = findAttachedSquare(fence, user, squares);
};

const togglePlayerTurn = room => {
  room.players.forEach(player => {
    player.turnToPlay = !player.turnToPlay;
  });
};

const changeSquareProps = (square, prop, user, squares) => {
  square.prop = user.mail;
  if (Object.keys(squares).length === 7) {
    square.isComplete = user.mail;
    square.color = user.color;
  }
};

const findAttachedSquare = function(fence, user, squares) {
  let squareA, squareB;
  console.log('in findAttachedSquare');
  // trait horizontal
  //Si la hauteur du coté cliqué est également à fenceShortSide (petite hauteur), alors il s'agît d'un trait horizontal
  console.log('first condition', FENCE_SIZE.shortSide, '===', fence.h);
  if (fence.h === FENCE_SIZE.shortSide) {
    // on recherche les carrés dont le trait tracé dépend pour enregistrer qu'il est cliqué
    for (let i = 0, len = squares.length; i < len; i++) {
      if (
        squares[i].xPos === fence.x - FENCE_SIZE.shortSide &&
        squares[i].yPos === fence.y
      ) {
        squareA = changeSquareProps(squares[i], 'top', user);
      }
      if (
        squares[i].xPos === fence.x - FENCE_SIZE.shortSide &&
        squares[i].yPos === fence.y - SQUARE_SIZE
      ) {
        squareB = changeSquareProps(squares[i], 'bottom', user);
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
        squareA = changeSquareProps(squares[i], 'left', user);
      }

      if (
        squares[i].xPos === fence.x - SQUARE_SIZE &&
        squares[i].yPos === fence.y - FENCE_SIZE.shortSide
      ) {
        squareB = changeSquareProps(squares[i], 'right', user);
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
  console.log(attachedSquares);
  return attachedSquares;
};

// Sockets
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
        io.to(roomId).emit('gameVariables', {
          coord: game.coord,
          squares: game.squares
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
      if (!user.turnToPlay) {
        console.log(user.mail, ' not you');
        return;
      } else {
        console.log(user.mail, ' you');
        let squaresChanged;
        computeFence(game.coord, data, user, fenceConfig);

        if (Object.keys(fenceConfig).length === 0) {
          return;
        }
        console.log('fenceConfig set', fenceConfig);
        // Si c'est le premier, on regarde quels sont les carrés dont il dépend et on modifie les carrés concernés en conséquence.
        if (game.fences.length === 0) {
          assignFenceProps(fenceConfig, user, game.squares, game.fences);
        }
        // else {
        //   // Si des traits ont déjà été ajoutés au tableau regroupant les traits valides, on regarde si les coordonnées du trait sont déjà prises.
        //   function fenceAlreadyDrawn(existingFence) {
        //     return (
        //       existingFence.x === fenceConfig.x &&
        //       existingFence.y === fenceConfig.y &&
        //       existingFence.w === fenceConfig.w &&
        //       existingFence.h === fenceConfig.h
        //     );
        //   }
        //   // Si les coordonnées sont prises, on n'enregistre pas le trait dans le tableau regroupant les traits déjà créés
        //   console.log(game.fences.find(fenceAlreadyDrawn));
        //   if (game.fences.find(fenceAlreadyDrawn)) {
        //     console.log('2nd fence');
        //     return;
        //   }
        //   //Sinon on ajoute le trait dans le tableau et vérifie la dépendence de ce trait avec les carrés.
        //   assignFenceProps(fenceConfig, user, game.squares);
        // }
        // let message;
        // const squareIsComplete = squaresChanged.find(square => {
        //   return square.isComplete;
        // });

        // if (!squareIsComplete) {
        //   togglePlayerTurn(room);
        // } else {
        //   user.score++;
        //   if (user.score + room.players[0].score === 100) {
        //     if (user.score > room.players[0].score) {
        //       message = user.mail + ' gagne la partie';
        //     } else {
        //       message = room.players[0].mail + ' gagne la partie';
        //     }
        //   }
        // }
        // io.to(roomId).emit('allowToPlay', {
        //   fenceConfig,
        //   squaresChanged
        // });
      }
    });
  });
};
