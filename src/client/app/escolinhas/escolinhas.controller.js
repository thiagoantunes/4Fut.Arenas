/*global $:false */
(function() {
    'use strict';

    angular
        .module('app.escolinhas')
        .controller('EscolinhasCtrl', EscolinhasCtrl);

    EscolinhasCtrl.$inject = [
        '$scope' ,
        '$modal',
        'reservasService',
        'contatosService',
        'quadraService',
        'cfpLoadingBar'
    ];

    function EscolinhasCtrl($scope, $modal, reservasService, contatosService, quadraService, cfpLoadingBar) {
        var vm = this;
        vm.turmas = reservasService.getTurmas();
        vm.contatos = contatosService.getContatosArenaLight();
        vm.quadras = quadraService.getQuadras();
        vm.showEscolinhasForm = showEscolinhasForm;
        vm.hideModalForm = hideModalForm;
        vm.editTurma = editTurma;
        vm.getQuadraNome = getQuadraNome;
        vm.getContato = getContato;
        vm.novaTurmaModal = $modal({
            scope: $scope,
            templateUrl: 'novaTurmaModal.html',
            animation:'am-fade-and-slide-top' ,
            show: false
        });

        activate();

        function activate() {
            cfpLoadingBar.start();
            vm.turmas.$loaded().then(function () {
                cfpLoadingBar.complete();
                vm.emptyList = (vm.turmas.length === 0);
            });
        }

        function editTurma(escolinha) {
            vm.turmaSelecionada = escolinha;
            vm.novaTurmaModal.$promise.then(vm.novaTurmaModal.show);
        }

        function showEscolinhasForm() {
            vm.novaTurmaModal.$promise.then(vm.novaTurmaModal.show);
        }

        function hideModalForm() {
            vm.novaTurmaModal.$promise.then(vm.novaTurmaModal.hide);
        }

        function getQuadraNome(quadraId) {
            var val = _.find(vm.quadras , {'$id' : quadraId});
            if (val) {
                return val.nome;
            }
        }

        function getContato(contatoId) {
            var val = _.find(vm.contatos , {'$id' : contatoId});
            if (val) {
                return val.nome;
            }
        }
    }

})();
