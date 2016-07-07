(function() {
    'use strict';

    angular
    .module('app.sistema-arena')
    .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'sistema-arena.confirmacao-cadastro',
                config: {
                    url: '/confirmacao-cadastro',
                    templateUrl: 'app/cadastro/confirmacao-cadastro.html',
                }
            },
        ];
    }
})();
