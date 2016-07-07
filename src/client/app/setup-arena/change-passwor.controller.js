(function() {
    'use strict';

    angular
        .module('app.setup-arena')
        .controller('ChangePasswordCtrl', ChangePasswordCtrl);

    ChangePasswordCtrl.$inject = ['$scope' , '$modal' , 'Ref', 'logger', 'cfpLoadingBar', 'Auth', '$firebaseObject'];

    function ChangePasswordCtrl($scope, $modal, Ref, logger, cfpLoadingBar, Auth, $firebaseObject) {
        var vm = this;
        vm.changePassword = changePassword;
        var modal = $modal({template: 'app/setup-arena/user-profile-modal.html', show: false});

        activate();

        function activate() {
            $firebaseObject(Ref.child('users/' + Auth.currentUser.uid)).$loaded().then(function(ref) {
                $scope.email = ref.email;
            });
        }

        function changePassword(email, oldPassword, newPassword) {
            cfpLoadingBar.start();
            Ref.changePassword({
                email: email,
                oldPassword: oldPassword,
                newPassword: newPassword
            }, function(error) {
                cfpLoadingBar.complete();
                if (error) {
                    switch (error.code) {
                        case 'INVALID_PASSWORD':
                            logger.error('Senha incorreta!');
                            break;
                        case 'INVALID_USER':
                            logger.error('Conta de usuário não existe!');
                            break;
                        default:
                            logger.error('Erro ao alterar a senha:', error);
                    }
                } else {
                    logger.success('Senha alterada com sucesso!');
                }
            });
        }
    }

})();
