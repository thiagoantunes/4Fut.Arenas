(function() {
    'use strict';

    angular
      .module('app.login')
      .controller('LoginCtrl', LoginCtrl);

    LoginCtrl.$inject = ['$scope', 'Auth', '$location', '$q' , 'Ref', '$timeout' ,'$firebaseObject' , 'subdomainService'];

    function LoginCtrl($scope, Auth, $location, $q, Ref, $timeout, $firebaseObject, subdomainService) {

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
            Auth.$authWithPassword({email: email, password: pass}, {rememberMe: true}).then(
              redirect, showError
            );
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
            var arena = Ref.child('arenas/' + subdomainService.arena);

            arena.once('value', function(snapshot) {
                if (snapshot.hasChild('staff/' + user.uid)) {
                    if (snapshot.val().configurado) {
                        $location.path('/admin/agenda');
                        $scope.$apply();
                    }
                    else {
                        $location.path('/admin/setup-arena');
                        $scope.$apply();
                    }
                }
                else {
                    Auth.$unauth();
                }
            });
        }

        function showError(err) {
            $scope.err = err;
        }
    }

})();
