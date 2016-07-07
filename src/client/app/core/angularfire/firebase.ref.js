angular.module('firebase.ref', [])
  .factory('Ref', [function() {
      'use strict';
      return firebase.database().ref();
  }]);
