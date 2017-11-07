myApp.controller('loginController', [
  '$scope',
  '$state',
  'loginService',
  'tokenService',
  function($scope, $state, loginService, tokenService) {
    $scope.avatarsList = [
      'elephant',
      'giraffe',
      'hippo',
      'monkey',
      'panda',
      'parrot'
    ];

    $scope.selectedAvatar;
    var userToken = tokenService.getToken();
    if (userToken) {
      var toto = tokenService.checkToken(userToken);
      if (toto !== undefined) {
        $state.go('game');
        return;
      }
    }

    this.onSubmit = function() {
      loginService
        .login($scope.mail, $scope.password, $scope.selectedAvatar)
        .then(function(res) {
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
          console.log('login_controller fail', err);
          $scope.errorMessage = err.data;
        });
    };
  }
]);
