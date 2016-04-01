(function() {
    'use strict';

    angular
    .module('app.arena')
    .controller('QuadraCtrl', QuadraCtrl);

    QuadraCtrl.$inject = ['quadraService', '$modal', 'logger'];

    function QuadraCtrl(quadraService, $modal, logger) {
        var vm = this;

        vm.listaVazia = false;
        vm.quadras = quadraService.getQuadrasArena();
        vm.originalRow = {};
        vm.openPrecosModal = openPrecosModal;
        vm.salvarNovaQuadra = salvarNovaQuadra;
        vm.excluirQuadra = excluirQuadra;
        vm.cores = [
            'bgm-teal',
            'bgm-red',
            'bgm-bluegray',
            'bgm-pink',
            'bgm-blue',
            'bgm-lime',
            'bgm-cyan',
            'bgm-orange',
            'bgm-purple',
            'bgm-brown',
            'bgm-amber',
            ];

        activate();

        function activate() {
            vm.quadras.$loaded()
            .then(function(q) {
                if (vm.quadras.length === 0) {
                    vm.listaVazia = true;
                }
            })
            .catch(function(error) {
                logger.error('Error:', error);
            });

            vm.quadras.$watch(function(event) {
                vm.listaVazia = (vm.quadras.length === 0);
            });
        }

        function salvarNovaQuadra() {
            if (vm.edicao) {
                vm.quadras.$save(vm.novaQuadra);
            }
            else {
                vm.novaQuadra.fkArena = true;
                vm.quadras.$add(vm.novaQuadra);
            }
        }

        function openPrecosModal(q) {
            $modal({
                controllerAs: 'vm',
                controller: 'PrecosCtrl',
                templateUrl: 'app/arena/quadras/precos/precos.html',
                resolve: {
                    quadra: function() {
                        return {
                            id: q.$id,
                            color: q.color
                        };
                    }
                }
            });
        }

        function excluirQuadra(q) {
            quadraService.remove(q.$id);
        }
    }

})();
