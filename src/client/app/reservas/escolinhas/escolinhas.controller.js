/*global $:false */
(function() {
    'use strict';

    angular
        .module('app.reservas')
        .controller('EscolinhasCtrl', EscolinhasCtrl);

    EscolinhasCtrl.$inject = [
        '$scope' ,
        '$modal',
        'reservasService',
        'cfpLoadingBar'
    ];

    function EscolinhasCtrl($scope, $modal, reservasService, cfpLoadingBar) {
        var vm = this;
        vm.turmas = reservasService.getTurmas();
        vm.showEscolinhasForm = showEscolinhasForm;
        vm.hideModalForm = hideModalForm;
        vm.loadMore = loadMore;
        vm.novaTurmaModal = $modal({
            scope: $scope,
            templateUrl: 'novaTurmaModal.html',
            animation:'am-fade-and-slide-top' ,
            show: false
        });

        activate();

        function activate() {
            loadMore();
        }

        function loadMore() {
            cfpLoadingBar.start();
            vm.turmas.scroll.next(10);
            vm.turmas.$watch(function(event) {
                if (vm.turmas.length === 0) {
                    vm.emptyList = true;
                }
                cfpLoadingBar.complete();
            });
        }

        function showEscolinhasForm() {
            vm.novaTurmaModal.$promise.then(vm.novaTurmaModal.show);
        }

        function hideModalForm() {
            vm.novaTurmaModal.$promise.then(vm.novaTurmaModal.hide);
        }
    }

})();
