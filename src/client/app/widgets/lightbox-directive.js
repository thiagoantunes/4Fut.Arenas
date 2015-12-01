/*global $:false */
(function () {
    'use strict';

    angular
        .module('app.widgets')
        .directive('lightbox', lightbox);

    function lightbox () {
        return {
            restrict: 'C',
            link: function(scope, element) {
                element.lightGallery({
                    enableTouch: true
                });
            }
        };
    }
})();
