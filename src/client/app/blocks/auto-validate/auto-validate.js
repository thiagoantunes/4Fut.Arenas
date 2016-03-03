(function() {
    'use strict';

    angular
        .module('blocks.auto-validate')
        .run([
            'defaultErrorMessageResolver',
            function (defaultErrorMessageResolver) {
                defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
                    errorMessages['cpf'] = 'Informe um CPF válido';
                    errorMessages['cnpj'] = 'Informe um CNPJ válido';
                    errorMessages['required'] = 'Este campo é obrigatório';
                    errorMessages['email'] = 'Informe um email válido';
                    errorMessages['brPhoneNumber'] = 'Informe um telefone válido';
                    errorMessages['min'] = 'Informe número positivo.';
                });
            }
        ]);
}());
