const games = {};

const initGame = (id, gameSize, squareSize) => {
  games[id] = {
    coord: computeSquares(gameSize, squareSize),
    squares: computeSquares(gameSize, squareSize),
    fences: []
  };
};

const computeSquares = function(gameSize, squareSize) {
  const squares = [];
  let squareId = 0;
  for (let x = 0, len = gameSize; x < len; x += squareSize) {
    for (let y = 0, len = gameSize; y < len; y += squareSize) {
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

const computeCoord = (gameSize, squareSize) => {
  const coord = [];
  for (let x = 0, len = gameSize; x < len; x += squareSize) {
    coord.push(x);
  }
  coord.push(coord[coord.length - 1] + SQUARE_SIZE);
  return coord;
};

module.exports = {
  initGame
};
