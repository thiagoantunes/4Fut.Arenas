(function() {
    'use strict';

    angular
    .module('app.arena')
    .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStatesAuthenticated(getStates());
    }

    function getStates() {
        return [
        {
            state: 'admin.arena.contatos',
            config:{
                url: '/contatos',
                templateUrl: 'app/arena/contatos/contatos.html',
                controller:'ContatosCtrl',
                controllerAs:'vm',
            }
        }];
    }
})();
