(function () {
    'use strict';

    angular
        .module('app.arena')
        .controller('ArenaCtr', ArenaCtr);

    ArenaCtr.$inject = ['$scope', 'arenaService', '$modal', 'Ref'];

    function ArenaCtr($scope, arenaService, $modal, Ref) {
        var vm = this;
        vm.estruturaArena = arenaService.getEstrutura();
        vm.showUploadImageModal = showUploadImageModal;
        vm.hideUploadImageModal = hideUploadImageModal;
        vm.saveImage = saveImage;
        vm.placeChanged = placeChanged;

        activate();

        function activate() {
            initItensEstrutura();
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
            /*jshint validthis: true */
            vm.place = this.getPlace();
            var lat = vm.place.geometry.location.lat();
            var lng = vm.place.geometry.location.lng();
            arenaService.setLocation(lat, lng);
        }

        function initItensEstrutura() {
            vm.itensEstrutura = [
                {id: 1, ativo: false, img: '', desc: 'Vestiário', quantidade : null, ordem: 1},
                {id: 2, ativo: false, img: '', desc: 'Vestiário Feminino', quantidade : null, ordem: 2},
                {id: 3, ativo: false, img: '', desc: 'Estacionamento', quantidade : null, ordem: 3},
                {id: 4, ativo: false, img: '', desc: 'Estacionamento Motos', quantidade : null, ordem: 4},
                {id: 5, ativo: false, img: '', desc: 'Lanchonete', quantidade : null, ordem: 5},
                {id: 6, ativo: false, img: '', desc: 'Churrasqueira', quantidade : null, ordem: 6},
                {id: 7, ativo: false, img: '', desc: 'Armário Individual', quantidade : null, ordem: 7},
                {id: 8, ativo: false, img: '', desc: 'Playground', quantidade : null, ordem: 8},
                {id: 9, ativo: false, img: '', desc: 'Segurança Privada', quantidade : null, ordem: 9},
            ];

            vm.estruturaArena.$loaded().then(function() {
                _.forEach(vm.itensEstrutura, function(val) {
                    var item = _.find(vm.estruturaArena, {id : val.id});
                    if (!item) {
                        vm.estruturaArena.$add(val);
                        vm.estruturaArena.$save();
                    }
                });
            });
        }
    }

})();

