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
      $scope.avatarPlayer1 = data.avatarPlayer1;
    });

    socketService.on('initGame', function(data) {
      $scope.player1 = data.player1;
      $scope.avatarPlayer1 = data.avatarPlayer1;
      $scope.player2 = data.player2;
      $scope.avatarPlayer2 = data.avatarPlayer2;
      $scope.gameMessage = data.message;
    });

    socketService.on('allowToPlay', function(data) {
      $scope.scorePlayer1 = data.scorePlayer1;
      $scope.scorePlayer2 = data.scorePlayer2;
      $scope.gameMessage = data.message;
    });

    socketService.on('disconnected', function(data) {
      $scope.gameMessage = data.message;
    });
  }
]);
