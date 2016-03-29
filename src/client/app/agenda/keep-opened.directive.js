/*global $:false */
/*global nicescrollService:false */
(function () {
    'use strict';

    angular
        .module('app.agenda')
        .directive('keepOpened', keepOpened);

    function keepOpened () {
        return {
            restrict: 'A',
            scope: {
                'keepOpened' : '='
            },
            link: function(scope, element) {
                element.on('click', function(e) {
                    scope.keepOpened.hide();
                    scope.keepOpened.show();
                });
            }
        };
    }
})();
