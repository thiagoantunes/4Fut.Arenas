/*global $:false */
(function () {
    'use strict';

    angular
        .module('app.widgets')
        .directive('fgLine', fgLine);

    function fgLine () {
        return {
            restrict: 'C',
            link: function(scope, element) {
                if ($('.fg-line')[0]) {
                    $('html').on('focus', '.form-control', function() {
                        $(this).closest('.fg-line').addClass('fg-toggled');
                    });

                    $('html').on('blur', '.form-control', function() {
                        var p = $(this).closest('.form-group');
                        var i = p.find('.form-control').val();

                        if (p.hasClass('fg-float')) {
                            if (i.length === 0) {
                                $(this).closest('.fg-line').removeClass('fg-toggled');
                            }
                        }
                        else {
                            $(this).closest('.fg-line').removeClass('fg-toggled');
                        }
                    });
                }

            }
        };
    }
})();
