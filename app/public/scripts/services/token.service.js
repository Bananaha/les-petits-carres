myApp.factory('tokenService', [
  function() {
    function getToken() {
      // récupération du token du joueur
      return localStorage.getItem('token');
    }
    function syncToken() {
      return $http.post('/api/game', {
        token: getToken()
      });
    }
    return {
      syncToken: syncToken
    };
  }
]);
