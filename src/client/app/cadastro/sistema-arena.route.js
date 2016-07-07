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
                state: 'sistema-arena',
                config: {
                    url: '',
                    template: '<data ui-view></data>',
                    controller:'SistemaArenaCtrl',
                    controllerAs:'vm',
                    abstract: true
                }
            },
            {
                state: 'sistema-arena.cadastro',
                config: {
                    url: '/cadastro',
                    templateUrl: 'app/cadastro/sistema-arena.html',
                }
            },
        ];
    }
})();
