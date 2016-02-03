/*global $:false */
(function () {
    'use strict';

    angular
        .module('app.widgets')
        .directive('lowerCase', lowerCase);

    function lowerCase () {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, modelCtrl) {
                var capitalize = function(inputValue) {
                    if (inputValue === undefined) {
                        inputValue = '';
                    }
                    var capitalized = inputValue.toLowerCase();
                    if (capitalized !== inputValue) {
                        modelCtrl.$setViewValue(capitalized);
                        modelCtrl.$render();
                    }
                    return capitalized;
                };
                modelCtrl.$parsers.push(capitalize);
                capitalize(scope[attrs.ngModel]);  // capitalize initial value
            }
        };
    }
})();
