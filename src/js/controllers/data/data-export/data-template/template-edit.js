(function(window, angular) {
	'use strict';

	angular.module("app")
		.controller(
			'dataEditCtrl', [
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
				function dataEditCtrl($localStorage, $scope,
					$location, $log, $q, $rootScope,globalParam, $window,
					routeService, $http,moduleService) {

                    $scope.repeat = false;

					//获取当前数据
					$scope.id = globalParam.getter().data.id;
					$scope.templateId = globalParam.getter().data.templateId;
					$scope.template_name=globalParam.getter().data.templateName;
					$scope.description = globalParam.getter().data.description;
					$scope.conn_name=globalParam.getter().data.connectionName;
					$scope.db_url=globalParam.getter().data.dburl;	
					$scope.db_type = globalParam.getter().data.dbtypeId;	
					$scope.user_name=globalParam.getter().data.username;
					$scope.user_password=globalParam.getter().data.password;
					$scope.db_port=globalParam.getter().data.port;
					$scope.db_name=globalParam.getter().data.dbname;
                    $scope.appId=globalParam.getter().data.appId;
                    $scope.menuId=globalParam.getter().data.moduleId;
                    $scope.menuName=globalParam.getter().data.moduleName;
					$scope.button_show = true;
					//密码为加密状态
                    $scope.pass_state = '1';
					//初始化下拉框
					$scope.init_type = function(){
						$scope.button_show = true;
						$scope.button_test = true;
						$http({
							method:'get',
							url:moduleService.getServiceUrl() + "/edDbtype/types?time="+ new Date().getTime()
						}).success(
							function(res){
							$scope.dbTypes = res.data;
							db_select($scope.db_type);
						});
					};


                    //判断模板名称是否重复
                    $scope.isRepeat = function(){
                    	var oldName = $scope.template_name;
                    	var newName = globalParam.getter().data.templateName;
                    	if(oldName.toUpperCase() === newName.toUpperCase()){
							return;
						}
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

					//设置选中数据库源的一些数据
					var db_select = function(type_id){
						for(var x =0;x < $scope.dbTypes.length; x++){
							if($scope.dbTypes[x].id === type_id){
								$scope.db_tyep_name = $scope.dbTypes[x].name;
								if($scope.db_port == null){
                                    $scope.db_port = $scope.dbTypes[x].port;
								}
								$scope.db_driver = $scope.dbTypes[x].driverClass;
							}
						}
					};
					
					//数据库类型改变
					$scope.type_change = function(db_type){
						$scope.db_type = db_type;
						db_select(db_type);
						$scope.change_reset();
					};

					//重置值
					$scope.change_reset = function(){
						$scope.button_show = true;
						$scope.button_test = false;
					};
					$scope.password_reset = function(){
                        $scope.change_reset();
                        //表示密码为解密状态
                        $scope.pass_state = '0';
					};

					//跳出修改按钮
					$scope.change_edit = function(){
						$scope.button_show = false;
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

					//字段检查
					var checkFidle  =function(){
						if($scope.template_name == null || $scope.template_name === ''){
							layer.msg('请填写模板名称！',{time:2000});
							return false;
						}
						if($scope.repeat){
                            layer.msg('模板名称已存在，请重新填写！',{time:2000});
                            return false;
						}
						if($scope.conn_name == null || $scope.conn_name === ''){
							layer.msg('请填写连接名称！',{time:2000});
							return false;
						}
						if($scope.db_type == null){
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
									state:$scope.pass_state
								}
							}).success(
								function(res){
                                    layer.close($scope._load);
									if(res.resCode === 1){
										layer.msg('数据库连接成功！',{time:3000});
										$scope.button_show = false;
										$scope.button_test = true;
									}else{
										layer.msg(res.resMsg,{time:3000});
									}
							}).error(
								function (res) {
                                    layer.close($scope._load);
                                    layer.msg(res.resMsg,{time:3000});
                                }
							);
						}
					};
					
					//修改配置
					$scope.template_edit = function(){
						var flag = checkFidle();
						if(flag){
							flag = isChange();
							if(flag){
                                isFinishImport();
							}else {
                                template_update();
							}
						}
					};
					//请求修改接口
					function template_update() {
                        var bool = globalParam.getter().data.password === $scope.user_password ? "1" : "0";
                        $scope._load = layer.load(3, {shade: [0.3, '#000000']});
                        $http({
                            method:'post',
                            url:moduleService.getServiceUrl() + "/edTemplate/update",
                            params:{
                                id:$scope.id,
                                templateName:$scope.template_name,
                                description:$scope.description,
                                connectionName:$scope.conn_name,
                                dbtypeId:$scope.db_type,
                                dburl:$scope.db_url,
                                username:$scope.user_name,
                                password:$scope.user_password,
                                port:$scope.db_port,
                                dbname:$scope.db_name,
                                templateId:$scope.templateId,
                                state:bool
                            }
                        }).success(
                            function(res){
                                layer.close($scope._load);
                                if(res.resCode === 1){
                                    layer.msg('成功修改一条数据！',{time:3000});
                                    routeService.route(534, true);
                                }else{
                                    layer.msg('修改出现错误，请稍后重试！',{time:3000});
                                }
                            }
                        );
                    }
                    //查看是否存在未导入数据
                    function isFinishImport() {
                        $http({
                            method:'get',
                            url:moduleService.getServiceUrl() + "/edTemplate/isFinishImport?time="+ new Date().getTime(),
                            params:{
                                templateId:$scope.templateId
                            }
                        }).success(
                            function(res){
                                if(res.resCode === 1){
                                    template_update();
                                }else{
                                    if(res.resCode === 0){
                                        var layerIndex = layer.confirm('当前模板配置还存在'+res.resMsg+'次数据未完成导入，请前往导入日志模块完成导入！', {
                                            btn: ['前往导入', '退出保存']
                                        },function(){
                                            routeService.route(538, true);
                                            layer.close(layerIndex);
                                        },function(){
                                            routeService.route(534, true);
                                        });
									}else {
                                        layer.msg('修改出现错误，请稍后重试！',{time:3000});
									}
                                }
                            }
                        );
                    }
                    
					//判断数据库类型，地址，数据库，表是否改变
					function isChange() {
						if($scope.db_url != globalParam.getter().data.dburl
							|| $scope.db_type != globalParam.getter().data.dbtypeId
							|| $scope.db_name != globalParam.getter().data.dbname
							|| $scope.table_name != globalParam.getter().data.tableName){
							return true;
						}
						return false;
                    }
					
					// 返回按钮
					$scope.back = function() {
						routeService.route(534, true);
					}

				}
			]);

})(window, angular);