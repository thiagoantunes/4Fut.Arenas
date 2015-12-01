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
            state: 'admin.arena.funcionamento',
            config:{
                url: '/funcionamento',
                templateUrl: 'app/arena/funcionamento/funcionamento.html',
                controller:'FuncionamentoCtrl',
                controllerAs:'vm',
            }
        }
        ];
    }
})();
