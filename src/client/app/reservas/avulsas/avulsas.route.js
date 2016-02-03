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
                state: 'admin.reservas.avulsas',
                config: {
                    url: '/avulsas',
                    templateUrl: 'app/reservas/avulsas/avulsas.html',
                    controller:'AvulsasCtrl',
                    controllerAs:'vm'
                }
            },
        ];
    }
})();
