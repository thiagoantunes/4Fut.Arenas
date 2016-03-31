/*global $:false */
(function() {
    'use strict';

    angular
        .module('app.reservas')
        .controller('EscolinhasFormCtrl', EscolinhasFormCtrl);

    EscolinhasFormCtrl.$inject = [
        '$scope' ,
        '$modal',
        'quadraService' ,
        'contatosService',
        'reservasService',
        'logger'
    ];

    function EscolinhasFormCtrl($scope, $modal,quadraService, contatosService, reservasService, logger) {
        var vm = this;
        vm.quadras = quadraService.getQuadras();
        vm.professores = contatosService.getContatosArenaLight();
        vm.salvarNovaTurma = salvarNovaTurma;
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

            initDiasSemana();

            initReservaSelecionada();
        }

        function initReservaSelecionada() {
            vm.quadras.$loaded().then(function(results) {
                vm.professores.$loaded().then(function(data) {
                    var turmaSelecionada = $scope.$parent.vm.turmaSelecionada;
                    if (turmaSelecionada) {
                        vm.novaTurma = {
                            $id : turmaSelecionada.$id,
                            quadra : _.find(vm.quadras, {$id : turmaSelecionada.quadra}),
                            professor : _.find(vm.professores , {$id : turmaSelecionada.responsavel}),
                            dataInicio : turmaSelecionada.dataInicio,
                            dataFim : turmaSelecionada.dataFim,
                            dow : turmaSelecionada.dow,
                            horaInicio : moment(turmaSelecionada.horaInicio , 'HHmm'),
                            horaFim : moment(turmaSelecionada.horaFim , 'HHmm')
                        };

                        _.forEach(turmaSelecionada.dow, function(d) {
                            _.find(vm.diasSemana, {'dia' : d}).ativo = true;
                        });
                    }
                });
            });
        }

        function salvarNovaTurma() {

            vm.turma = {
                $id : vm.novaTurma.$id,
                quadra: vm.novaTurma.quadra.$id,
                responsavel: vm.novaTurma.professor.$id,
                horaInicio : moment(vm.novaTurma.horaInicio).format('HHmm'),
                horaFim : moment(vm.novaTurma.horaFim).format('HHmm'),
                dataInicio : vm.novaTurma.dataInicio.getTime(),
                dataFim : vm.novaTurma.dataFim.getTime(),
                dow : _.pluck(_.filter(vm.diasSemana, {
                    'ativo': true
                }), 'dia'),
                title: vm.novaTurma.professor.nome,
                tipo : 3
            };

            if (vm.turma.$id) {
                reservasService.editaReservaRecorrente(vm.turma, 'turmas').then(function() {
                    logger.success('Reserva editada com sucesso!');
                    hideModalForm();
                }, function(error) {
                    logger.error('Erro ao editar turma: ' + error, error , 'Ops!');
                });
            }
            else {
                reservasService.criarReservaRecorrente(vm.turma, 'turmas').then(function() {
                    logger.success('Reserva criada com sucesso!');
                    hideModalForm();
                },function(error) {
                    logger.error('Erro ao criar turma: ' + error, error , 'Ops!');
                });
            }
        }

        function hideModalForm() {
            $scope.$parent.vm.hideModalForm();
        }

        function initDiasSemana() {
            vm.diasSemana = [
                {dia: 0, ativo: false},
                {dia: 1, ativo: false},
                {dia: 2, ativo: false},
                {dia: 3, ativo: false},
                {dia: 4, ativo: false},
                {dia: 5, ativo: false},
                {dia: 6, ativo: false}
            ];
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
