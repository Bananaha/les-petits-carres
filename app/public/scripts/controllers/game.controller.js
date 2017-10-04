myApp.controller('gameController', [
  '$scope',
  '$state',
  'gameService',
  'tokenService',
  'socketService',
  function($scope, $state, gameService, tokenService, socketService) {
    const clientToken = tokenService.getToken().then(function(res) {
      $scope;
    });

    socketService.emit('syncToken', {
      token: clientToken
    });
    socketService.on('tokenConfirmed', function(data) {
      $scope.player1 = data.player1;
      $scope.player2 = data.player2;
      $scope.gameMessage = data.message;
    });
    socketService.on('tokenNotFound', function(data) {
      $scope.gameMessage = data.message;
      $state.go('login');
    });
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
