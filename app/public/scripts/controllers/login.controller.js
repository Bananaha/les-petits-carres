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
          console.log('res in login controller', res);
          if (res.token) {
            $state.go('game');
          } else {
            if (res === 'wrong credentials') {
              $scope.loginMessage =
                "Nom d'utilsateur/mot de passe incorrectes.";
              return;
            }
            if (res === 'user already in game') {
              $scope.loginMessage = 'Joueur déja connecté';
              return;
            } else {
              $scope.loginMessage = 'Connexion impossible';
              return;
            }
          }
        })
        .catch(function(err) {
          console.log('controller fail', err);
          $scope.errorMessage = err.data;
        });
    };
    this.seeScores = function() {
      $state.go('scores');
    };
  }
]);
