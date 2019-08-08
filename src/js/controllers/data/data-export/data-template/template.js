(function(window, angular) {
	'use strict';

	angular.module("app")
		.controller(
			'dataController', [
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
				function dataController($localStorage, $scope,$location, $log, $q, $rootScope,globalParam, $window,routeService, $http,moduleService) {

                    //从域中获取模块信息
                    var app = localStorage["ngStorage-application"];
                    var appId;
                    if (app){
                        appId = JSON.parse(localStorage["ngStorage-application"]).appId;
                    }
					// 表单分页
					var reGetProducts = function() {
						$http({
							url: moduleService.getServiceUrl() + "/edTemplate/list?time="+ new Date().getTime(),
							method: 'GET',
							params: {
								page: $scope.paginationConf.currentPage,
								size: $scope.paginationConf.itemsPerPage,
								templateName:$scope.find_name == null ? '' :  $scope.find_name,
                                appId: appId == null || appId == '' ? null : appId
							}
						}).success(
							function(resp) {
								$scope.paginationConf.totalItems = resp.data.total;
								$scope.moduleList = resp.data.list;
							}).error(function(error) {});
					};
		
					// 配置分页基本参数
					$scope.paginationConf = {
						currentPage: $location.search().currentPage ? $location.search().currentPage : 1,
						itemsPerPage: $rootScope.tempSize == null ? 10 : $rootScope.tempSize,
						pagesLength: 5,
						perPageOptions: [5,10,20,50],
						onChange: function() {
							$location.search('currentPage', $scope.paginationConf.currentPage);
                            $rootScope.tempSize  = $scope.paginationConf.itemsPerPage;
						}
					};
					// 通过$watch currentPage和itemperPage,当他们一变化的时候，重新获取数据条目
					$scope.$watch('paginationConf.currentPage + paginationConf.itemsPerPage', reGetProducts);

					//表单删除
					$scope.moduleDelete = function(id) {
						var layerIndex = layer.confirm('确定删除本条数据吗？', {
							btn: ['确定', '取消']
							// 按钮
						}, function() {
							$http({
								url: moduleService.getServiceUrl() + "/edTemplate/delete",
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
					
					
					//搜索
					$scope.find = function() {
                        reGetProducts();
                        $scope.paginationConf.currentPage = 1;
                        $('.page-num').val($scope.paginationConf.currentPage);
					};
				
					
					// 新增
					$scope.dataAdd = function() {
						routeService.route(580, false);
					}
					//详情
					$scope.dataDetail = function(id) {
						$http({
							url: moduleService.getServiceUrl() + "/edTemplateDbconfig/detail?time="+ new Date().getTime(),
							method: "get",
							params: {
								id: id
							}
						}).success(
							function success(result) {
								globalParam.setter(result);
								routeService.route(581, false);
						});
					};
					//编辑
					$scope.dataEdit = function(id) {
						$http({
							url: moduleService.getServiceUrl() + "/edTemplateDbconfig/detail?time="+ new Date().getTime(),
							method: "get",
							params: {
								id: id
							}
						}).success(
							function(result) {
								if(result.resCode === 1){
									globalParam.setter(result);
									routeService.route(582, false);
								}else{
									layer.msg(res.resMsg,{time:3000});
								}
								
						}).error(function(res){
							layer.msg("服务器异常！",{time:3000});
						});
					};
					//选择表
					$scope.tableEdit = function(id){
						globalParam.setter(id);
						routeService.route(590, false);
					}
					//选择表字段
					$scope.tableFieldEdit = function(id){
						globalParam.setter(id);
						routeService.route(591, false);
					}
					//模板字段选择
					$scope.fieldEdit = function(id){
						globalParam.setter(id);
						routeService.route(586, false);
					}

				}
			]);

})(window, angular);