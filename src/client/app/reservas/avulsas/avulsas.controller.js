/*global $:false */
(function() {
    'use strict';

    angular
        .module('app.reservas')
        .controller('AvulsasCtrl', AvulsasCtrl);

    AvulsasCtrl.$inject = [
        '$scope' ,
        '$modal',
        'reservasService',
        'cfpLoadingBar'
    ];

    function AvulsasCtrl($scope, $modal, reservasService, cfpLoadingBar) {
        var vm = this;
        vm.reservas = reservasService.getAvulsar();
        vm.showModalForm = showModalForm;
        vm.hideModalForm = hideModalForm;
        vm.loadMore = loadMore;
        vm.emptyList = false;
        vm.novaReservaModal = $modal({
            scope: $scope,
            templateUrl: 'novaReservaModal.html',
            animation:'am-fade-and-slide-top' ,
            show: false
        });

        activate();

        function activate() {
            loadMore();
        }

        function loadMore() {
            cfpLoadingBar.start();
            vm.reservas.scroll.next(10);
            vm.reservas.$watch(function(event) {
                if (vm.reservas.length === 0) {
                    vm.emptyList = true;
                }
                cfpLoadingBar.complete();
            });
        }

        function showModalForm() {
            vm.novaReservaModal.$promise.then(vm.novaReservaModal.show);
        }

        function hideModalForm() {
            vm.novaReservaModal.$promise.then(vm.novaReservaModal.hide);
        }
    }

})();