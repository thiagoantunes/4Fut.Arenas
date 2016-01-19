(function() {
    'use strict';

    angular
        .module('app.setup-arena')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStatesAuthenticated(getStates());
    }

    function getStates() {
        return [
            {
                state: 'admin.setup-arena',
                config: {
                    url: '/setup-arena',
                    controller:'SetupArenaCtrl',
                    controllerAs:'vm'
                }
            }
        ];
    }
})();
