(function() {
    'use strict';

    angular
    .module('app.contatos')
    .controller('ContatosCtrl', ContatosCtrl);

    ContatosCtrl.$inject = ['contatosService'];

    function ContatosCtrl(contatosService) {
        var vm = this;

        vm.contatos = contatosService.getContatosArena();
        vm.salvarContato = salvarContato;
        vm.excluirContato = excluirContato;

        function salvarContato() {
            if (vm.edicao) {
                vm.contatos.$save(vm.contatoSelecionado);
            }
            else {
                vm.contatoSelecionado.fkArena = true;
                vm.contatos.$add(vm.contatoSelecionado);
            }
        }

        function excluirContato(contato) {
            contato.fkArena = false;
            vm.contatos.$save(contato);
        }
    }

})();
