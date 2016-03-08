/*global $:false */
(function () {
    'use strict';

    angular
        .module('app.widgets')
        .directive('ngConfirmClick', ngConfirmClick);

    function ngConfirmClick () {
        return {
            link: function (scope, element, attr) {
                var msg = attr.ngConfirmClick || 'Deseja exclluir o registro selecionado?';
                var clickAction = attr.confirmedClick;
                element.bind('click', function (event) {
                    if (window.confirm(msg)) {
                        scope.$eval(clickAction);
                    }
                });
            }
        };
    }
})();
