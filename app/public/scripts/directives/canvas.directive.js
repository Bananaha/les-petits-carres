myApp.directive('canvas', [
  'socketService',
  function(socketService) {
    return {
      restrict: 'A',
      link: function(scope, element) {
        var canvas = element[0];
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

        function Square(x, y) {
          var size = squareSize;
          this.context = context;
          this.xPos = x + fenceShortSide / 2;
          this.yPos = y + fenceShortSide / 2;
          this.height = size;
          this.width = size;
          this.fenceTop = false;
          this.fenceRight = false;
          this.fenceBottom = false;
          this.fenceLeft = false;

          this.win = function() {
            if (
              this.fenceTop &&
              this.fenceRight &&
              this.fenceBottom &&
              this.fenceLeft
            ) {
              this.color = 'purple';
            } else {
              this.color = 'yellow';
            }
          };

          this.render = function() {
            this.context.fillStyle = this.color;
            this.context.fillRect(this.xPos, this.yPos, size, this.height);
            this.win();
          };
        }

        function Fence(x, y, w, h, color) {
          this.context = context;
          this.height = h;
          this.width = w;
          this.xPos = x - fenceShortSide / 2;
          this.yPos = y - fenceShortSide / 2;

          this.render = function() {
            this.context.fillStyle = color;
            this.context.fillRect(
              this.xPos,
              this.yPos,
              this.width,
              this.height
            );
          };
        }

        var draw = function() {
          // Dessine les carrés
          context.clearRect(0, 0, 500, 500);
          squaresArray.forEach(square => {
            square.render();
          });

          // Dessine les traits s'ils existent
          fencesArray.forEach(fence => {
            fence.render();
          });
          requestAnimationFrame(draw);
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
          // trait vertical
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

        socketService.on('gameVariables', function(data) {
          coor = data.coord;
          var squares = data.squares;
          squares.forEach(function(square) {
            var newSquare = new Square(square.xPos, square.yPos);
            squaresArray.push(newSquare);
          });
        });

        canvas.addEventListener(
          'click',
          function(event) {
            //récupérer la position du click sur le canvas
            var rect = canvas.getBoundingClientRect();
            var mousePosX = event.clientX - rect.left;
            var mousePosY = event.clientY - rect.top;

            socketService.emit('canvasClicked', {
              mousePosX,
              mousePosY
            });
          },
          false
        );

        socketService.on('allowToPlay', function(data) {
          var fence = new Fence(
            data.fenceConfig.x,
            data.fenceConfig.y,
            data.fenceConfig.w,
            data.fenceConfig.h,
            data.fenceConfig.color
          );
          fencesArray.push(fence);
        });

        draw();
      }
    };
  }
]);
