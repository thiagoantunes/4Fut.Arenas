/*global $:false */
(function() {
    'use strict';

    angular
        .module('app.reservas')
        .controller('EscolinhasCtrl', EscolinhasCtrl);

    EscolinhasCtrl.$inject = [
        '$scope' ,
        '$modal',
        'quadraService' ,
        'contatosService',
        'escolinhaService'
    ];

    function EscolinhasCtrl($scope, $modal,quadraService, contatosService, escolinhaService) {
        var vm = this;
        vm.turmas = escolinhaService.getTurmas();
        vm.quadras = quadraService.getQuadras();
        vm.professores = contatosService.getContatosArenaLight();
        vm.salvarNovaTurma = salvarNovaTurma;
        vm.showNovaTurmaModal = showNovaTurmaModal;
        vm.hideNovaTurmaModal = hideNovaTurmaModal;
        vm.novaTurmaModal = $modal({
            scope: $scope,
            templateUrl: 'novaTurmaModal.html',
            animation:'am-fade-and-slide-top' ,
            show: false
        });

        activate();

        function activate() {

            initDiasSemana();
        }

        function showNovaTurmaModal() {

            vm.novaTurmaModal.$promise.then(vm.novaTurmaModal.show);
        }

        function hideNovaTurmaModal() {
            initDiasSemana();
            vm.novaTurma = {};
            vm.novaTurmaModal.$promise.then(vm.novaTurmaModal.hide);
        }

        function salvarNovaTurma() {

            vm.turma = {
                quadra: vm.novaTurma.quadra.$id,
                professor: vm.novaTurma.professor.$id,
                horaInicio : moment(vm.novaTurma.horaInicio).format('HH:mm'),
                horaFim : moment(vm.novaTurma.horaFim).format('HH:mm'),
                dataInicio : vm.novaTurma.dataInicio.getTime(),
                dataFim : vm.novaTurma.dataFim.getTime(),
                dow : _.pluck(_.filter(vm.diasSemana, {
                    'ativo': true
                }), 'dia')
            };

            escolinhaService.criarTurma(vm.turmas, vm.turma).then(function() {
                hideNovaTurmaModal();
            },function(error) {
                alert('Failed: ' + error);
            });
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
