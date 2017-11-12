myApp.controller('scoresController', [
  '$scope',
  '$state',
  'scoresService',
  'socketService',
  function($scope, $state, scoresService, socketService) {
    var usersInformations;

    $scope.computeScores = function() {
      scoresService
        .getScores()
        .then(function(res) {
          usersInformations = res;
          $scope.users = scoresService.extractUsers(usersInformations);
        })
        .catch(function(err) {
          console.log('pb in scoresController', err);
        });
    };
    // à la sélection d'un joueur, ses données sont affichées dans le tableau
    $scope.displayUserScores = function(user) {
      $scope.userScores = scoresService.findScores(user, usersInformations);
    };
    // change la class de l'élément badge en fonction de la valeur retournée par le serveur
    $scope.setBadgeStyle = function(status) {
      return scoresService.toggleBadgeStyle(status);
    };

    $scope.computeScores();
  }
]);
