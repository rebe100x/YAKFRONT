'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.when('/map', {templateUrl: 'map', controller: MyCtrl1});
    $routeProvider.when('/actu', {templateUrl: 'actu', controller: MyCtrl2});
	$routeProvider.when('/info', {templateUrl: 'partials/info', controller: infoCtrl});
    $routeProvider.otherwise({redirectTo: '/map'});
    $locationProvider.html5Mode(true);
  }]);