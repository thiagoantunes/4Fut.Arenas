(function() {
    'use strict';

    angular
        .module('app.arena')
        .config(googleMaps)
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function googleMaps(uiGmapGoogleMapApiProvider) {
        uiGmapGoogleMapApiProvider.configure({
            v: '3.20',
            libraries: 'places'
        });
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
                    resolve: {
                        maps: ['uiGmapGoogleMapApi', function(uiGmapGoogleMapApi) {
                            return uiGmapGoogleMapApi;
                        }],
                        currentPosition: ['$q', function($q) {
                            var deferred = $q.defer();
                            navigator.geolocation.getCurrentPosition(function(position) {
                                deferred.resolve(position);
                            });
                            return deferred.promise;
                        }]
                    }
                }
            },
            {
                state: 'admin.arena.arena-profile',
                config: {
                    url: '/arena-profile',
                    templateUrl: 'app/arena/arena-profile.html'
                }
            },
            {
                state: 'admin.arena.arena-quadras',
                config: {
                    url: '/arena-quadras',
                    templateUrl: 'app/arena/arena-quadras.html',
                    controller:'QuadraCtrl',
                    controllerAs:'vm',
                }
            },
            {
                state: 'admin.arena.arena-funcionamento',
                config:{
                    url: '/arena-funcionamento',
                    templateUrl: 'app/arena/arena-funcionamento.html',
                    controller:'FuncionamentoCtrl',
                    controllerAs:'vm',
                }
            },
            {
                state: 'admin.arena.arena-contatos',
                config:{
                    url: '/arena-contatos',
                    templateUrl: 'app/arena/arena-contatos.html',
                    controller:'ContatosCtrl',
                    controllerAs:'vm',
                }
            }
        ];
    }
})();
