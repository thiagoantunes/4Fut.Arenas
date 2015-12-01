(function() {
    'use strict';

    angular
    .module('app.arena')
    .controller('ArenaCtr', ArenaCtr);

    ArenaCtr.$inject = ['$scope', 'arenaService'];

    function ArenaCtr($scope, arenaService) {
        arenaService.getArena().$bindTo($scope, 'arena');  
        $scope.address = 'current'; 

        $scope.myImage='';
        $scope.myCroppedImage='';
        $scope.uploadImage = function (evt) {
            var file=evt.currentTarget.files[0];
            var reader = new FileReader();
            reader.onload = function (evt) {
              $scope.$apply(function($scope){
                $scope.myImage=evt.target.result;
              });
            };
            reader.readAsDataURL(file);
        }
    }

})();

