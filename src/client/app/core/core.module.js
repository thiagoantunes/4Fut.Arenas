(function () {
    'use strict';

    angular
        .module('app.core', [
            'ngAnimate', 'ngSanitize',
            'ngSanitize',
            'blocks.exception', 'blocks.logger', 'blocks.router',
            'firebase', 'firebase.ref', 'firebase.auth',
            'ui.router', 'ui.bootstrap', 'ui.calendar', 'ngplus',
            'oc.lazyLoad' , 'angular-loading-bar', 'uiGmapgoogle-maps', 'localytics.directives',
            'mgcrea.ngStrap'
        ]);
})();
