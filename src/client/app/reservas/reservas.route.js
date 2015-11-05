(function() {
    'use strict';

    angular
    .module('app.reservas')
    .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStatesAuthenticated(getStates());
    }

    function getStates() {
        return [
            {
                state: 'arenas',
                config: {
                    url: '/arenas',
                    templateUrl: 'app/core/main.html',
                }
            },
            {
                state: 'arenas.reservas',
                config: {
                    url: '/reservas',
                    templateUrl: 'app/reservas/reservas.html',
                    controller:'ReservasCtrl',
                    controllerAs:'vm'
                }
            }
        ];
    }
})();
