'use strict';

angular.module('twitterliveApp')
  .directive('wordtable', function () {
    return {
      scope: {
        data: '='
      },
      templateUrl: 'app/wordtable/wordtable.html',
      restrict: 'EA'
    };
  });
