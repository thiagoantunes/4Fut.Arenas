(function () {
    'use strict';

    angular
        .module('app.admin')
        .controller('AdminController', AdminController);

    AdminController.$inject = ['$scope', '$location', 'Auth', 'usersService'];
    /* @ngInject */
    function AdminController($scope, $location, Auth, usersService) {
        var vm = this;
        vm.logout = function() {
            Auth.$unauth();
        };

        activate();

        function activate() {
            var authData = Auth.$getAuth();
            if (authData) {
                usersService.getUserProfile(authData.uid).$bindTo($scope, 'loggedUser');
            }
        }

        $scope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
        };
    }
})();
