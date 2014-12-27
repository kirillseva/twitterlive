'use strict';

angular.module('twitterliveApp')
  .controller('MainCtrl', function ($scope, $http, $interval) {
    var count = 10;

    $scope.words = [];

    $scope.xFunction = function(){
      return function(d) {
        return d.word;
      };
    };

    $scope.yFunction = function(){
      return function(d) {
        return d.count;
      };
    };

    var promise = $interval(function() {
      $http.get('/api/words?count='+count).success(function(words) {
        $scope.words = words;
      });
    }, 1000);

    // Cancel interval on page changes
    $scope.$on('$destroy', function(){
      if (angular.isDefined(promise)) {
        $interval.cancel(promise);
        promise = undefined;
      }
    });
  });
