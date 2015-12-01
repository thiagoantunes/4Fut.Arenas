'use strict';

angular.module('app.core')
.filter('defaultImage', function() {
    return function (input, param) {
        if (!input) {
            return '/images/avatar_placeholder.jpg';
        }
        return input;
    };
});
