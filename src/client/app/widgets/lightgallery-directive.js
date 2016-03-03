/*global Waves:false */
(function () {
    'use strict';

    angular
        .module('app.widgets')
        .directive('lightgallery', lightgallery);

    function lightgallery () {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                if (scope.$last) {
                    element.parent().lightGallery();
                }
            }
        };
    }
})();
