(function() {
    'use strict';

    angular
    .module('app.agenda')
    .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStatesAuthenticated(getStates());
    }

    function getStates() {
        return [
            {
                state: 'admin.agenda',
                config: {
                    url: '/agenda',
                    templateUrl: 'app/agenda/agenda.html',
                    controller:'ReservasCtrl',
                    controllerAs:'vm',
                    resolve: {
                        quadras: ['quadraService', 'arena', function (quadraService, arena) {
                            return quadraService.getQuadras().$loaded();
                        }]
                    }
                }
            },
        ];
    }
})();
