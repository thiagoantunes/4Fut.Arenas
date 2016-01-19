(function() {
    'use strict';

    angular
        .module('app.setup-arena')
        .controller('SetupArenaCtrl', SetupArenaCtrl);

    SetupArenaCtrl.$inject = ['$scope', 'Ref', '$firebaseObject', '$firebaseArray' , 'user' , 'arena', '$modal', '$location'];

    function SetupArenaCtrl($scope, Ref, $firebaseObject, $firebaseArray, user, arena, $modal, $location) {
        var vm = this;

        var arenaID = arena;
        var userID = user.uid;

        vm.wellcomeMessage = true;
        vm.modal = $modal({templateUrl: 'app/setup-arena/wizard-modal.html', show: true, backdrop: 'static', scope:$scope});
        //vm.usuario = {
        //    nome: user.facebook.displayName,
        //    email: user.facebook.email,
        //    fotoPerfil: user.facebook.profileImageURL
        //};
        vm.usuario = $firebaseObject(Ref.child('users/' + userID));
        vm.arena = $firebaseObject(Ref.child('arenas/' + arenaID));
        vm.quadras = $firebaseArray(Ref.child('quadras/' + arenaID));
        vm.novaQuadra = {};
        vm.addQuadra = addQuadra;
        vm.concluirConfiguracao = concluirConfiguracao;

        activate();

        function activate() {
            vm.modal.$promise.then(vm.modal.show);
        }

        function addQuadra() {
            var quadraID = Ref.child('quadras').push().key();

            var userData = $firebaseObject(Ref.child('users/' + userID));
            userData.$loaded(function() {
                $firebaseObject(Ref.child('arenas/' + userData.arena)).$loaded(function(data) {
                    var teste = data;
                });
            });

            var quadraData = {};
            quadraData['arenas/' + arenaID + '/quadras/' + quadraID] = vm.novaQuadra.nome;
            quadraData['quadras/' + arenaID + '/' + quadraID] = vm.novaQuadra;

            Ref.update(quadraData, function(error) {
                if (error) {
                    console.log('Error updating data:', error);
                }
            });

            vm.novaQuadra = {};
        }

        function concluirConfiguracao() {
            vm.arena.configurado = 'true';
            vm.arena.$save();
            vm.modal.$promise.then(vm.modal.hide);
            $location.path('/admin/reservas');
        }

    }

})();
