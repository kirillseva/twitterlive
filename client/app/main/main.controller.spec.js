'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('twitterliveApp'));

  var MainCtrl,
      scope,
      $httpBackend,
      $interval;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$httpBackend_, $controller, $rootScope) {
    $httpBackend = _$httpBackend_;
    angular.mock.inject(function (_$interval_) {
      $interval = _$interval_;
    });

    $httpBackend.expectGET('/api/words?count=10')
      .respond([
        {
          word: 'kirill',
          count: 10
        },
        {
          word: 'testing',
          count: 5
        }
      ]);

    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of things to the scope', function () {
    $interval.flush(11);
    expect(scope.words.length).toBe(0);
    $interval.flush(1100);
    expect(scope.words.length).toBe(0);
  });
});
