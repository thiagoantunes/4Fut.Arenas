(function() {
    'use strict';

    angular
    .module('app.arena')
    .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStatesAuthenticated(getStates());
    }

    function getStates() {
        return [
        {
            state: 'admin.arena.quadras',
            config: {
                url: '/quadras',
                templateUrl: 'app/arena/quadras/quadras.html',
                controller:'QuadraCtrl',
                controllerAs:'vm',
                resolve: {
                    quadras: ['quadraService', function (quadraService) {
                        return quadraService.getQuadras().$loaded();
                    }]
                }
            }
        }];
    }
})();
