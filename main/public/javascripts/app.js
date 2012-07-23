'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives','ngSanitize'] ).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'partials/index',
        controller: IndexCtrl
      }).
      when('/addPost', {
        templateUrl: 'partials/addPost',
        controller: AddPostCtrl
      }).
      when('/readPost/:id', {
        templateUrl: 'partials/readPost',
        controller: ReadPostCtrl
      }).
      when('/editPost/:id', {
        templateUrl: 'partials/editPost',
        controller: EditPostCtrl
      }).
      when('/deletePost/:id', {
        templateUrl: 'partials/deletePost',
        controller: DeletePostCtrl
      }).
	  when('/map', {
        templateUrl: '/actu/map',
        controller: MapCtrl
      }).
	  when('/newActu', {
        templateUrl: '/actu/new',
        controller: NewActuCtrl
      }).
	  when('/actu', {
        templateUrl: '/actu/fils',
        controller: FilsCtrl
      }).
	  when('/user', {
        templateUrl: '/user/login',
        controller: UserCtrl
      }).
	  when('/login', {
        templateUrl: '/user/login',
        controller: UserCtrl
      }).
      otherwise({
        redirectTo: '/'
      });
    $locationProvider.html5Mode(true);
  }]);