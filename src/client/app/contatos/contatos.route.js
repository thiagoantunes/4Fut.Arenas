(function() {
    'use strict';

    angular
    .module('app.contatos')
    .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStatesAuthenticated(getStates());
    }

    function getStates() {
        return [
        {
            state: 'admin.contatos',
            config:{
                url: '/contatos',
                templateUrl: 'app/contatos/contatos.html',
                controller:'ContatosCtrl',
                controllerAs:'vm',
            }
        }];
    }
})();
