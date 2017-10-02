var canvas = document.getElementById('canvas');
var gameMessage = document.getElementById('game-message');
var context = canvas.getContext('2d');

canvas.height = 500;
canvas.width = 500;

var squaresArray = [];
var fencesArray = [];
var coor = [];
var username;

var intervalBetween = 50;
var fenceShortSide = 2;
var squareSize = intervalBetween - fenceShortSide;

var draw = function() {
  // Dessine les carrés
  context.clearRect(0, 0, 500, 500);
  squaresArray.forEach(element => {
    element.render();
  });

  // Dessine les traits s'ils existent
  fencesArray.forEach(element => {
    element.render();
  });
  requestAnimationFrame(draw);
};

var createGameZone = function() {
  //Peuple 2 tableaux :
  for (var i = 0; i < canvas.width / intervalBetween; i++) {
    // L'un des coordonnées du jeu (origine (x/y) des carrés)
    coor.push(i * intervalBetween);

    for (var j = 0; j < canvas.height / intervalBetween; j++) {
      // L'autre des carrés générés pour créer la plateau de jeu, .
      var square = new Square(i * intervalBetween, j * intervalBetween);
      squaresArray.push(square);
    }
  }

  // rajoute la dernière coordonnée du plateau qui n'est pas générée par la boucle
  coor.push(coor[coor.length - 1] + intervalBetween);
};

var findAttachedSquare = function(fence) {
  // trait horizontal
  //Si la hauteur du coté cliqué est également à fenceShortSide (petite hauteur), alors il s'agît d'un trait horizontal
  if (fence.height === fenceShortSide) {
    // on recherche les carrés dont le trait tracé dépend pour enregistrer qu'il est cliqué
    squaresArray.forEach(function(square) {
      if (
        square.xPos === fence.xPos &&
        square.yPos === fence.yPos + fenceShortSide
      ) {
        square.fenceTop = true;
      }
      if (
        square.xPos === fence.xPos &&
        square.yPos === fence.yPos + fenceShortSide - intervalBetween
      ) {
        square.fenceBottom = true;
      }
    });
  }
  // trait verticale
  //Si la hauteur du coté cliqué est également à intervalBetween - fenceShortSide (grande hauteur), alors il s'agît d'un trait vertical
  if (fence.height === intervalBetween - fenceShortSide) {
    squaresArray.forEach(function(square) {
      // on recherche les carrés dont le trait tracé dépend pour enregistrer qu'il est cliqué
      if (
        square.xPos === fence.xPos + fenceShortSide &&
        square.yPos === fence.yPos
      ) {
        square.fenceLeft = true;
      }
      if (
        square.xPos === fence.xPos + fenceShortSide - intervalBetween &&
        square.yPos === fence.yPos
      ) {
        square.fenceRight = true;
      }
    });
  }
};

window.addEventListener('DOMContentLoaded', function() {
  var token = localStorage.getItem('token');

  if (!token) {
    window.location = 'http://' + HOST + ':' + PORT;
    return;
  }
  socket.on('connection', function() {
    console.log('connection');
    socket.emit('assignToken', token);
  });
  socket.on('forbiddenAccess', function(data) {
    window.location = 'http://' + HOST + ':' + PORT;
  });
  socket.on('playerTurn', function(data) {
    console.log(data);
    gameMessage.innerHTML = data.message;
  });

  createGameZone();

  canvas.addEventListener(
    'click',
    function(event) {
      //récupérer la position du click sur le canvas
      var rect = canvas.getBoundingClientRect();
      socket.emit('mouseClicked', {
        clientX: event.clientX - rect.left,
        clientY: event.clientY - rect.top
      });
      socket.on('TurnToPlay', function(data) {
        console.log(data);
      });
      var mousePosX = event.clientX - rect.left;
      var mousePosY = event.clientY - rect.top;

      var x, y, w, h, color, fence;

      // Zone de tolérance du click. Le click n'a pas a intervenir sur la coordonnée même.
      var tolerance = 5;
      // Longeur du carré sans les traits
      var longLenght = 46;

      coor.forEach(function(xPos) {
        coor.forEach(function(yPos) {
          //Si le click intervient à une coordonnée donnée incluant une zone de tolérance, un trait est créé.
          if (
            mousePosY > yPos - tolerance &&
            mousePosY < yPos + longLenght &&
            mousePosX > xPos - tolerance &&
            mousePosX < xPos + tolerance
          ) {
            y = yPos + fenceShortSide;
            x = xPos;
            w = fenceShortSide;
            h = squareSize;
            color = 'red';
            fence = new Fence(x, y, w, h, color);
          }
          if (
            mousePosY > yPos - tolerance &&
            mousePosY < yPos + tolerance &&
            mousePosX > xPos - tolerance &&
            mousePosX < xPos + longLenght
          ) {
            y = yPos;
            x = xPos + fenceShortSide;
            w = squareSize;
            h = fenceShortSide;
            color = 'blue';
            fence = new Fence(x, y, w, h, color);
          }
        });
      });

      // Si aucun trait n'a été ajouté au tableau regroupant les traits valides, on n'enregistre pas le trait dans le tableau.
      if (!fence) {
        return;
      } else {
        // Si c'est le premier, on regarde quels sont les carrés dont il dépend et on modifie les carrés concernés en conséquence.
        if (fencesArray.length === 0) {
          fencesArray.push(fence);
          findAttachedSquare(fence);
        } else {
          // Si des traits ont déjà été ajoutés au tableau regroupant les traits valides, on regarde si les coordonnées du trait sont déjà prises.
          function fenceAlreadyDrawn(existingFence) {
            return (
              existingFence.xPos === fence.xPos &&
              existingFence.xPos === fence.xPos &&
              existingFence.width === fence.width &&
              existingFence.height === fence.height &&
              existingFence.yPos === fence.yPos
            );
          }
          // Si les coordonnées sont prises, on n'enregistre pas le trait dans le tableau regroupant les traits déjà créés
          if (fencesArray.find(fenceAlreadyDrawn)) {
            return;
          } else {
            //Sinon on ajoute le trait dans le tableau et vérifie la dépendence de ce trait avec les carrés.
            fencesArray.push(fence);
            findAttachedSquare(fence);
          }
        }
      }
    },
    false
  );

  draw();
});
