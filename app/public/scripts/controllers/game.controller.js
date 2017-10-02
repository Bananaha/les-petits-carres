myApp.controller('gameController', [
  '$scope',
  '$http',
  '$state',
  'socketService',
  'gameService',
  function($scope, $http, $state, socketService, gameService) {
    gameService.sendToken();
  }
]);
