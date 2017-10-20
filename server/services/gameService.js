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
    fences: []
  };
  return games[id];
};

const getOrCreate = id => {
  return games[id] || createGame(id);
};

const computeSquares = function () {
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

module.exports = {
  getOrCreate
};