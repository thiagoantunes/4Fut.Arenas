/*global $:false */
(function() {
    'use strict';

    angular
        .module('app.reservas')
        .controller('AvulsasFormCtrl', AvulsasFormCtrl);

    AvulsasFormCtrl.$inject = [
        '$scope' ,
        '$modal',
        'quadraService' ,
        'contatosService',
        'reservasService',
        'logger'
    ];

    function AvulsasFormCtrl($scope, $modal,quadraService, contatosService, reservasService, logger) {
        var vm = this;
        vm.novaReserva = {};
        vm.quadras = quadraService.getQuadras();
        vm.contatos = contatosService.getContatosArenaLight();
        vm.salvarNovaReserva = salvarNovaReserva;
        vm.hideModalForm = hideModalForm;
        vm.showNovoContatoModal = showNovoContatoModal;
        vm.salvarContato = salvarContato;

        activate();

        function activate() {

            vm.novoContatoModal = $modal({
                scope: $scope,
                templateUrl: 'app/contatos/novo-contato.html',
                animation:'am-fade-and-slide-top' ,
                show: false,
                container: 'body'
            });

            initForm();
        }

        function salvarNovaReserva() {

            vm.reserva = {
                quadra: vm.novaReserva.quadra.$id,
                responsavel: vm.novaReserva.responsavel.$id,
                horaInicio : moment(vm.novaReserva.hora).format('HHmm'),
                horaFim : moment(vm.novaReserva.hora).add(vm.novaReserva.duracao.value, 'h').format('HHmm'),
                dataInicio : vm.novaReserva.data.getTime(),
                dataFim : moment(moment(vm.novaReserva.data.getTime()).format('DDMMYYYY')  + '23:59', 'DDMMYYYYHH:mm')._d.getTime() ,
                dow : [vm.novaReserva.data.getDay()],
                title: vm.novaReserva.responsavel.nome
            };

            reservasService.criarReservaAvulsa(vm.reserva).then(function() {
                logger.success('Reserva criada com sucesso!');
                hideModalForm();
            },function(error) {
                logger.error(error, vm.reserva, 'Ops!');
            });
        }

        function hideModalForm() {
            $scope.$parent.vm.hideModalForm();
        }

        function initForm() {
            vm.duracao = [
                {value: 1, desc: '01:00'},
                {value: 1.5, desc: '01:30'},
                {value: 2, desc: '02:00'}
            ];

            vm.novaReserva.duracao = vm.duracao[0];
        }

        function showNovoContatoModal() {
            vm.contatoSelecionado = {};
            vm.novoContatoModal.$promise.then(vm.novoContatoModal.show);
        }

        function salvarContato() {
            contatosService.addNovoContato(vm.contatoSelecionado);
        }
    }

})();
