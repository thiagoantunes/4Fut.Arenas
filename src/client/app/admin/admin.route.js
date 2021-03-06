(function() {
    'use strict';

    angular
        .module('app.admin')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStatesAuthenticated(getStates());
    }

    function getStates() {
        return [
            {
                state: 'admin',
                config: {
                    url: '',
                    templateUrl: 'app/admin/admin.html',
                    redirectTo: 'admin.agenda',
                    controller: 'AdminController',
                    controllerAs: 'hctrl',
                },
            }
        ];
    }
})();
