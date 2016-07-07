(function() {
    'use strict';
    angular.module('firebase.auth', [])

    .factory('Auth', function() {
        return firebase.auth();
    });
})();
