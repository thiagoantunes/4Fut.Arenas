(function () {
    'use strict';

    angular
        .module('app.sistema-arena')
        .controller('SistemaArenaCtrl', SistemaArenaCtrl);

    SistemaArenaCtrl.$inject = ['Auth' , 'Ref', '$state', '$location'];
    /* @ngInject */
    function SistemaArenaCtrl(Auth, Ref, $state, $location) {
        var vm = this;
        vm.novaArena = {};
        vm.redirectPath = '';
        vm.formSubmit = formSubmit;

        function formSubmit() {
            vm.err = null;

            Ref.child('arenas/' + vm.novaArena.arena).once('value', function(snap) {
                if (snap.val() === null) {
                    createAccount();
                }
                else {
                    vm.err = 'Já existe uma arena com este nome!';
                }
            });
        }

        function createAccount() {
            Auth.$createUser({email: vm.novaArena.email, password: vm.novaArena.password})
            .then(authenticate)
              .then(createProfile)
              .then(redirect, showError);

            function authenticate() {
                return Auth.$authWithPassword({email: vm.novaArena.email, password: vm.novaArena.password}, {rememberMe: true});
            }

            function createProfile(user) {
                var novoRegistro = {};
                novoRegistro['arenas/' + vm.novaArena.arena + '/staff/' + user.uid] = 1;
                novoRegistro['arenas/' + vm.novaArena.arena + '/configurado/'] = false;
                novoRegistro['users/' + user.uid] = {
                    email: vm.novaArena.email,
                    nome: vm.novaArena.responsavel
                };

                Ref.update(novoRegistro, function(error) {
                    if (error) {
                        console.log('Error updating data:', error);
                    }
                });
            }

            function redirect() {
                vm.redirectPath = $location.protocol() + '://' + vm.novaArena.arena + '.' + $location.host() + ':' + $location.port();
                $state.go('sistema-arena.confirmacao-cadastro');
            }

            function showError(err) {
                vm.err = err;
            }
        }
    }
})();
