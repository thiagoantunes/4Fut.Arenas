(function() {
    'use strict';

    angular
    .module('app.escolinhas')
    .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStatesAuthenticated(getStates());
    }

    function getStates() {
        return [
        {
            state: 'admin.escolinhas',
            config:{
                url: '/escolinhas',
                templateUrl: 'app/escolinhas/escolinhas.html',
                controller:'EscolinhasCtrl',
                controllerAs:'vm',
            }
        }];
    }
})();
