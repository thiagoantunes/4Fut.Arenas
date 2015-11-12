(function() {
    'use strict';

    angular
        .module('app.home')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'root',
                config: {
                    url: '/',
                    templateUrl: 'app/home/home.html',
                    controller: 'HomeCtrl',
                    controllerAs: 'vm',
                }
            }
        ];
    }
})();
