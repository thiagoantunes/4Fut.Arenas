(function() {
    'use strict';

    angular
        .module('app.nova-arena')
        .controller('NovaArenaCtrl', NovaArenaCtrl);

    function NovaArenaCtrl($scope, Ref, $firebaseObject, $firebaseArray, user, $cookies, $stateParams) {
        var vm = this;

        vm.teste1 = $stateParams.arena;
        vm.teste2 = $stateParams.responsavel;
        var arenaID = Ref.child('arenas').push().key();
        $cookies.put('arenaID', angular.isUndefined(arenaID) ? null : arenaID);
        var userID = user.uid;

        vm.wellcomeMessage = true;
        vm.usuario = {
            nome: user.facebook.displayName,
            email: user.facebook.email,
            fotoPerfil: user.facebook.profileImageURL
        };
        vm.arena = {};
        vm.quadras = $firebaseArray(Ref.child('quadras/' + arenaID));
        vm.novaQuadra = {};
        vm.salvarCadastroInicial = salvarCadastroInicial;
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

        function salvarCadastroInicial() {
            var cadastroInicial = {};
            cadastroInicial['users/' + userID] = vm.usuario;
            cadastroInicial['arenas/' + arenaID] = vm.arena;

            Ref.update(cadastroInicial, function(error) {
                if (error) {
                    console.log('Error updating data:', error);
                } else {
                    var cadastroReferencias = {};
                    cadastroReferencias['users/' + userID + '/arena/'] = arenaID;
                    cadastroReferencias['users/' + userID + '/arenas/' + arenaID] = {
                        nome: vm.arena.nome,
                        perfilAcesso: 1
                    };
                    cadastroReferencias['arenas/' + arenaID + '/staff/' + userID] = {
                        nome: vm.usuario.nome,
                        perfilAcesso: 1
                    };

                    Ref.update(cadastroReferencias, function(error) {
                        if (error) {
                            console.log('Error updating data:', error);
                        }
                    });
                }
            });
        }
    }

})();
