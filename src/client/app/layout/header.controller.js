(function() {
	'use strict';

	angular
	.module('app.layout')
	.controller('HeaderController', HeaderController);

	HeaderController.$inject = ['$scope', '$location', 'Auth'];
	/* @ngInject */
	function HeaderController($scope, $location, Auth) 
	{ 
		var vm = this;
		vm.logout = function() { 
			Auth.$unauth(); 
		};

		$scope.isActive = function (viewLocation) { 
			return viewLocation === $location.path();
		};
	}
})();