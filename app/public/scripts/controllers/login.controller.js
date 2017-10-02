myApp.controller('loginController', [
  '$scope',
  '$state',
  'loginService',
  function($scope, $state, loginService) {
    this.onSubmit = function() {
      loginService
        .login($scope.mail, $scope.password)
        .then(function(res) {
          $state.go('settings');
        })
        .catch(function(err) {
          console.log('controller fail', err);
          $scope.errorMessage = err.data;
        });
    };
  }
]);
// si la connection dès le serveur, regarder si on peut rejoindre une partie sinon en créer un, renvoyer l'id du joueur et de la partie
