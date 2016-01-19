/*global $:false */
(function() {
    'use strict';

    angular
        .module('app.reservas')
        .controller('MensalistasFormCtrl', MensalistasFormCtrl);

    MensalistasFormCtrl.$inject = [
        '$scope' ,
        '$modal',
        'quadraService' ,
        'contatosService',
        'mensalistassService'
    ];

    function MensalistasFormCtrl($scope, $modal,quadraService, contatosService, mensalistassService) {
        var vm = this;
        vm.novoMensalista = {};
        vm.mensalistas = mensalistassService.getMensalistas();
        vm.quadras = quadraService.getQuadras();
        vm.contatos = contatosService.getContatosArenaLight();
        vm.salvarnovoMensalista = salvarnovoMensalista;
        vm.hideModalForm = hideModalForm;

        activate();

        function activate() {
            initForm();
        }

        function salvarnovoMensalista() {

            vm.mensalista = {
                quadra: vm.novoMensalista.quadra.$id,
                responsavel: vm.novoMensalista.responsavel.$id,
                horaInicio : moment(vm.novoMensalista.hora).format('HHmm'),
                horaFim : moment(vm.novoMensalista.hora).add(vm.novoMensalista.duracao.value, 'h').format('HHmm'),
                dataInicio : vm.novoMensalista.data.getTime(),
                dataFim : moment(vm.novoMensalista.data.getTime()).add(vm.novoMensalista.validade.value , 'M')._d.getTime(),
                dow : [vm.novoMensalista.data.getDay()]
            };

            mensalistassService.criarMensalista(vm.mensalistas, vm.mensalista).then(function() {
                hideModalForm();
            },function(error) {
                console.log('Failed: ' + error);
            });
        }

        function hideModalForm() {
            $scope.$parent.vm.hideModalForm();
        }

        function initForm() {
            vm.estenderPor = [
                {value: 1, desc: 'Um Mês'},
                {value: 2, desc: 'Dois Meses'},
                {value: 3, desc: 'Três Meses'},
                {value: 6, desc: 'Seis Meses'},
                {value: 12, desc: 'Um Ano'},
            ];

            vm.duracao = [
                {value: 1, desc: '01:00'},
                {value: 1.5, desc: '01:30'},
                {value: 2, desc: '02:00'}
            ];

            vm.diasSemana = [
                {dia: 0, ativo: false},
                {dia: 1, ativo: false},
                {dia: 2, ativo: false},
                {dia: 3, ativo: false},
                {dia: 4, ativo: false},
                {dia: 5, ativo: false},
                {dia: 6, ativo: false}
            ];

            vm.novoMensalista.validade = vm.estenderPor[0];
            vm.novoMensalista.duracao = vm.duracao[0];
        }
    }

})();
