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

    socketService.on('allowToPlay', function(data) {
      $scope.scorePlayer1 = data.scorePlayer1;
      $scope.scorePlayer2 = data.scorePlayer2;
      $scope.gameMessage = data.message;
    });

    socketService.on('disconnected', function(data) {
      console.log(data);
      $scope.gameMessage = data.message;
    });
  }
]);
