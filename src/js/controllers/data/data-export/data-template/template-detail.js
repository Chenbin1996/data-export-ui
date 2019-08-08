(function(window, angular) {
	'use strict';

	angular.module("app")
		.controller(
			'dataDetailCtrl', [
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
				function dataDetailCtrl($localStorage, $scope,
					$location, $log, $q, $rootScope, globalParam, $window,
					routeService, $http,moduleService) {
						
					//获取当前数据
					$scope.template_name=globalParam.getter().data.templateName;
					$scope.description = globalParam.getter().data.description;
					$scope.creator = globalParam.getter().data.creator;
					$scope.create_time = globalParam.getter().data.createTime;
					$scope.conn_name=globalParam.getter().data.connectionName;
					$scope.db_type=globalParam.getter().data.typeName;
					$scope.db_url=globalParam.getter().data.dburl;		
					$scope.user_name=globalParam.getter().data.username;
					$scope.user_password=globalParam.getter().data.password;
					$scope.db_port=globalParam.getter().data.port;
					$scope.db_name=globalParam.getter().data.dbname;		
					
					
					// 返回按钮
					$scope.back = function() {
						routeService.route(534, true);
					}

				}
			]);

})(window, angular);