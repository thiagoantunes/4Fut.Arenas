(function() {
    'use strict';

    angular
      .module('app.login')
      .controller('LoginCtrl', LoginCtrl);

    LoginCtrl.$inject = [
        '$scope',
        'Auth',
        '$location',
        '$q' ,
        'Ref',
        '$timeout' ,
        '$firebaseObject' ,
        'logger',
        'cfpLoadingBar'];

    function LoginCtrl(
        $scope,
        Auth,
        $location,
        $q,
        Ref,
        $timeout,
        $firebaseObject,
        logger,
        cfpLoadingBar) {

        $scope.login = 1;
        $scope.register = 0;
        $scope.forgot = 0;

        $scope.oauthLogin = function(provider) {
            $scope.err = null;
            Auth.$authWithOAuthPopup(provider, {rememberMe: true , scope: 'email'}).then(redirect, showError);
        };

        $scope.anonymousLogin = function() {
            $scope.err = null;
            Auth.$authAnonymously({rememberMe: true}).then(redirect, showError);
        };

        $scope.passwordLogin = function(email, pass) {
            $scope.err = null;
            cfpLoadingBar.start();
            Auth.signInWithEmailAndPassword(email, pass).then(
              redirect, showError
            );
        };

        $scope.recoverPassword = function(email) {
            cfpLoadingBar.start();
            Ref.resetPassword({
                email: email
            }, function(error) {
                cfpLoadingBar.complete();
                if (error) {
                    switch (error.code) {
                        case 'INVALID_USER':
                            logger.error('Não existe um usuário cadastrado com esse email.');
                            break;
                        default:
                            logger.error('Erro ao redefinir a senha:', error);
                    }
                } else {
                    logger.success('Email de recuperação de senha enviado com sucesso!');
                }
            });
        };

        $scope.createAccount = function(email, pass, confirm) {
            $scope.err = null;
            if (!pass) {
                $scope.err = 'Please enter a password';
            }
            else if (pass !== confirm) {
                $scope.err = 'Passwords do not match';
            }
            else {
                Auth.$createUser({email: email, password: pass})
          .then(function () {
              // authenticate so we have permission to write to Firebase
              return Auth.$authWithPassword({email: email, password: pass}, {rememberMe: true});
          })
          .then(createProfile)
          .then(redirect, showError);
            }

            function createProfile(user) {
                var ref = Ref.child('users', user.uid), def = $q.defer();
                ref.set({email: email, name: firstPartOfEmail(email)}, function(err) {
                    $timeout(function() {
                        if (err) {
                            def.reject(err);
                        }
                        else {
                            def.resolve(ref);
                        }
                    });
                });
                return def.promise;
            }
        };

        function firstPartOfEmail(email) {

            return ucfirst(email.substr(0, email.indexOf('@')) || '');
        }

        function ucfirst (str) {
            // inspired by: http://kevin.vanzonneveld.net
            str += '';
            var f = str.charAt(0).toUpperCase();
            return f + str.substr(1);
        }

        function redirect(user) {
            var userRef = Ref.child('users/' + user.uid);

            userRef.once('value', function(snapUser) {
                if (snapUser.hasChild('arena')) {
                    var arenaRef = Ref.child('arenas/' + snapUser.val().arena);
                    arenaRef.once('value', function(snapArena) {
                        if (snapArena.hasChild('staff/' + user.uid)) {
                            cfpLoadingBar.complete();
                            $location.path('/agenda');
                            $scope.$apply();
                        }
                        else {
                            cfpLoadingBar.complete();
                            logger.error('Usuário não cadastrado na arena ');
                            Auth.signOut();
                        }
                    });
                }
                else {
                    cfpLoadingBar.complete();
                    logger.error('Usuário não cadastrado na arena ');
                    Auth.signOut();
                }
            });
        }

        function showError(err) {
            cfpLoadingBar.complete();
            if (err.code === 'auth/wrong-password') {
                logger.error('O e-mail ou senha inserido não corresponde a nenhuma conta.');
            }
            if (err.code === 'auth/user-not-found') {
                logger.error('Usuário não existe!');
            }
        }
    }

})();
