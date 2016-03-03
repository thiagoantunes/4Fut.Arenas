/*global $:false */
(function() {
    'use strict';

    angular
        .module('app.reservas')
        .controller('MensalistasCtrl', MensalistasCtrl);

    MensalistasCtrl.$inject = [
        '$scope' ,
        '$modal',
        'reservasService',
        'cfpLoadingBar'
    ];

    function MensalistasCtrl($scope, $modal, reservasService, cfpLoadingBar) {
        var vm = this;
        vm.mensalistas = reservasService.getMensalistas();
        vm.showModalForm = showModalForm;
        vm.hideModalForm = hideModalForm;
        vm.loadMore = loadMore;
        vm.novaTurmaModal = $modal({
            scope: $scope,
            templateUrl: 'novoMensalistaModal.html',
            animation:'am-fade-and-slide-top' ,
            show: false
        });

        activate();

        function activate() {
            cfpLoadingBar.start();
            reservasService.refMensalistas().once('value', function(snapshot) {
                if (!snapshot.exists()) {
                    cfpLoadingBar.complete();
                    vm.emptyList = true;
                }
                else {
                    loadMore();
                }
            });
        }

        function loadMore() {
            vm.mensalistas.scroll.next(10);
            vm.mensalistas.$watch(function(event) {
                vm.emptyList = (vm.mensalistas.length === 0);
                cfpLoadingBar.complete();
            });
        }

        function showModalForm() {
            vm.novaTurmaModal.$promise.then(vm.novaTurmaModal.show);
        }

        function hideModalForm() {
            vm.novaTurmaModal.$promise.then(vm.novaTurmaModal.hide);
        }
    }

})();

