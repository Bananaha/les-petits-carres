myApp.factory('tokenService', [
  function() {
    function getToken() {
      // récupération du token du joueur
      return localStorage.getItem('token');
    }

    return {
      getToken: getToken
    };
  }
]);
