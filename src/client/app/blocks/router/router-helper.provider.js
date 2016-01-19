/* Help configure the state-base ui.router */
(function() {
    'use strict';

    angular
        .module('blocks.router')
        .provider('routerHelper', routerHelperProvider)
        .constant('SECURED_ROUTES', {})
        .factory('subdomainService' , subdomainService)
        .run(run);

    routerHelperProvider.$inject = ['$locationProvider', '$stateProvider', '$urlRouterProvider', 'SECURED_ROUTES'];
    run.$inject = ['$rootScope', '$state', 'Auth', 'SECURED_ROUTES' , 'loginRedirectPath' ,  'subdomainService'];
    subdomainService.$inject = ['$location'];
    /* @ngInject */
    function routerHelperProvider($locationProvider, $stateProvider, $urlRouterProvider, SECURED_ROUTES) {
        /* jshint validthis:true */
        var config = {
            docTitle: undefined,
            resolveAlways: {}
        };
        $urlRouterProvider.when('', '/');
        // $urlRouterProvider.otherwise('/404');
        // $locationProvider.html5Mode(true);

        this.configure = function(cfg) {
            angular.extend(config, cfg);
        };

        this.$get = RouterHelper;
        RouterHelper.$inject = ['$location', '$rootScope', '$state', 'logger'];
        /* @ngInject */
        function RouterHelper($location, $rootScope, $state, logger) {
            var handlingStateChangeError = false;
            var hasOtherwise = false;
            var stateCounts = {
                errors: 0,
                changes: 0
            };

            var service = {
                configureStates: configureStates,
                configureStatesAuthenticated: configureStatesAuthenticated,
                getStates: getStates,
                stateCounts: stateCounts
            };

            init();

            return service;

            ///////////////

            function configureStates(states, otherwisePath) {
                states.forEach(function(state) {
                    state.config.resolve =
                        angular.extend(state.config.resolve || {}, config.resolveAlways);
                    $stateProvider.state(state.state, state.config);
                });
                if (otherwisePath && !hasOtherwise) {
                    hasOtherwise = true;
                    $urlRouterProvider.otherwise(otherwisePath);
                }
            }

            function configureStatesAuthenticated(statesAuthenticated) {
                statesAuthenticated.forEach(function(stateAuth) {
                    stateAuth.config.resolve =
                        angular.extend(stateAuth.config.resolve || {}, config.resolveAlways);
                    $stateProvider.stateAuthenticated(stateAuth.state, stateAuth.config);
                });
            }

            function handleRoutingErrors() {
                // Route cancellation:
                // On routing error, go to the dashboard.
                // Provide an exit clause if it tries to do it twice.
                $rootScope.$on('$stateChangeError',
                    function(event, toState, toParams, fromState, fromParams, error) {
                        if (handlingStateChangeError) {
                            return;
                        }
                        stateCounts.errors++;
                        handlingStateChangeError = true;
                        var destination = (toState &&
                                (toState.title || toState.name || toState.loadedTemplateUrl)) ||
                            'unknown target';
                        var msg = 'Error routing to ' + destination + '. ' +
                            (error.data || '') + '. <br/>' + (error.statusText || '') +
                            ': ' + (error.status || '');
                        logger.warning(msg, [toState]);
                        $location.path('/');
                    }
                );
            }

            function init() {
                handleRoutingErrors();
                updateDocTitle();
            }

            function getStates() {
                return $state.get();
            }

            function updateDocTitle() {
                $rootScope.$on('$stateChangeSuccess',
                    function(event, toState, toParams, fromState, fromParams) {
                        stateCounts.changes++;
                        handlingStateChangeError = false;
                        var title = config.docTitle + ' ' + (toState.title || '');
                        $rootScope.title = title; // data bind to <title>
                    }
                );
            }
        }

        $stateProvider.stateAuthenticated = function(path, route) {
            route.resolve = route.resolve || {};
            route.resolve.user = ['Auth', function(Auth) {
                return Auth.$requireAuth();
            }];
            route.resolve.arena = ['subdomainService', function(subdomainService) {
                return subdomainService.arena;
            }];
            $stateProvider.state(path, route);
            SECURED_ROUTES[path] = true;
            return $stateProvider;
        };
    }

    function run($rootScope, $state, Auth, SECURED_ROUTES, loginRedirectPath ,subdomainService) {
        // watch for login status changes and redirect if appropriate
        Auth.$onAuth(check);

        $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
            if (error === 'AUTH_REQUIRED') {
                $state.go(loginRedirectPath);
            }
        });

        $rootScope.$on('$stateChangeStart', function(evt, toState, toParams, fromState, fromParams) {

            if (subdomainService.arena && !toState.name.startsWith('admin') && toState.name !== loginRedirectPath) {
                evt.preventDefault();
                $state.go('admin');
            }
            else if (!subdomainService.arena  && toState.name.startsWith('admin')) {
                evt.preventDefault();
                $state.go('root');
            }

            if (toState.redirectTo) {
                evt.preventDefault();
                $state.go(toState.redirectTo, toParams);
            }
        });

        function check(user) {
            if (!user && authRequired($state.current.name)) {
                $state.go(loginRedirectPath);
            }
        }

        function authRequired(path) {
            return SECURED_ROUTES.hasOwnProperty(path);
        }
    }

    function subdomainService($location) {
        var service = {};
        var host = $location.host();

        if (host.indexOf('.') >= 0) {
            var hostName = host.split('.')[0];
            if (hostName !== '4fut' && hostName !== 'www') {
                service.arena = host.split('.')[0];
            }
        }
        console.log(service.arena);
        return service;
    }

})();
