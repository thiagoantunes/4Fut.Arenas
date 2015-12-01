(function() {
    'use strict';

    angular
    .module('app.arena')
    .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
        {
            state: 'admin.arena',
            config: {
                url: '/arena',
                templateUrl: 'app/arena/arena.html',
                controller:'ArenaCtr',
                controllerAs:'vm',
                redirectTo: 'admin.arena.arena-profile',
            }
        },
        {
            state: 'admin.arena.arena-profile',
            config: {
                url: '/arena-profile',
                templateUrl: 'app/arena/arena-profile.html'
            }
        }
        ];
    }
})();
