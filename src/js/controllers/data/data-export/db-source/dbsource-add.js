(function(window, angular) {
	'use strict';

	angular.module("app")
		.controller(
			'dbsourceAddCtrl', [
				'$localStorage',
				'$scope',
				'$location',
				'$log',
				'$q',
				'$rootScope',
				'$window',
				'routeService',
				'$http',
				'moduleService',
				function dbsourceAddCtrl($localStorage, $scope,$location, $log, $q, $rootScope, $window,routeService, $http,moduleService) {



					$scope.repeat = false;

					$scope.isRepeat = function(){
						$http({
                            method:'get',
                            url:moduleService.getServiceUrl() + "/edDbtype/isRepeat?time="+ new Date().getTime(),
                            params:{
                                name:$scope.source_name
                            }
						}).success(function(res){
							if(res.resCode === 1){
                                $scope.repeat = false;
							}else {
                                $scope.repeat = true;
							}
						}).error();
					};

					//判断数据库驱动格式是否正确
					var driver_re = /^([a-zA-Z0-9]+)(\.[a-zA-Z0-9]+)*(\.[a-zA-Z0-9]+)$/;
					$scope.checkDriver = function (driver) {
						if(! driver_re.test(driver)){
							layer.msg("错误的数据库驱动格式:<br>示例:com.mysql.jdbc.Driver",{time:3000});
							return false;
						}
						return true;
                    };
					//判断端口格式是否正确
					$scope.checkPort = function (port) {
                        if(port == null || port === ''){
                            return false;
                        }
						if(isNaN(port) || port.length < 4 || port.length > 6){
                            layer.msg("端口请输入数字，长度4-6位:<br>示例:3306",{time:3000});
                            return false;
						}
						return true;
                    };

					//新增字段检查
					var checkFidle  =function(){
						if($scope.source_name == null || $scope.source_name === ''){
							layer.msg('请填写数据库源名称！',{time:2000});
							return false;
						}
						if($scope.repeat){
                            layer.msg('数据库源名称已存在，请重新填写！',{time:2000});
                            return false;
						}
						if($scope.source_driver == null || $scope.source_driver === ''){
							layer.msg('请填写数据库源驱动！',{time:2000});
							return false;
						}
                        if(! $scope.checkDriver($scope.source_driver)){
                            return false;
                        }
						if($scope.source_port == null || $scope.source_port === '' ){
							layer.msg('请填写数据库源默认端口！',{time:2000});
							return false;
						}
						if(! $scope.checkPort($scope.source_port)){
							return false;
						}
						return true;
					};
					
					
					//保存配置
					$scope.source_add = function(){
						var flag = checkFidle();
						// console.log(flag);
						if(flag){
							$http({
								method:'post',
								url:moduleService.getServiceUrl() + "/edDbtype/add",
								params:{
									name:$scope.source_name,
									driverClass:$scope.source_driver,
									port:$scope.source_port,
									description:$scope.description
								},
							}).success(
								function(res){
									if(res.resCode == 1){
										layer.msg('成功新增一条数据！',{time:3000});
										routeService.route(535, true);
									}else{
										layer.msg('新增出现错误，请稍后重试！',{time:3000});
									}
								}
							);
						}
					}
					
					// 返回按钮
					$scope.back = function() {
						routeService.route(535, true);
					}

				}
			]);

})(window, angular);