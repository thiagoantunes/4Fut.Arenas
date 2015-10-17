(function() {
    'use strict';

    angular
        .module('app.account')
        .controller('AccountCtrl', AccountCtrl);

    function AccountCtrl($scope, Ref, $firebaseObject, $firebaseArray, user) {
        var vm = this;
        var arenaID = Ref.child("arenas").push().key();
        var userID = user.uid;

        vm.wellcomeMessage = true;
        vm.usuario = {
            nome : user.facebook.displayName,
            email : user.facebook.email
        };
        vm.arena = {};
        vm.quadras = $firebaseArray(Ref.child('quadras/' + arenaID));
        vm.novaQuadra = {};
        vm.salvarCadastroInicial = salvarCadastroInicial;
        vm.addQuadra = addQuadra;


        function addQuadra() {
            var quadraID = Ref.child("quadras").push().key();

            var quadraData = {};
            quadraData["arenas/" + arenaID + "/quadras/" + quadraID] = vm.novaQuadra.nome;
            quadraData["quadras/" + arenaID + "/" + quadraID] = vm.novaQuadra;

            Ref.update(quadraData, function(error) {
                if (error) {
                    console.log("Error updating data:", error);
                }
            });

            vm.novaQuadra = {};
        };

        function salvarCadastroInicial() {
            var cadastroInicial = {};
            cadastroInicial["user/" + userID] = vm.usuario;
            cadastroInicial["arenas/" + arenaID] = vm.arena;

            Ref.update(cadastroInicial, function(error) {
                if (error) {
                    console.log("Error updating data:", error);
                } else {
                    var cadastroReferencias = {};
                    cadastroReferencias["user/" + userID + "/arenas/" + arenaID] = {
                        nome: vm.arena.nome,
                        perfilAcesso: 1
                    };
                    cadastroReferencias["arenas/" + arenaID + "/staff/" + userID] = {
                        nome: vm.usuario.nome,
                        perfilAcesso: 1
                    };

                    Ref.update(cadastroReferencias, function(error) {
                        if (error) {
                            console.log("Error updating data:", error);
                        }
                    });
                }
            });
        }
    }

})();