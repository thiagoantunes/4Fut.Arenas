'use strict';

angular.module('app.core')
.filter('time', function() {
    return function (input, param) {
        if (!input) {
            return '';
        }
        return moment(input, 'HHmm').format('HH:mm');
    };
})

.filter('dow', function() {
    return function (input, param) {
        return moment(input , 'd').format('dddd');
    };
});
