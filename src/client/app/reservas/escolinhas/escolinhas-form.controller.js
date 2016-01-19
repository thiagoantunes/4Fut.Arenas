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
        'escolinhaService'
    ];

    function EscolinhasFormCtrl($scope, $modal,quadraService, contatosService, escolinhaService) {
        var vm = this;
        vm.turmas = escolinhaService.getTurmas();
        vm.quadras = quadraService.getQuadras();
        vm.professores = contatosService.getContatosArenaLight();
        vm.salvarNovaTurma = salvarNovaTurma;
        vm.hideModalForm = hideModalForm;

        activate();

        function activate() {
            initDiasSemana();
        }

        function salvarNovaTurma() {

            vm.turma = {
                quadra: vm.novaTurma.quadra.$id,
                professor: vm.novaTurma.professor.$id,
                horaInicio : moment(vm.novaTurma.horaInicio).format('HHmm'),
                horaFim : moment(vm.novaTurma.horaFim).format('HHmm'),
                dataInicio : vm.novaTurma.dataInicio.getTime(),
                dataFim : vm.novaTurma.dataFim.getTime(),
                dow : _.pluck(_.filter(vm.diasSemana, {
                    'ativo': true
                }), 'dia')
            };

            escolinhaService.criarTurma(vm.turmas, vm.turma).then(function() {
                hideModalForm();
            },function(error) {
                console.log('Failed: ' + error);
            });
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
    }

})();
