'use strict';
// Source: dist/.temp/brasil/filters/cep.js
angular.module('app.core').filter('cep', function () {
    return function (input) {
        var str = input + '';
        str = str.replace(/\D/g, '');
        str = str.replace(/^(\d{2})(\d{3})(\d)/, '$1.$2-$3');
        return str;
    };
});
// Source: dist/.temp/brasil/filters/cnpj.js
angular.module('app.core').filter('cnpj', function () {
    return function (input) {
        // regex créditos Matheus Biagini de Lima Dias
        var str = input + '';
        str = str.replace(/\D/g, '');
        str = str.replace(/^(\d{2})(\d)/, '$1.$2');
        str = str.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        str = str.replace(/\.(\d{3})(\d)/, '.$1/$2');
        str = str.replace(/(\d{4})(\d)/, '$1-$2');
        return str;
    };
});
// Source: dist/.temp/brasil/filters/cpf.js
angular.module('app.core').filter('cpf', function () {
    return function (input) {
        var str = input + '';
        str = str.replace(/\D/g, '');
        str = str.replace(/(\d{3})(\d)/, '$1.$2');
        str = str.replace(/(\d{3})(\d)/, '$1.$2');
        str = str.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        return str;
    };
});
// Source: dist/.temp/brasil/filters/tel.js
angular.module('app.core').filter('tel', function () {
    return function (input) {
        var str = input + '';
        str = str.replace(/\D/g, '');
        if (str.length === 11) {
            str = str.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else {
            str = str.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return str;
    };
});
