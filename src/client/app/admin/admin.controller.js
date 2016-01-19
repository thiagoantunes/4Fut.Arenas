(function () {
    'use strict';

    angular
        .module('app.admin')
        .controller('AdminController', AdminController);

    AdminController.$inject = ['$scope', '$location', 'Auth'];
    /* @ngInject */
    function AdminController($scope, $location, Auth) {
        var vm = this;
        vm.logout = function() {
            Auth.$unauth();
        };

        $scope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
        };
    }
})();
