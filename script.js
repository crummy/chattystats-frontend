/// <reference path="typings/d3/d3.d.ts"/>
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

chattyApp.factory("Post", function($resource) {
  return $resource("http://do.malcolmcrum.com:4567/post/:id");
})

chattyApp.factory("Range", function($resource) {
  return $resource("http://do.malcolmcrum.com:4567/from/:startYear/:startMonth/:startDay/to/:endYear/:endMonth/:endDay");
})

chattyApp.directive("rangeVisualization", function() {
  var margin = { top: 40, right: 20, bottom: 60, left: 20};
  
  return {
    restrict: 'E',
    scope: {
      val: '='
    },
    link: function(scope, element, attrs) {
      var vis = d3.select(element[0])
        .append("svg")
        .attr("id", "monthGraph")
        .attr("height", "300px")
        .attr("width", "100%");
        
      scope.$watch('val', function(newVal, oldVal) {
        var width = document.getElementById("monthGraph").width.baseVal.value - margin.left - margin.right,
            height = document.getElementById("monthGraph").height.baseVal.value - margin.top - margin.bottom;
        
        vis.selectAll('*').remove();
        
        if (!newVal) return;
        
        var formattedVal = [];
        var i = 0;
        for (var day in newVal.days) {
          formattedVal.push({x: day, y: newVal.days[day], y0: 0});
          i++;
        }
        
        var days = formattedVal.length,
            data = d3.layout.stack()([formattedVal]);
            
        var maxY = d3.max(formattedVal, function(d) { return d.y }),
            x = function(d, i) { return margin.left + i * (width / days) },
            barWidth = function(d) { return (width / days) - width/500 },
            barHeight = function(d) { return d.y * height / maxY },
            y = function(d) { return margin.top + height - barHeight(d) };
          
        var layers = vis.selectAll("g.layer")
          .data(data)
          .enter().append("g")
            .style("fill", "blue")
            .attr("class", "layer");
            
        var tooltip = d3.select("svg")
          .append("text")
          .text("tooltip")
          .attr("class", "barlabel")
          .style("visibility", "hidden")
          .style("text-anchor", "middle")
          .attr("y", height + margin.top + 20);
        
        var bars = layers.selectAll("g.bar")
          .data(function(d) { return d; })
          .enter().append("rect")
            .attr("class", "bar")
            .attr("width", barWidth)
            .attr("x", x)
            .attr("y", height)
            .attr("height", 0)
            .on("mouseover", function(d) {
              d3.select(this).attr("fill", "green");
              tooltip.style("visibility", "visible")
                .attr("x", parseInt(d3.select(this).attr("x")) + parseInt(d3.select(this).attr("width")) /2)
                .text(d.x);
            })
            .on("mouseout", function() {
              d3.select(this).attr("fill", "");
              tooltip.style("visibility", "hidden");
            })
            .on("click", function(d) {
              scope.$parent.selectedDay = d.x;
              scope.$parent.$apply();
            })
          .transition()
            .delay(function(d, i) { return i * 10; })
            .attr("y", y)
            .attr("height", barHeight);
      })
    }
  }
});

chattyApp.controller('homeController', function($scope, Range, Day) {
  var today = new Date();
  var lastMonth = new Date(today.valueOf() - 24*60*60*1000 * 30);
  Range.get({startYear: lastMonth.getFullYear(), startMonth: lastMonth.getMonth()+1, startDay: lastMonth.getDate(),
    endYear: today.getFullYear(), endMonth: today.getMonth()+1, endDay: today.getDate() }, function(data) {
      $scope.monthPosts = data;
    });
    
  $scope.$watch('selectedDay', function (newDate) {
    var date = new Date(newDate);
    if (date.toString() != "Invalid Date") {
      loadDay(date.getFullYear(), date.getMonth()+1, date.getDate());
    }
  });
  
  function loadDay(y, m, d) {
    Day.get({ year: y, month: m, day: d }, function(data) {
      $scope.dayData = data;
    });
  }
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