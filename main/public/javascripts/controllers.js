'use strict';

/* Controllers */

function IndexCtrl($scope, $http) {
  $http.get('/api/posts').
    success(function(data, status, headers, config) {
      $scope.posts = data.posts;
    });
}

function AddPostCtrl($scope, $http, $location) {
  $scope.form = {};
  $scope.submitPost = function () {
    $http.post('/api/post', $scope.form).
      success(function(data) {
        $location.path('/');
      });
  };
}

function ReadPostCtrl($scope, $http, $routeParams) {
  $http.get('/api/post/' + $routeParams.id).
    success(function(data) {
      $scope.post = data.post;
    });
}

function EditPostCtrl($scope, $http, $location, $routeParams) {
  $scope.form = {};
  $http.get('/api/post/' + $routeParams.id).
    success(function(data) {
      $scope.form = data.post;
    });

  $scope.editPost = function () {
    $http.put('/api/post/' + $routeParams.id, $scope.form).
      success(function(data) {
        $location.url('/readPost/' + $routeParams.id);
      });
  };
}

function DeletePostCtrl($scope, $http, $location, $routeParams) {
  $http.get('/api/post/' + $routeParams.id).
    success(function(data) {
      $scope.post = data.post;
    });

  $scope.deletePost = function () {
    $http.delete('/api/post/' + $routeParams.id).
      success(function(data) {
        $location.url('/');
      });
  };

  $scope.home = function () {
    $location.url('/');
  };
}


function MapCtrl($scope, $http, $location, $routeParams) {
 /*$http.get('/api/infos').
    success(function(data, status, headers, config) {
      $scope.infos = data.info;
    });*/ 
}

function NewActuCtrl($scope, $http, $location, $routeParams) {
 /*$http.get('/api/infos').
    success(function(data, status, headers, config) {
      $scope.infos = data.info;
    });*/ 
	console.log('new actu');
}


function FilsCtrl($scope, $http, $location, $routeParams) {
 $http.get('/api/infos').
    success(function(data, status, headers, config) {
      $scope.infos = data.info;
    }); 
}





function UserCtrl($scope, $http, $location, $routeParams) {
  $scope.form = {};
  console.log('e');
   $scope.login = function () {
   console.log('login');
    $http.post('/api/users', $scope.form).
      success(function(data) {
	  console.log($scope.form);
	  //if($scope.form)
        //$location.url('/readPost/' + $routeParams.id);
      });
  };
  
}