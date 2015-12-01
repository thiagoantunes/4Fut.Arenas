(function () {
    'use strict';

    angular
        .module('app.core', [
            'ngAnimate', 'ngSanitize', 'ngAria',
            'ngSanitize',
            'blocks.exception', 'blocks.logger', 'blocks.router',
            'firebase', 'firebase.ref', 'firebase.auth',
            'ui.router',  'ui.calendar', 'ngplus', 'mgcrea.ngStrap',
            'oc.lazyLoad' , 'angular-loading-bar',  'localytics.directives',
            'mgcrea.ngStrap' , 'jcs-autoValidate'
        ]);
})();
