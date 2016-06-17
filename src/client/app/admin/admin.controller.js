(function () {
    'use strict';

    angular
        .module('app.admin')
        .controller('AdminController', AdminController);

    AdminController.$inject = ['$scope', '$modal', '$location', 'Auth', 'usersService'];
    /* @ngInject */
    function AdminController($scope, $modal, $location, Auth, usersService) {
        var vm = this;
        vm.openPerfilModal = openPerfilModal;
        vm.openTrocarSenhaModal = openTrocarSenhaModal;
        vm.hideModal = hideModal;
        vm.logout = function() {
            Auth.$unauth();
        };

        activate();

        function activate() {
            var authData = Auth.$getAuth();
            if (authData) {
                usersService.getUserProfile(authData.uid).$bindTo($scope, 'loggedUser');
            }

            vm.perfilModal = $modal({
                scope: $scope,
                templateUrl: 'app/setup-arena/user-profile-modal.html',
                animation:'am-fade-and-slide-top' ,
                show: false
            });

            vm.trocarSenhaModal = $modal({
                scope: $scope,
                container: 'body',
                templateUrl: 'app/setup-arena/change-password-modal.html',
                animation:'am-fade-and-slide-top' ,
                show: false
            });
        }

        $scope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
        };

        function openTrocarSenhaModal() {
            vm.trocarSenhaModal.$promise.then(vm.trocarSenhaModal.show);
        }

        function openPerfilModal() {
            vm.perfilModal.$promise.then(vm.perfilModal.show);
        }

        function hideModal() {
            vm.perfilModal.$promise.then(vm.perfilModal.hide);
        }
    }
})();
