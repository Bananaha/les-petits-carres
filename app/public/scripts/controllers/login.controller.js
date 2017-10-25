myApp.controller('loginController', [
  '$scope',
  '$state',
  'loginService',
  function($scope, $state, loginService) {
    $scope.avatarsList = [
      'elephant',
      'giraffe',
      'hippo',
      'monkey',
      'panda',
      'parrot'
    ];
    $scope.selectedAvatar;
    this.onSubmit = function() {
      loginService
        .login($scope.mail, $scope.password, $scope.selectedAvatar)
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
