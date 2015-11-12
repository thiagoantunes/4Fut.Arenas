(function() {
    'use strict';

    angular
        .module('app.nova-arena')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStatesAuthenticated(getStates());
    }

    function getStates() {
        return [
            {
                state: 'nova-arena',
                config: {
                    url: '/nova-arena?arena&responsavel',
                    templateUrl: 'app/nova-arena/nova-arena.html',
                    controller:'NovaArenaCtrl',
                    controllerAs:'vm'
                }
            }
        ];
    }
})();
