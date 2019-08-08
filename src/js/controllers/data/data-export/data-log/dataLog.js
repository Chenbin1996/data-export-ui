(function(window, angular) {
	'use strict';

	angular.module("app")
		.controller(
			'logController', [
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
				function logController($localStorage, $scope,$location, $log, $q, $rootScope,globalParam, $window,routeService, $http,moduleService) {
					
				
					// 表单分页
					var reGetProducts = function() {
						$http({
							url: moduleService.getServiceUrl() + "/edLog/list?time="+ new Date().getTime(),
							method: 'GET',
							params: {
								page: $scope.paginationConf.currentPage,
								size: $scope.paginationConf.itemsPerPage,
								name:$scope.find_name
							}
						}).success(
							function(resp) {
								$scope.paginationConf.totalItems = resp.data.total;
								$scope.logList = resp.data.list;
								// console.log($scope.logList);
							}).error(function(error) {});
					};
		
					// 配置分页基本参数
					$scope.paginationConf = {
						currentPage: $location.search().currentPage ? $location.search().currentPage : 1,
						itemsPerPage: $rootScope.logSize == null ? 10 : $rootScope.logSize,
						pagesLength: 5,
						perPageOptions: [5,10,20,50],
						onChange: function() {
							$location.search('currentPage', $scope.paginationConf.currentPage);
                            $rootScope.logSize  = $scope.paginationConf.itemsPerPage;
						}
					};
					// 通过$watch currentPage和itemperPage,当他们一变化的时候，重新获取数据条目
					$scope.$watch('paginationConf.currentPage + paginationConf.itemsPerPage', reGetProducts);

					//根据模板名称搜索
					$scope.find = function () {
                        $http({
                            url: moduleService.getServiceUrl() + "/edLog/list?time="+ new Date().getTime(),
                            method: 'GET',
                            params: {
                                page: $scope.paginationConf.currentPage,
                                size: $scope.paginationConf.itemsPerPage,
								name:$scope.find_name
                            }
                        }).success(
                            function(resp) {
                                $scope.paginationConf.totalItems = resp.data.total;
                                $scope.logList = resp.data.list;
                                $scope.paginationConf.currentPage = 1;
                                 $('.page-num').val($scope.paginationConf.currentPage);
                            }).error(function(error) {});
                    };
			        
					// 重置
                    $scope.refresh = function () {
                        $scope.find_name = ''
                    };
                    
					//详情
					$scope.logDetail = function(id) {
						$http({
							url: moduleService.getServiceUrl() + "/edLog/detail?time="+ new Date().getTime(),
							method: "get",
							params: {
								id: id
							}
						}).success(
							function success(result) {
								globalParam.setter(result);
								routeService.route(560, false);
						});
					};
					
					//编辑
					$scope.logToData = function(log) {
						
						var layerIndex = layer.confirm('是否进入数据导入页面？', {
							btn: ['前往', '返回']
							// 按钮
						}, function() {
							globalParam.setter(log);
							routeService.route(537, true);	
							layer.close(layerIndex);
						}, function() {
		
						});
					};
					
					//是否可以跳转数据导入页面
					$scope.isToData = function(log){
						if(log.status != 1){
							return false;
						}
						return true;
					}
					
				}
			]);

})(window, angular);