(function () {
    'use strict';

    angular
        .module('app.arena')
        .controller('ArenaCtr', ArenaCtr);

    ArenaCtr.$inject = ['$scope', 'arenaService', '$modal', 'Ref'];

    function ArenaCtr($scope, arenaService, $modal, Ref) {
        var vm = this;
        vm.showUploadImageModal = showUploadImageModal;
        vm.hideUploadImageModal = hideUploadImageModal;
        vm.saveImage = saveImage;
        vm.placeChanged = placeChanged;

        activate();

        function activate() {
            arenaService.getArena().$bindTo($scope, 'arena');
            $scope.address = 'current';

            vm.uploadImageModal = $modal({
                scope: $scope,
                backdrop: 'static',
                container: 'body',
                templateUrl: 'app/setup-arena/upload-img.html',
                animation: 'am-fade-and-slide-top',
                show: false
            });
        }

        function showUploadImageModal() {
            vm.uploadImageModal.$promise.then(vm.uploadImageModal.show);
        }

        function hideUploadImageModal() {
            vm.uploadImageModal.$promise.then(vm.uploadImageModal.hide);
            vm.uploadImageModal = $modal({
                scope: $scope,
                backdrop: 'static',
                container: 'body',
                templateUrl: 'app/setup-arena/upload-img.html',
                animation: 'am-fade-and-slide-top',
                show: false
            });
        }

        function saveImage(fileName) {
            $scope.arena.fotoPerfil = 'https://4fut.s3.amazonaws.com/img/' + fileName;
            hideUploadImageModal();
        }

        function placeChanged() {
            vm.place = this.getPlace();
            var lat = vm.place.geometry.location.lat();
            var lng = vm.place.geometry.location.lng();
            arenaService.setLocation(lat, lng);
        }
    }

})();

