(function() {
    'use strict';

    angular
    .module('app.contatos')
    .controller('ContatosCtrl', ContatosCtrl);

    ContatosCtrl.$inject = ['contatosService', 'logger', 'cfpLoadingBar'];

    function ContatosCtrl(contatosService, logger, cfpLoadingBar) {
        var vm = this;
        vm.contatos = contatosService.getContatosArena();
        vm.salvarContato = salvarContato;
        vm.excluirContato = excluirContato;

        activate();

        function activate() {
            cfpLoadingBar.start();
            vm.contatos.$loaded()
            .then(function(data) {
                vm.emptyList = (vm.contatos.length === 0);
                cfpLoadingBar.complete();
            })
            .catch(function(error) {
                cfpLoadingBar.complete();
                console.error('Error:', error);
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
            }
            else {
                vm.contatoSelecionado.fkArena = true;
                if (vm.contatoSelecionado.dataNascimento) {
                    vm.contatoSelecionado.dataNascimento = vm.contatoSelecionado.dataNascimento.getTime();
                }
                vm.contatos.$add(vm.contatoSelecionado);
                logger.success('Contato criado com sucesso!');
            }
        }

        function excluirContato(contato) {
            contato.fkArena = false;
            vm.contatos.$save(contato);
        }
    }

})();
