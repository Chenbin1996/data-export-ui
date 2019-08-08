(function(window, angular) {
	'use strict';

	angular.module("app")
		.controller(
			'logDetailCtrl', [
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
				function logDetailCtrl($localStorage, $scope,
					$location, $log, $q, $rootScope, globalParam, $window,
					routeService, $http,moduleService) {
						
					//获取当前数据
					$scope.template_name=globalParam.getter().data.templateName;
					$scope.creator_id = globalParam.getter().data.creatorId;
					$scope.expoort_time = globalParam.getter().data.expoortTime;
					$scope.dburl = globalParam.getter().data.dburl;
					$scope.port=globalParam.getter().data.port;
					$scope.dbname=globalParam.getter().data.dbname;
					$scope.table_name=globalParam.getter().data.tableName;		
					$scope.status=globalParam.getter().data.stateName;
					$scope.total_count=globalParam.getter().data.totalCount;
					
					// 返回按钮
					$scope.back = function() {
						routeService.route(538, true);
					}


				}
			]);

})(window, angular);