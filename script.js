/// <reference path="typings/angularjs/angular.d.ts"/>

var chattyApp = angular.module('chattyApp', ['ngRoute', 'ngResource']);

chattyApp.config(function($routeProvider) {
  $routeProvider.when("/", {
    templateUrl: "pages/home.html",
    controller: "homeController"
  })
  .when("/day", {
    templateUrl: "pages/day.html",
    controller: "dayController"
  })
  .when("/shacker", {
    templateUrl: "pages/shacker.html",
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

chattyApp.factory("Day", function($resource) {
  return $resource("http://do.malcolmcrum.com:4567/day/:year/:month/:day");
});

chattyApp.controller('homeController', function($scope) {
  
});

chattyApp.controller('dayController', function($scope, Day) {
  var today = new Date();
  Day.get({ year: today.getFullYear(), month: today.getMonth(), day: today.getDay() }, function(data) {
    $scope.day = data;
  });
});

chattyApp.controller('shackerController', function($scope) {
  
});

chattyApp.controller('manageController', function($scope) {
  
});

chattyApp.controller('aboutController', function($scope) {
  
});