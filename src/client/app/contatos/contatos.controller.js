(function() {
    'use strict';

    angular
    .module('app.contatos')
    .controller('ContatosCtrl', ContatosCtrl);

    ContatosCtrl.$inject = ['$scope', 'contatosService', 'logger', 'cfpLoadingBar', '$modal'];

    function ContatosCtrl($scope , contatosService, logger, cfpLoadingBar, $modal) {
        var vm = this;
        vm.contatos = contatosService.getContatosArena();
        vm.salvarContato = salvarContato;
        vm.hideNovoContatoModal = hideNovoContatoModal;
        vm.excluirContato = excluirContato;
        vm.showEditContatoModal = showEditContatoModal;
        vm.showNovoContatoModal = showNovoContatoModal;

        activate();

        function activate() {
            vm.novoContatoModal = $modal({
                scope: $scope,
                templateUrl: 'app/contatos/novo-contato.html',
                animation:'am-fade-and-slide-top' ,
                show: false,
                container: 'body',
                backdrop : 'static'
            });

            cfpLoadingBar.start();

            contatosService.refContatos().once('value', function(snapshot) {
                if (!snapshot.exists()) {
                    cfpLoadingBar.complete();
                    vm.emptyList = (vm.contatos.length === 0);
                }
            });

            vm.contatos.$watch(function(event) {
                vm.emptyList = (vm.contatos.length === 0);
                cfpLoadingBar.complete();
            });
        }

        function salvarContato() {
            if (vm.contatoSelecionado.$id) {
                if (vm.contatoSelecionado.dataNascimento) {
                    vm.contatoSelecionado.dataNascimento = vm.contatoSelecionado.dataNascimento.getTime();
                }
                vm.contatos.$save(vm.contatoSelecionado);
                logger.success('Contato editado com sucesso!');
                hideNovoContatoModal();
            }
            else {
                vm.contatoSelecionado.fkArena = true;
                if (vm.contatoSelecionado.dataNascimento) {
                    vm.contatoSelecionado.dataNascimento = vm.contatoSelecionado.dataNascimento.getTime();
                }
                vm.contatos.$add(vm.contatoSelecionado);
                logger.success('Contato criado com sucesso!');
                hideNovoContatoModal();
            }
        }

        function excluirContato(contato) {
            contato.fkArena = false;
            vm.contatos.$save(contato);
        }

        function showNovoContatoModal() {
            vm.contatoSelecionado = {};
            vm.novoContatoModal.$promise.then(vm.novoContatoModal.show);
        }

        function showEditContatoModal(contato) {
            vm.contatoSelecionado = contato;
            vm.novoContatoModal.$promise.then(vm.novoContatoModal.show);
        }

        function hideNovoContatoModal() {
            vm.novoContatoModal.$promise.then(vm.novoContatoModal.hide);
        }
    }

})();
