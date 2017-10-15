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

        function Square(x, y, id) {
          var size = squareSize;
          this.id = id;
          this.context = context;
          this.xPos = x + fenceShortSide / 2;
          this.yPos = y + fenceShortSide / 2;
          this.height = size;
          this.width = size;
          this.fenceTop = false;
          this.fenceRight = false;
          this.fenceBottom = false;
          this.fenceLeft = false;
          this.isComplete = false;
          this.color = 'yellow';

          this.render = function() {
            this.context.fillStyle = this.color;
            this.context.fillRect(this.xPos, this.yPos, size, this.height);
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

        function updateSquare(serverSquares) {
          serverSquares.forEach(function(serverSquare) {
            var targetClientSquare = squaresArray.find(function(clientSquare) {
              return clientSquare.id === serverSquare.id;
            });
            if (targetClientSquare) {
              [
                'fenceTop',
                'fenceRight',
                'fenceBottom',
                'fenceLeft'
              ].forEach(function(fenceClicked) {
                if (targetClientSquare.hasOwnProperty(fenceClicked)) {
                  targetClientSquare[fenceClicked] = serverSquare[fenceClicked];
                }
              });
              if (serverSquare.isComplete) {
                targetClientSquare.isComplete = serverSquare.isComplete;
                targetClientSquare.color = serverSquare.color;
              }
            }
          });
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

        socketService.on('gameVariables', function(data) {
          coor = data.coord;
          var squares = data.squares;

          squares.forEach(function(square) {
            var newSquare = new Square(square.xPos, square.yPos, square.id);

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
          updateSquare(data.squaresChanged);
        });
        draw();
      }
    };
  }
]);
