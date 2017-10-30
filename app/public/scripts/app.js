var myApp = angular.module('app', ['ui.router']);

myApp.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/login');
  $stateProvider.state('game', {
    url: '/game',
    templateUrl: '/templates/game',
    controller: 'gameController as gameController'
  });
  $stateProvider.state('login', {
    url: '/login',
    templateUrl: '/templates/login',
    controller: 'loginController as loginController'
  });
  $stateProvider.state('scores', {
    url: '/scores',
    templateUrl: '/templates/scores',
    controller: 'scoresController as scoresController'
  });
});
