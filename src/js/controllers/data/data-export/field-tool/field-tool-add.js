(function(window, angular) {
	'use strict';

	angular.module("app")
		.controller(
			'toolAddCtrl', [
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
				function toolAddCtrl($localStorage, $scope,$location, $log, $q, $rootScope, $window,routeService, $http,moduleService) {
			

					$scope.repeat = false;

					//校验校验器全限定名称格式
					var tool_re = /^([a-zA-Z]+)(\.[a-zA-Z]+)*(\.[a-zA-Z]+)$/;
					$scope.checkTool = function (toolName) {
						if(! tool_re.test(toolName)){
                            layer.msg("错误的校验器全限定名称格式:<br>示例:com.data.NullCheck",{time:3000});
                            return false;
						}
						return true;
                    };
					
					$scope.isRepeat = function () {
                        $http({
                            method:'get',
                            url:moduleService.getServiceUrl() + "/edTools/isRepeat?time="+ new Date().getTime(),
                            params:{
                                name:$scope.tool_name
                            }
                        }).success(function(res){
                            if(res.resCode === 1){
                                $scope.repeat = false;
                            }else {
                                $scope.repeat = true;
                            }
                        }).error();
                    };
					
					//新增字段检查
					var checkFidle  =function(){
						if($scope.tool_name == null || $scope.tool_name === ''){
							layer.msg('请填写名称！',{time:2000});
							return false;
						}
						if($scope.repeat){
                            layer.msg('该名称已存在，请重新填写！',{time:2000});
                            return false;
						}
                        if($scope.tool_type_code == null ){
                            layer.msg('请选择工具类型！',{time:2000});
                            return false;
                        }
						if($scope.tool_className == null || $scope.tool_className === ''){
							layer.msg('请填写校验器全限定名称！',{time:2000});
							return false;
						}
                        if(! $scope.checkTool($scope.tool_className)){
                            return false;
                        }
						return true;
					};
					//初始化类型
					$scope.init_type = function(){
						$http({
							method:'get',
							url:moduleService.getServiceUrl() + "/edTools/findType?time="+ new Date().getTime()
							
						}).success(
							function(res){
								$scope.toolTypes = res.data;
							}
						);
					};
					//下拉框改变
					$scope.type_change = function(tool_type){
						$scope.tool_type_code = tool_type == null ? null : tool_type.code;
						$scope.tool_type_name = tool_type == null ? null :tool_type.name;
					};
					
					//新增
					$scope.tool_add = function(){
						var flag = checkFidle();
						// console.log(flag);
						if(flag){
							$http({
								method:'post',
								url:moduleService.getServiceUrl() + "/edTools/add",
								params:{
									name:$scope.tool_name,
									className:$scope.tool_className,
									type:$scope.tool_type_code,
									description:$scope.tool_description
								}
							}).success(
								function(res){
									if(res.resCode === 1){
										layer.msg('成功新增一条数据！',{time:3000});
										routeService.route(536, true);
									}else{
										layer.msg('新增出现错误，请稍后重试！',{time:3000});
									}
								}
							);
						}
					};
					
					// 返回按钮
					$scope.back = function() {
						routeService.route(536, true);
					};

				}
			]);

})(window, angular);