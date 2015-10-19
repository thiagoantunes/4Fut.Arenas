/* Help configure the state-base ui.router */
(function() {
    'use strict';

    angular
        .module('blocks.router')
        .provider('routerHelper', routerHelperProvider)
        .run(run)
        .constant('SECURED_ROUTES', {});

    routerHelperProvider.$inject = ['$locationProvider', '$stateProvider', '$urlRouterProvider', 'SECURED_ROUTES'];
    /* @ngInject */
    function routerHelperProvider($locationProvider, $stateProvider, $urlRouterProvider, SECURED_ROUTES) {
        /* jshint validthis:true */
        var config = {
            docTitle: undefined,
            resolveAlways: {}
        };

        $locationProvider.html5Mode(true);

        $stateProvider.stateAuthenticated = function(path, route) {
            route.resolve = route.resolve || {};
            route.resolve.user = ['Auth', function(Auth) {
                return Auth.$requireAuth();
            }];
            $stateProvider.state(path, route);
            SECURED_ROUTES[path] = true;
            return $stateProvider;
        };

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
    }

    function run($rootScope, $state, Auth, SECURED_ROUTES, loginRedirectPath) {
        // watch for login status changes and redirect if appropriate
        Auth.$onAuth(check);

        $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
            if (error === 'AUTH_REQUIRED') {
                $state.go(loginRedirectPath);
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

})();