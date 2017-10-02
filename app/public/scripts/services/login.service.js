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
        });
    }
    function getToken() {
      console.log(localStorage.getItem('token'));
      return localStorage.getItem('token');
    }
    function syncToken() {
      return $http.post('/api/game', {
        token: getToken()
      });
    }

    return {
      login: login
    };
  }
]);
