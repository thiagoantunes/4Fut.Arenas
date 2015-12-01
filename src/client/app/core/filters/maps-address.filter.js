'use strict';

angular.module('app.core')
.filter('mapsAddress', function() {
    return function (input, param) {
        if (!input) {
            return 'current';
        }
        return input;
    };
});
