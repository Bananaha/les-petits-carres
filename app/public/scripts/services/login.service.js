myApp.factory('loginService', [
  '$http',
  function($http) {
    function login(mail, password) {
      return $http
        .post('/api/login', {
          mail: mail,
          password: password
        })
        .then(function(res, req) {
          localStorage.setItem('token', res.data.token);
        })
        .catch(function() {
          console.log("erreur dans l'ajout du token");
        });
    }

    return {
      login: login
    };
  }
]);
