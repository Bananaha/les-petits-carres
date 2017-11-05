const moment = require('moment');
const userService = require('./userService');

const GAME_SIZE = 500;
const SQUARE_SIZE = GAME_SIZE / 10;
const CLICK_TOLERANCE = 7;
const FENCE_SIZE = {
  longSide: 46,
  shortSide: 2
};

const games = {};

const createGame = id => {
  games[id] = {
    coord: computeCoord(),
    squares: computeSquares(),
    fences: [],
    startDate: moment()
  };
  return games[id];
};

const computeSquares = function() {
  const squares = [];
  let squareId = 0;
  for (let x = 0, len = GAME_SIZE; x < len; x += SQUARE_SIZE) {
    for (let y = 0, len = GAME_SIZE; y < len; y += SQUARE_SIZE) {
      var squareOrigin = {
        xPos: x,
        yPos: y,
        id: squareId
      };
      squares.push(squareOrigin);
      squareId++;
    }
  }
  return squares;
};

const computeCoord = () => {
  const coord = [];
  for (let x = 0, len = GAME_SIZE; x < len; x += SQUARE_SIZE) {
    coord.push(x);
  }
  coord.push(coord[coord.length - 1] + SQUARE_SIZE);
  return coord;
};

const getOrCreate = id => {
  return games[id] || createGame(id);
};

const getById = id => {
  return games[id];
};
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

const changeSquareProps = (square, targetProp, user, squares) => {
  square[targetProp] = user.mail;
  if (square.top && square.bottom && square.left && square.right) {
    square.isComplete = user.mail;
    square.color = user.color;
  }
  return square;
};

const findAttachedSquare = (fence, user, squares) => {
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

const saveScores = (user1, user2, id) => {
  // définit la durée de la partie
  const timeLapse = moment().diff(games[id].startDate, 'minutes');
  // définit le label selon la victoire ou la défaite du joueur
  if (user1.score > 50) {
    user1.partyStatus = 'win';
    user2.partyStatus = 'loose';
  } else {
    if (user1.score < 50) {
      user1.partyStatus = 'loose';
      user2.partyStatus = 'win';
    } else {
      user1.partyStatus = 'draw';
      user2.partyStatus = 'draw';
    }
  }

  const finalScores = [
    {
      mail: user1.mail,
      date: moment().format('DD/MM/YYYY HH:mm'),
      score: user1.score,
      status: user1.partyStatus,
      timeLapse: timeLapse + ' minutes'
    },
    {
      mail: user2.mail,
      date: moment().format('DD/MM/YYYY HH:mm'),
      score: user2.score,
      status: user2.partyStatus,
      timeLapse: timeLapse + ' minutes'
    }
  ];
  userService.updateScores(finalScores);
};

module.exports = {
  getOrCreate,
  random,
  firstToPlay,
  computeFence,
  assignFenceProps,
  togglePlayerTurn,
  changeSquareProps,
  findAttachedSquare,
  saveScores,
  getById
};
