(function () {
    'use strict';

    angular
        .module('app.widgets')
        .directive('chosenResults', chosenResults);

    function chosenResults () {
        return {
            restrict: 'C',
            link: function(scope, element) {

                if (!$('html').hasClass('ismobile')) {
                    nicescrollService.niceScroll(element, 'rgba(0,0,0,0.3)', '5px');
                }
            }
        }
    }
})();
