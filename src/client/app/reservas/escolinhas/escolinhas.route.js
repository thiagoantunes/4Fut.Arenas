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
                state: 'admin.reservas.escolinhas',
                config: {
                    url: '/escolinhas',
                    templateUrl: 'app/reservas/escolinhas/escolinhas.html',
                    controller:'EscolinhasCtrl',
                    controllerAs:'vm'
                }
            },
        ];
    }
})();
