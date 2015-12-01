/*global $:false */
(function() {
    'use strict';

    angular
        .module('app.reservas')
        .controller('EscolinhasCtrl', EscolinhasCtrl);

    EscolinhasCtrl.$inject = ['$scope' , 'quadraService'];

    function EscolinhasCtrl($scope, quadraService) {
        var vm = this;
        vm.quadras = quadraService.getQuadras();

        activate();

        function activate() {
            
        }

        $scope.panels = [
          {
            "title": "Collapsible Group Item #1",
            "body": "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch."
          },
          {
            "title": "Collapsible Group Item #2",
            "body": "Food truck fixie locavore, accusamus mcsweeney's marfa nulla single-origin coffee squid. Exercitation +1 labore velit, blog sartorial PBR leggings next level wes anderson artisan four loko farm-to-table craft beer twee."
          },
          {
            "title": "Collapsible Group Item #3",
            "body": "Etsy mixtape wayfarers, ethical wes anderson tofu before they sold out mcsweeney's organic lomo retro fanny pack lo-fi farm-to-table readymade."
          }
        ];
    }

})();