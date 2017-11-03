myApp.factory('scoresService', [
  '$http',
  function($http) {
    function getScores() {
      return $http
        .post('/api/scores')
        .then(function(res) {
          return res.data;
        })
        .catch(function() {
          console.log('erreur dans la requete des scores');
        });
    }
    function extractUsers(usersInformations) {
      var users = [];
      usersInformations.forEach(function(userInformations) {
        users.push(userInformations.mail);
      });
      return users;
    }

    function findScores(user, usersInformations) {
      var infos;
      usersInformations.forEach(function(userInformation) {
        if (userInformation.mail === user) {
          infos = userInformation.scores;
        }
      });
      return infos;
    }

    function toggleBadgeStyle(playerStatus) {
      switch (playerStatus) {
        case 'win':
          return 'badge-success';
          break;
        case 'loose':
          return 'badge-danger';
          break;
        case 'draw':
          return 'badge-warning';
          break;
        default:
          return 'badge-info';
          break;
      }
    }

    return {
      getScores: getScores,
      extractUsers: extractUsers,
      findScores: findScores,
      toggleBadgeStyle: toggleBadgeStyle
    };
  }
]);
