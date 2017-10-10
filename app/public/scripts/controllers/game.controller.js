myApp.controller('gameController', [
  '$scope',
  '$state',
  'tokenService',
  'socketService',
  function($scope, $state, tokenService, socketService) {
    socketService.connect();
    var token = tokenService.getToken();
    if (token) {
      socketService.emit('sendToken', token);
    } else {
      $state.go('login');
    }

    socketService.on('justOneGamer', function(data) {
      $scope.gameMessage = data.message;
      $scope.player1 = data.player1;
      $scope.player1Style = {
        color: data.color
      };
    });

    socketService.on('initGame', function(data) {
      $scope.player1 = data.player1;
      $scope.player1Style = {
        color: data.colorPlayer1
      };
      $scope.player2 = data.player2;
      $scope.player2Style = {
        color: data.colorPlayer2
      };
      $scope.gameMessage = data.message;
    });
    // this.onClick = function(event) {
    //   var canvas = event.currentTarget.getBoundingClientRect();

    //   socketService.emit('canvasClicked', {
    //     clientX: event.x - canvas.left,
    //     clientY: event.y - canvas.top
    //   });
    // };
    // socketService.on('allowedToPlay', function(data) {
    //   console.log(data);
    // });
  }
]);

// sending to sender-client only
// socket.emit('message', "this is a test");

// sending to all clients, include sender
// io.emit('message', "this is a test");

// sending to all clients except sender
// socket.broadcast.emit('message', "this is a test");

// sending to all clients in 'game' room(channel) except sender
// socket.broadcast.to('game').emit('message', 'nice game');

// sending to all clients in 'game' room(channel), include sender
// io.in('game').emit('message', 'cool game');

// sending to sender client, only if they are in 'game' room(channel)
// socket.to('game').emit('message', 'enjoy the game');

// sending to all clients in namespace 'myNamespace', include sender
// io.of('myNamespace').emit('message', 'gg');

// sending to individual socketid
// socket.broadcast.to(socketid).emit('message', 'for your eyes only');
