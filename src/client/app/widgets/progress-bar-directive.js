(function () {
    'use strict';

    angular
    .module('app.widgets')
    .directive('progressbar', progressbar);

    function progressbar () {
        return {
            restrict: 'A',
            scope: {
                total: '=',
                current: '='
            },
            link: function (scope, element) {

                scope.$watch('current', function (value) {
                    element.css('width', scope.current / scope.total * 100 + '%');
                });
                scope.$watch('total', function (value) {
                    element.css('width', scope.current / scope.total * 100 + '%');
                });
            }
        };
    }
})();
