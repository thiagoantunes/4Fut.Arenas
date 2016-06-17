/*global $:false */
(function() {
    'use strict';

    angular
        .module('app.escolinhas')
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
        vm.editTurma = editTurma;
        vm.novaTurmaModal = $modal({
            scope: $scope,
            templateUrl: 'novaTurmaModal.html',
            animation:'am-fade-and-slide-top' ,
            show: false
        });

        activate();

        function activate() {
            cfpLoadingBar.start();
            reservasService.refTurmas().once('value', function(snapshot) {
                if (!snapshot.exists()) {
                    cfpLoadingBar.complete();
                    vm.emptyList = (vm.turmas.length === 0);
                }
                else {
                    loadMore();
                }
            });
        }

        function loadMore() {
            cfpLoadingBar.start();
            vm.turmas.scroll.next(10);
            vm.turmas.$watch(function(event) {
                vm.emptyList = (vm.turmas.length === 0);
                cfpLoadingBar.complete();
            });
        }

        function editTurma(escolinha) {
            vm.turmaSelecionada = escolinha;
            vm.novaTurmaModal.$promise.then(vm.novaTurmaModal.show);
        }

        function showEscolinhasForm() {
            vm.novaTurmaModal.$promise.then(vm.novaTurmaModal.show);
        }

        function hideModalForm() {
            vm.novaTurmaModal.$promise.then(vm.novaTurmaModal.hide);
        }
    }

})();