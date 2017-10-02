var myApp = angular.module('app', ['ui.router']);

myApp.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/login');
  $stateProvider.state('settings', {
    url: '/settings',
    templateUrl: '/templates/settings',
    controller: 'settingsController as settingsController'
  });
  $stateProvider.state('login', {
    url: '/login',
    templateUrl: '/templates/login',
    controller: 'loginController as loginController'
  });
});
