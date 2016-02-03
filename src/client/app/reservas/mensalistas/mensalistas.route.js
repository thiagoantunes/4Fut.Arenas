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
                state: 'admin.reservas.mensalistas',
                config: {
                    url: '/mensalistas',
                    templateUrl: 'app/reservas/mensalistas/mensalistas.html',
                    controller:'MensalistasCtrl',
                    controllerAs:'vm'
                }
            },
        ];
    }
})();
