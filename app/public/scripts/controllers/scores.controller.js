myApp.controller('scoresController', [
  '$scope',
  '$state',
  'scoresService',
  function($scope, $state, scoresService) {
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

    $scope.displayUserScores = function(user) {
      $scope.userScores = scoresService.findScores(user, usersInformations);
    };

    $scope.setBadgeStyle = function(status) {
      return scoresService.toggleBadgeStyle(status);
    };

    $scope.computeScores();
  }
]);
