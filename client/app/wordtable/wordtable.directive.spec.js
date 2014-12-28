'use strict';

describe('Directive: wordtable', function () {

  // load the directive's module and view
  beforeEach(module('twitterliveApp'));
  beforeEach(module('app/wordtable/wordtable.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<wordtable></wordtable>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('WordCount');
  }));
});
