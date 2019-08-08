(function(window, angular) {
	'use strict';

	angular.module("app")
		.controller(
			'toolController', [
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
				function toolController($localStorage, $scope,$location, $log, $q, $rootScope,globalParam, $window,routeService, $http,moduleService) {
					
				
					// 表单分页
					var reGetProducts = function() {
						$http({
							url: moduleService.getServiceUrl() + "/edTools/list?time="+ new Date().getTime(),
							method: 'GET',
							params: {
								page: $scope.paginationConf.currentPage,
								size: $scope.paginationConf.itemsPerPage
							}
						}).success(
							function(resp) {
								$scope.paginationConf.totalItems = resp.data.total;
								$scope.moduleList = resp.data.list;
								// console.log($scope.moduleList);
							}).error(function(error) {});
					};
		
					// 配置分页基本参数
					$scope.paginationConf = {
						currentPage: $location.search().currentPage ? $location.search().currentPage : 1,
						itemsPerPage: $rootScope.toolSize == null ? 10 : $rootScope.toolSize,
						pagesLength: 5,
						perPageOptions: [5,10,20,50],
						onChange: function() {
							$location.search('currentPage', $scope.paginationConf.currentPage);
                            $rootScope.toolSize  = $scope.paginationConf.itemsPerPage;
						}
					};
					// 通过$watch currentPage和itemperPage,当他们一变化的时候，重新获取数据条目
					$scope.$watch('paginationConf.currentPage + paginationConf.itemsPerPage', reGetProducts);

					//表单删除
					$scope.toolDelete = function(id) {
						var layerIndex = layer.confirm('确定删除本条数据吗？', {
							btn: ['确定', '取消']
							// 按钮
						}, function() {
							$http({
								url: moduleService.getServiceUrl() + "/edTools/delete",
								method: "delete",
								params: {
									id: id
								}
							}).success(function success(res) {
									layer.msg('成功删除数据！', {time:1000});
									reGetProducts();	
								});
								layer.close(layerIndex);
							}, function() {
		
						});
					};			
					
					// 新增
					$scope.toolAdd = function() {
						routeService.route(587, false);
					};
					//详情
					$scope.toolDetail = function(id) {
						$http({
							url: moduleService.getServiceUrl() + "/edTools/detail?time="+ new Date().getTime(),
							method: "get",
							params: {
								id: id
							}
						}).success(
							function success(result) {
								globalParam.setter(result);
								routeService.route(588, false);
						});
					};
					//编辑
					$scope.toolEdit = function(id) {
						$http({
							url: moduleService.getServiceUrl() + "/edTools/detail?time="+ new Date().getTime(),
							method: "get",
							params: {
								id: id
							}
						}).success(
							function success(result) {
								globalParam.setter(result);
								routeService.route(589, false);
						});
					}

				}
			]);

})(window, angular);