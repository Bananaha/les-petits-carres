myApp.controller('gameController', [
  '$scope',
  '$state',
  'tokenService',
  'socketService',
  function($scope, $state, tokenService, socketService) {
    $scope.player1ColorStyle, $scope.player2ColorStyle;

    socketService.connect();
    var token = tokenService.getToken();
    // dans le cas où l'utilisateur se connecte directement à l'url **/game
    if (token) {
      // si un token est enregistré dans le local storage, on vérifie que le token est valide
      socketService.emit('sendToken', token);
    } else {
      // si l'utilisateur n'a pas de token ou que celui-ci n'est pas valide, il est redirigé vers la page de login
      $state.go('login');
    }
    // lorsque le premier jour entre dans la room de jeu, on affiche son mail, l'avatar choisi, la couleur du jour, et un message
    socketService.on('justOneGamer', function(data) {
      $scope.gameMessage = data.message;
      $scope.player1 = data.player1;
      $scope.player1ColorStyle = {
        color: data.color
      };
      $scope.avatarPlayer1 = data.avatarPlayer1;
    });
    // lorsque le deuxième joueur se connecte à la room, on affiche le nom des deux joueurs, leur score initial, leur avatar, et le mail du joueur commençant à jouer
    socketService.on('initGame', function(data) {
      $scope.player1 = data.player1;
      $scope.avatarPlayer1 = data.avatarPlayer1;
      $scope.scorePlayer1 = 0;
      $scope.scorePlayer2 = 0;
      $scope.player2 = data.player2;
      $scope.avatarPlayer2 = data.avatarPlayer2;
      $scope.gameMessage = data.message;
    });
    // dès que le joueur autorisé à jouer fait un click valide, on affiche les scores à jour et le nom du joueur pouvant jouer.
    socketService.on('allowToPlay', function(data) {
      $scope.scorePlayer1 = data.scorePlayer1;
      $scope.scorePlayer2 = data.scorePlayer2;
      $scope.gameMessage = data.message;
    });
    // si l'un des deux joueurs se déconnecte, on en informe le joueur restant.
    socketService.on('disconnected', function(data) {
      $scope.gameMessage = data.message;
    });
  }
]);
