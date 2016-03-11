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
            state: 'admin.arena.precos',
            config:{
                url: '/precos/{id}',
                templateUrl: 'app/arena/precos/precos.html',
                controller:'PrecosCtrl2',
                controllerAs:'vm',
                resolve: {
                    idQuadra: ['$stateParams', function ($stateParams) {
                        return $stateParams.id;
                    }]
                }
            }
        }
        ];
    }
})();
