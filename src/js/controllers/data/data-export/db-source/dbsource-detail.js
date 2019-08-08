(function(window, angular) {
	'use strict';

	angular.module("app")
		.controller(
			'sourceDetailCtrl', [
				'$localStorage',
				'$scope',
				'$location',
				'$log',
				'$q',
				'$rootScope',
				'globalParam',
				'$window',
				'routeService',
				'$http',
				'moduleService',
				function sourceDetailCtrl($localStorage, $scope,
					$location, $log, $q, $rootScope, globalParam, $window,
					routeService, $http,moduleService) {
						
					//获取当前数据
					// console.log(globalParam.getter());
					$scope.source_name=globalParam.getter().data.name;
					$scope.source_driver = globalParam.getter().data.driverClass;
					$scope.source_port = globalParam.getter().data.port;
					$scope.source_description = globalParam.getter().data.description;
					
					
					
					// 返回按钮
					$scope.back = function() {
						routeService.route(535, true);
					};
					// // 返回按钮
					// $scope.submit = function() {
					// 	routeService.route(535, true);
					// }

				}
			]);

})(window, angular);