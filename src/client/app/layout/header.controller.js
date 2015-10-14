(function() {
	'use strict';

	angular
	.module('app.layout')
	.controller('HeaderController', HeaderController);

	HeaderController.$inject = ['$scope', '$location'];
	/* @ngInject */
	function HeaderController($scope, $location) 
	{ 
		$scope.isActive = function (viewLocation) { 
			return viewLocation === $location.path();
		};
	}
})();