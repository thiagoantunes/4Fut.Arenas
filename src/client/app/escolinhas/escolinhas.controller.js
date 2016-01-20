/*global $:false */
(function() {
    'use strict';

    angular
        .module('app.reservas')
        .controller('EscolinhasCtrl', EscolinhasCtrl);

    EscolinhasCtrl.$inject = [
        '$scope' ,
        '$modal',
        'reservasService'
    ];

    function EscolinhasCtrl($scope, $modal, reservasService) {
        var vm = this;
        vm.turmas = reservasService.getTurmas();
        vm.showEscolinhasForm = showEscolinhasForm;
        vm.hideModalForm = hideModalForm;
        vm.novaTurmaModal = $modal({
            scope: $scope,
            templateUrl: 'novaTurmaModal.html',
            animation:'am-fade-and-slide-top' ,
            show: false
        });

        activate();

        function activate() {

        }

        function showEscolinhasForm() {
            vm.novaTurmaModal.$promise.then(vm.novaTurmaModal.show);
        }

        function hideModalForm() {
            vm.novaTurmaModal.$promise.then(vm.novaTurmaModal.hide);
        }
    }

})();
