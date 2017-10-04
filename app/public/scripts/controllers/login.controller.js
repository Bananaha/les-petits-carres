myApp.controller('loginController', [
  '$scope',
  '$state',
  'loginService',
  function($scope, $state, loginService) {
    this.onSubmit = function() {
      loginService
        .login($scope.mail, $scope.password)
        .then(function(res) {
          $state.go('game');
        })
        .catch(function(err) {
          console.log('controller fail', err);
          $scope.errorMessage = err.data;
        });
    };
  }
]);
