(function() {
    'use strict';

    angular
        .module('app.setup-arena')
        .controller('ChangePasswordCtrl', ChangePasswordCtrl);

    ChangePasswordCtrl.$inject = ['$scope' , '$modal' , 'Ref', 'logger', 'cfpLoadingBar'];

    function ChangePasswordCtrl($scope, $modal, Ref, logger, cfpLoadingBar) {
        var vm = this;
        vm.changePassword = changePassword;
        var modal = $modal({template: 'app/setup-arena/user-profile-modal.html', show: false});

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
