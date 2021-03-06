/*global $:false */
(function() {
    'use strict';

    angular
        .module('app.reservas')
        .controller('NovaReservaFormCtrl', NovaReservaFormCtrl);

    NovaReservaFormCtrl.$inject = [
        '$scope' ,
        '$modal',
        'quadraService' ,
        'contatosService',
        'reservasService',
        'logger'
    ];

    function NovaReservaFormCtrl($scope, $modal,quadraService, contatosService, reservasService, logger) {
        var vm = this;
        vm.novaReserva = {};
        vm.quadras = quadraService.getQuadras();
        vm.contatos = contatosService.getContatosArenaLight();
        vm.salvarNovaReserva = salvarNovaReserva;
        vm.hideModalForm = hideModalForm;
        vm.showNovoContatoModal = showNovoContatoModal;
        vm.hideNovoContatoModal = hideNovoContatoModal;
        vm.salvarContato = salvarContato;

        activate();

        function activate() {
            if ($scope.$parent.vm.edicaoEventoAvulso) {
                vm.novaReserva = $scope.$parent.vm.reservaAvulsaSelecionada;
                vm.novaReserva.responsavel = _.find(vm.contatos, {'$id' : $scope.$parent.vm.reservaAvulsaSelecionada.responsavel});
            }
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

            vm.novaReserva.preco = _.find(vm.novaReserva.quadra.funcionamento  , function(f) {
                return f.start <= moment(vm.novaReserva.hora).format('HHmm') &&
                        (f.end > f.start && f.end >=
                            moment(vm.novaReserva.hora).add(vm.novaReserva.duracao.value, 'h').format('HHmm') ||
                        f.end >= '00:00' && f.end <= '01:00') &&
                        f.dow === ('' + vm.novaReserva.data.getDay());
            });

            vm.reserva = {
                quadra: vm.novaReserva.quadra.$id,
                responsavel: vm.novaReserva.responsavel.$id,
                horaInicio : moment(vm.novaReserva.hora).format('HHmm'),
                horaFim : moment(vm.novaReserva.hora).add(vm.novaReserva.duracao.value, 'h').format('HHmm'),
                dataInicio : vm.novaReserva.data.getTime(),
                dataFim : moment(moment(vm.novaReserva.data.getTime()).format('DDMMYYYY')  + '23:59', 'DDMMYYYYHH:mm')._d.getTime() ,
                dow : [vm.novaReserva.data.getDay()],
                title: vm.novaReserva.responsavel.nome,
                tipo: vm.novaReserva.tipoReserva
            };

            if (vm.reserva.tipo === 1) {
                vm.reserva.saldoDevedor = vm.novaReserva.preco ? vm.novaReserva.preco.precoAvulso : 0;
                reservasService.criarReservaAvulsa(vm.reserva).then(function() {
                    logger.success('Reserva criada com sucesso!');
                    hideModalForm();
                },function(error) {
                    logger.error(error, vm.reserva, 'Ops!');
                });
            }
            else {
                vm.reserva.saldoDevedor = vm.novaReserva.preco ? vm.novaReserva.preco.precoMensalista : 0;
                vm.reserva.dataFim = moment(vm.novaReserva.data.getTime()).add(vm.novaReserva.validade.value , 'M')._d.getTime();
                reservasService.criarReservaRecorrente(vm.reserva, 'arenasMensalistas').then(function() {
                    logger.success('Reserva criada com sucesso!');
                    hideModalForm();
                },function(error) {
                    logger.error('Erro ao criar uma reserva mensalista: ' + error, error , 'Ops!');
                });
            }

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

            vm.estenderPor = [
                {value: 1, desc: 'Um Mês'},
                {value: 2, desc: 'Dois Meses'},
                {value: 3, desc: 'Três Meses'},
                {value: 6, desc: 'Seis Meses'},
                {value: 12, desc: 'Um Ano'},
            ];

            vm.novaReserva.duracao = vm.duracao[0];

            vm.novaReserva.tipoReserva = 1;
        }

        function showNovoContatoModal() {
            vm.contatoSelecionado = {};
            vm.novoContatoModal.$promise.then(vm.novoContatoModal.show);
        }

        function hideNovoContatoModal() {
            vm.novoContatoModal.$promise.then(vm.novoContatoModal.hide);
        }

        function salvarContato() {
            contatosService.addNovoContato(vm.contatoSelecionado).then(function(val) {
                vm.novaReserva.responsavel = _.find(vm.contatos, {$id : val});
            });
            hideNovoContatoModal();
        }
    }

})();
