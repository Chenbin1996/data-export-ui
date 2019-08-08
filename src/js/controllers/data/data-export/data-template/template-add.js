(function(window, angular) {
	'use strict';

	angular.module("app")
		.controller(
			'dataAddCtrl', [
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
				function dataAddCtrl($localStorage, $scope,$location, $log, $q, $rootScope, globalParam,$window,routeService, $http,moduleService) {
                    var app = localStorage["ngStorage-application"];
                    var module = localStorage["ngStorage-applicationUserRoleTree"];
                    var appId;
                    var moduleList;
                    if (app){
                        appId = JSON.parse(app).appId;
                    }
                    if (module) {
                        moduleList = JSON.parse(localStorage["ngStorage-applicationUserRoleTree"]);
                    }
                    // console.log(moduleList);
                    //拷贝对象方法
                    function copy(obj){
                        var newobj = {};
                        for ( var attr in obj) {
                            newobj[attr] = obj[attr];
                        }
                        return newobj;
                    };
                    var obj = [];
                    var moduleTree = function(moduleList, moduleId, seqId, parentNode){
                        if (!moduleList){
                            return;
                        }
                        for(var i = 0; i < moduleList.length; i++){
                            if (moduleList[i].children != null){
                                moduleTree(moduleList[i].children, moduleId, seqId, moduleList[i]);
                            }
                            if (moduleId === moduleList[i].moduleId && seqId === moduleList[i].seqId){
                                var node = copy(moduleList[i]);
                                node.name = parentNode.name === null ? '' : parentNode.name + "—" + node.name;
                                obj.push(node);
                            }
                        }
                    };

					$scope.repeat = false;

                    $scope.init_module = function(){
                        var platform = localStorage["ngStorage-platformRouterConfig"];
                        var moduleId;
                        if (platform){
                            moduleId = JSON.parse(platform).moduleId;
                        }
                        moduleTree(moduleList, moduleId, "537", null);
                        // console.log(obj);
                        $scope.modules = obj;
                    };
                    $scope.module_change = function(module){
                        $scope.menuId = module == null ? null : module.id;
                        $scope.menuName = module == null ? null : module.name;
                        // console.log($scope.menuId);
                        // console.log($scope.menuName);
                    };

					//初始化数据库类型下拉框 
					$scope.init_type = function(){
						$scope.button_show = true;
						$scope.button_test = false;
						//隐藏数据库表名div
//						$('#tableName').css('display','none');
						$http({
							method:'get',
							url:moduleService.getServiceUrl() + "/edDbtype/types?time="+ new Date().getTime()
						}).success(
							function(res){
							$scope.dbTypes = res.data;

						});
					};
					
					//数据库类型改变
					$scope.type_change = function(db_type){
						$scope.db_type_id =  db_type == null ? null: db_type.id;
						$scope.db_port = db_type == null ? null: db_type.port;
						$scope.db_driver = db_type == null ? null: db_type.driverClass;
						$scope.change_reset();
					};
					//判断模板名称是否重复
					$scope.isRepeat = function(){
						$http({
                            method:'get',
                            url:moduleService.getServiceUrl() + "/edTemplate/isRepeat?time="+ new Date().getTime(),
                            params:{
                                name:$scope.template_name
                            }
						}).success(
							function (res) {
								$scope.repeat = res.resCode != 1 ? true : false;
                        }).error();
					};

					
					//重置值
					$scope.change_reset = function(){
						$scope.button_show = true;
						$scope.button_test = false;
					};

					//校验数据库IP格式是否正确
					var url_re = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
					$scope.checkUrl = function (url) {
						if(url.split('.').length != 4 || ! url_re.test(url)){
							layer.msg("错误的ip地址<br>示例:127.0.0.1");
							return false;
						}
						return true;
                    };
					//校验端口格式是否正确
                    $scope.checkPort = function (port) {
                        if(port == null || port === ''){
                            return false;
                        }
                        if(isNaN(port) || port.length < 3 || port.length > 6){
                            layer.msg("端口请输入数字，长度4-6位:<br>示例:3306",{time:3000});
                            return false;
                        }
                        return true;
                    };

					//新增字段检查
					var checkFidle  =function(){
						if($scope.repeat){
                            layer.msg('模板名称重复，请重新填写！',{time:2000});
                            return false;
						}
						if($scope.template_name == null || $scope.template_name === ''){
							layer.msg('请填写模板名称！',{time:2000});
							return false;
						}
						if($scope.conn_name == null || $scope.conn_name === ''){
							layer.msg('请填写连接名称！',{time:2000});
							return false;
						}
						if($scope.db_type_id == null){
							layer.msg('请选择数据库类型！',{time:2000});
							return false;
						}
						if($scope.db_url == null || $scope.db_url === ''){
							layer.msg('请填写数据库IP！',{time:2000});
							return false;
						}
						if(! $scope.checkUrl($scope.db_url)){
							return false;
						}
						if($scope.user_name == null || $scope.user_name === ''){
							layer.msg('请填写用户名称！',{time:2000});
							return false;
						}
						if($scope.user_password == null || $scope.user_password === ''){
							layer.msg('请填写密码！',{time:2000});
							return false;
						}
						if($scope.db_port == null || $scope.db_port === ''){
							layer.msg('请填写端口号！',{time:2000});
							return false;
						}
						if(! $scope.checkPort($scope.db_port)){
                            return false;
						}
						if($scope.db_name == null || $scope.db_name === ''){
							layer.msg('请填写数据库名！',{time:2000});
							return false;
						}
						return true;
					};
					
					//测试连接
					$scope.template_test = function(){						
						var flag = checkFidle();
						if(flag){
                            $scope._load = layer.load(3, {shade: [0.3, '#000000']});
							$http({
								method:'get',
								url:moduleService.getServiceUrl() + "/edTemplate/connection?time="+ new Date().getTime(),
								params:{
									connectionName:$scope.conn_name,
                                    driverClassName:$scope.db_driver,
									dburl:$scope.db_url,
									username:$scope.user_name,
									password:$scope.user_password,
									port:$scope.db_port,
									dbname:$scope.db_name,
									state:"0"
								}
							}).success(
								function(res){
								if(res.resCode === 1){
									layer.msg('数据库连接成功',{time:3000});
									$scope.button_show = false;
									$scope.button_test = true;
                                    layer.close($scope._load);
								}else{
									layer.msg(res.resMsg,{time:3000});
                                    layer.close($scope._load);
								}
							});
						}
					};
					//保存配置
					$scope.template_add = function(){
						var flag = checkFidle();
						if(flag){
							$http({
								method:'post',
								url:moduleService.getServiceUrl() + "/edTemplate/add",
								params:{
									templateName:$scope.template_name,
									description:$scope.description,
									connectionName:$scope.conn_name,
									dbtypeId:$scope.db_type_id,
									dburl:$scope.db_url,
									username:$scope.user_name,
									password:$scope.user_password,
									port:$scope.db_port,
									dbname:$scope.db_name,
                                    appId: appId,
                                    moduleId: $scope.menuId,
                                    moduleName: $scope.menuName
								}
							}).success(
								function(res){
                                    // console.log(res);
									if(res.resCode === 1){
										var layerIndex = layer.confirm('保存数据成功！是否跳转选表页面？', {
											btn: ['立即前往', '稍后再说']
										},function(){
											layer.close(layerIndex);
											globalParam.setter(res.data);
											routeService.route(590, false);
										},function(){
											routeService.route(534, true);
										});
										routeService.route(534, true);
									}else{
										layer.msg(res.resMsg,{time:3000});
									}
								}
							);
						}
					};
					
					// 返回按钮
					$scope.back = function() {
						routeService.route(534, true);
					}

				}
			]);

})(window, angular);