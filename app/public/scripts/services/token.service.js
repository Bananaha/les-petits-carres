myApp.factory('tokenService', [
  '$http',
  function($http) {
    function getToken() {
      // récupération du token du joueur
      return localStorage.getItem('token');
    }

    function checkToken(token) {
      return $http
        .post('api/login/checkToken', {
          token: token
        })
        .then(function(res) {
          return res.data;
        })
        .catch(function(error) {
          return error.data;
        });
    }

    return {
      getToken: getToken,
      checkToken: checkToken
    };
  }
]);
