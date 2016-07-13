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
        vm.mudaOrdemEstruturas = mudaOrdemEstruturas;
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
                {id:1, ativo: false, img: 'vestiario1.png', desc: 'Vestiário Masculino', ordem: 1},
                {id:2, ativo: false, img: 'vestiario2.png', desc: 'Vestiário Feminino', ordem: 2},
                {id:3, ativo: false, img: 'estacionamento.png', desc: 'Estacionamento', ordem: 3},
                {id:4, ativo: false, img: 'lanchonete.png', desc: 'Lanchonete',  ordem: 5},
                {id:5, ativo: false, img: 'churrasqueira.png', desc: 'Churrasqueira', ordem: 6},
                {id:6, ativo: false, img: 'armario.png', desc: 'Armário Individual', ordem: 7},
                {id:7, ativo: false, img: 'playground.png', desc: 'Playground', ordem: 8},
                {id:8, ativo: false, img: 'seguranca.png', desc: 'Segurança Privada', ordem: 9},
                {id:9, ativo: false, img: 'wifi.png', desc: 'Wifi', ordem: 10},
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

        function mudaOrdemEstruturas(partTo) {
            for (var i = 0; i < partTo.length; i++) {
                partTo[i].ordem = (i + 1);
                vm.estruturaArena.$save(partTo[i]);
            }
        }
    }

})();

