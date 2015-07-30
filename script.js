/// <reference path="typings/angularjs/angular.d.ts"/>

var chattyApp = angular.module('chattyApp', ['ngRoute', 'ngResource', 'ui.bootstrap']);

chattyApp.config(function($routeProvider) {
  $routeProvider.when("/", {
    templateUrl: "pages/home.html",
    controller: "homeController"
  })
  .when("/day", {
    templateUrl: "pages/day.html",
    controller: "dayController"
  })
  .when("/day/:year/:month/:day", {
    templateUrl: "pages/day.html",
    controller: "dayController"
  })
  .when("/shackers", {
    templateUrl: "pages/shacker.html",
    controller: "shackerController"
  })
  .when("/shackers/:name", {
    tempateUrl: "pages/shacker.html",
    controller: "shackerController"
  })
  .when("/manage", {
    templateUrl: "pages/manage.html",
    controller: "manageController"
  })
  .when("/about", {
    templateUrl: "pages/about.html",
    controller: "aboutController"
  })
});

chattyApp.factory("Alerts", function() {
  return [];
});

chattyApp.factory("Day", function($resource) {
  return $resource("http://do.malcolmcrum.com:4567/day/:year/:month/:day");
});

chattyApp.factory("Shacker", function($resource) {
  return $resource("http://do.malcolmcrum.com:4567/shacker/:name");
});

chattyApp.controller('homeController', function($scope) {
  
});

chattyApp.controller('dayController', function($scope, Day, Alerts, $routeParams) {
  var day;
  var today = new Date();
  if ($routeParams.year && $routeParams.month && $routeParams.day) {
    day = new Date($routeParams.year, $routeParams.month, $routeParams.day);
    if (day > today) {
      Alerts.push({type: "danger", msg: "Requested date is in the future"});
    }
  } else {
    day = today;
  }
  Day.get({ year: day.getFullYear(), month: day.getMonth(), day: day.getDate() }, function(data) {
    var yesterday = new Date(day.valueOf() - 24*60*60*1000);
    $scope.prevYear = yesterday.getFullYear();
    $scope.prevMonth = yesterday.getMonth();
    $scope.prevDay = yesterday.getDate();
    
    var tomorrow = new Date(day.valueOf() + 24*60*60*1000);
    $scope.nextYear = tomorrow.getFullYear();
    $scope.nextMonth = tomorrow.getMonth();
    $scope.nextDay = tomorrow.getDate();
    
    $scope.totalPosts = data.totalPosts;
    $scope.totalRootPosts = data.totalRootPosts;
    $scope.topShackers = data.topAuthors;
  });
  $scope.date = day;
});

chattyApp.controller('shackerController', function($scope, Shacker, $routeParams) {
  
});

chattyApp.controller('manageController', function($scope) {
  
});

chattyApp.controller('aboutController', function($scope) {
  
});

chattyApp.controller('alertController', function ($scope, Alerts) {
  $scope.alerts = Alerts;

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };
  
  $scope.addAlert = function() {
    $scope.alerts.push({msg: 'Another alert!'});
  };
});