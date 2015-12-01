(function() {
    'use strict';

    angular
        .module('app.setup-arena')
        .controller('SetupArenaCtrl', SetupArenaCtrl);

    function SetupArenaCtrl($scope, Ref, $firebaseObject, $firebaseArray, user, arena) {
        var vm = this;

        var arenaID = arena;
        var userID = user.uid;

        vm.wellcomeMessage = true;
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

    }

})();
