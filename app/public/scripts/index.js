var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

canvas.height = 500;
canvas.width = 500;

var squaresArray = [];
var fencesArray = [];
var coor = [];

var intervalBetween = 50;
var fenceShortSide = 2;
var squareSize = intervalBetween - fenceShortSide;

(function(window, io) {
  window.addEventListener("DOMContentLoaded", function() {
    var socket = io("http://localhost:8888");
    var draw = function() {
      context.clearRect(0, 0, 500, 500);
      squaresArray.forEach(element => {
        element.render();
      });
      fencesArray.forEach(element => {
        element.render();
      });
      requestAnimationFrame(draw);
    };

    var getMousePos = function(canvas, event) {
      var rect = canvas.getBoundingClientRect();
      return {
        x: event.clientX,
        y: event.clientY
      };
      socket.emit("mouseClicked", {
        clientX: event.clientX - rect.left,
        clientY: event.clientY - rect.top
      });
    };
    var createSquares = function() {
      for (var i = 0; i < canvas.width / intervalBetween; i++) {
        coor.push(i * intervalBetween);
        for (var j = 0; j < canvas.height / intervalBetween; j++) {
          var square = new Square(i * intervalBetween, j * intervalBetween);
          squaresArray.push(square);
        }
      }
      coor.push(coor[coor.length - 1] + intervalBetween);
      console.log(coor);
    };
    var findAttachedSquare = function(fence) {
      // trait horizontal
      //Si la hauteur du coté cliqué est également à fenceShortSide (petite hauteur), alors il s'agît d'un trait horizontal
      if (fence.height === fenceShortSide) {

        // on recherche les carrés dont le trait tracé dépend pour enregistrer qu'il est cliqué
        squaresArray.forEach(function(element) {
          if (
            element.xPos === fence.xPos &&
            element.yPos === fence.yPos + fenceShortSide
          ) {
            element.fenceTop = true;
          }
          if (
            element.xPos === fence.xPos &&
            element.yPos === fence.yPos + fenceShortSide - intervalBetween
          ) {
            element.fenceBottom = true;
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

    createSquares();

    canvas.addEventListener(
      "click",
      function(event) {
        var mousePos = getMousePos(canvas, event);
        var x, y, w, h, color, fence;
        var tolerance = 5;
        var longLenght = 46;

        coor.forEach(function(xPos) {
          coor.forEach(function(yPos) {
            if (
              mousePos.y > yPos - tolerance &&
              mousePos.y < yPos + longLenght &&
              mousePos.x > xPos - tolerance &&
              mousePos.x < xPos + tolerance
            ) {
              y = yPos + fenceShortSide;
              x = xPos;
              w = fenceShortSide;
              h = squareSize;
              color = "red";
              fence = new Fence(x, y, w, h, color);
            }
            if (
              mousePos.y > yPos - tolerance &&
              mousePos.y < yPos + tolerance &&
              mousePos.x > xPos - tolerance &&
              mousePos.x < xPos + longLenght
            ) {
              y = yPos;
              x = xPos + fenceShortSide;
              w = squareSize;
              h = fenceShortSide;
              color = "blue";
              fence = new Fence(x, y, w, h, color);
            }
          });
        });
        if (!fence) {
          return;
        } else {
          if (fencesArray.length === 0) {
            // io.emmit('newFence', fence)
            fencesArray.push(fence);
            findAttachedSquare(fence);
          } else {
            function alreadySaved(element) {
              return (
                element.xPos === fence.xPos &&
                element.xPos === fence.xPos &&
                element.width === fence.width &&
                element.height === fence.height &&
                element.yPos === fence.yPos
              );
            }

            if (fencesArray.find(alreadySaved)) {
              return;
            } else {
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
})(window, io);
