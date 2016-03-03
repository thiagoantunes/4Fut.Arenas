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
            state: 'admin.arena.album',
            config:{
                url: '/album',
                templateUrl: 'app/arena/album/album.html',
                controller:'AlbumCtrl',
                controllerAs:'vm',
            }
        }
        ];
    }
})();
