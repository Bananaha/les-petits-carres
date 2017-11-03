myApp.factory('loginService', [
  '$http',
  function($http) {
    function login(mail, password, avatar) {
      return $http
        .post('/api/login', {
          mail: mail,
          password: password,
          avatar: avatar
        })
        .then(function(res) {
          localStorage.setItem('token', res.data.token);
          return res.data;
        })
        .catch(function(error) {
          console.log('wrong credentials', error);
          return error.data;
        });
    }

    return {
      login: login
    };
  }
]);
