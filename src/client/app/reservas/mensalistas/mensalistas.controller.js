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
        vm.emptyList = false;
        vm.novaTurmaModal = $modal({
            scope: $scope,
            templateUrl: 'novoMensalistaModal.html',
            animation:'am-fade-and-slide-top' ,
            show: false
        });

        activate();

        function activate() {
            loadMore();
        }

        function loadMore() {
            cfpLoadingBar.start();
            vm.mensalistas.scroll.next(10);
            vm.mensalistas.$watch(function(event) {
                if (vm.mensalistas.length === 0) {
                    vm.emptyList = true;
                }
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

