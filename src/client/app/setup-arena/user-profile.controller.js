(function() {
    'use strict';

    angular
        .module('app.setup-arena')
        .controller('UserProfileCtrl', UserProfileCtrl);

    UserProfileCtrl.$inject = ['$scope' , '$modal', 'usersService', 'Auth'];

    function UserProfileCtrl($scope, $modal, usersService, Auth) {
        var vm = this;
        vm.showModal = showModal;
        vm.saveImage = saveImage;
        vm.hideModal = hideModal;
        vm.novaReservaModal = {};
        activate();

        function activate() {
            var authData = Auth.currentUser;
            if (authData) {
                usersService.getUserProfile(authData.uid).$bindTo($scope, 'user');
            }

            vm.uploadImageModal = $modal({
                scope: $scope,
                backdrop: false,
                container: '#userProfileModal',
                templateUrl: 'app/setup-arena/upload-img.html',
                animation:'am-fade-and-slide-top' ,
                show: false
            });
        }

        function showModal() {
            vm.uploadImageModal.$promise.then(vm.uploadImageModal.show);
        }

        function hideModal() {
            vm.uploadImageModal.$promise.then(vm.uploadImageModal.hide);
        }

        function saveImage(fileName) {
            $scope.user.fotoPerfil = 'https://4fut.s3.amazonaws.com/img/' + fileName;
            hideModal();
        }
    }

})();
