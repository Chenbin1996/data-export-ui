(function(window, angular) {
	'use strict';

	angular.module("app")
		.controller(
			'toolDetailCtrl', [
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
				function toolDetailCtrl($localStorage, $scope,
					$location, $log, $q, $rootScope, globalParam, $window,
					routeService, $http,moduleService) {
						
					//获取当前数据
					// console.log(globalParam.getter());
					$scope.tool_name=globalParam.getter().data.name;
					$scope.tool_type = globalParam.getter().data.typeName;
					$scope.tool_className = globalParam.getter().data.className;
					$scope.tool_creator = globalParam.getter().data.userName;
					$scope.tool_createTime = globalParam.getter().data.createTime;
					$scope.tool_description = globalParam.getter().data.description;
					
					
					// 返回按钮
					$scope.back = function() {
						routeService.route(536, true);
					};
					// // 确定按钮
					// $scope.submit = function() {
					// 	routeService.route(536, true);
					// }

				}
			]);

})(window, angular);