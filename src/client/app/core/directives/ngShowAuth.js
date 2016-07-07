
angular.module('app.core')
  .directive('ngShowAuth', ['$timeout', function ($timeout) {
      'use strict';

      return {
          restrict: 'A',
          link: function(scope, el) {
              el.addClass('ng-cloak'); // hide until we process it

              function update(user) {
                  // sometimes if ngCloak exists on same element, they argue, so make sure that
                  // this one always runs last for reliability
                  $timeout(function () {
                      el.toggleClass('ng-cloak', !user);
                  }, 0);
              }

              var auth = firebase.auth();
              auth.onAuthStateChanged(update);
          }
      };
  }]);
