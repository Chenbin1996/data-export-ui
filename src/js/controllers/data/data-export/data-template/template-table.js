(function(window, angular) {
	'use strict';

	angular.module("app")
		.controller(
			'tableController', [
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
				function tableController($localStorage, $scope,$location, $log, $q, $rootScope,globalParam, $window,routeService, $http,moduleService) {
					
					//若有数据则无法保存和删除
					$scope.couldEdit = true;
                    $("[name = 'editState']").attr("disabled",false);

					//获取id
					$scope.id = globalParam.getter();
					$scope.tableList = [];
					var import_name = '默认导入器';
					$scope.isErrorImport = false;

					$scope.getToolName = function () {
                        $http({
                            url: moduleService.getServiceUrl() + "/edTemplateTable/importer?time="+ new Date().getTime(),
                            method: "get",
                            params: {
                                tempId: $scope.id
                            }
                        }).success(function(res){
                            import_name = res.data;
                        });
                    }

					//获取所有导入器
					function getTools(obj,type){
						var obj = obj;
						$http({
							url: moduleService.getServiceUrl() + "/edTools/findToolType?time="+ new Date().getTime(),
							method: "get",
							params: {
								type: type
							}
						}).success(function(res){
							if(res.resCode === 1){
								$scope[obj] = res.data;
								for(var x = 0; x < res.data.length; x++){
									if(res.data[x].name === import_name){
										$scope.defaultImport = res.data[x];
										$scope.defaultImportName = res.data[x].name;
										break;
									}
								}
							}else {
                                layer.msg(res.resMsg, {time:3000});
							}
						}).error(function(res){
							layer.msg('服务器异常,获取工具失败！！', {time:3000});
						});
					}
					getTools("importTools",4);
					//导入器改变
					$scope.importChange = function(data){
						$scope.defaultImportName = data.name;
					};
                    //获取所有主键生成方式
                    function getGenerate (){
                        $http({
                            method:'get',
                            url:moduleService.getServiceUrl() + "/edTemplateTable//keyEnum?time="+ new Date().getTime(),
                        }).success(
                            function(res){
                                if(res.resCode === 1){
                                    $scope.generates = res.data;
                                }else{
                                    layer.msg(res.resMsg,{time:3000});
                                }
                            }).error(function(res){
                            layer.msg(res.resMsg,{time:3000});
                        });
                    }
                    getGenerate();
					//回显已经选择的表
					function tableBack(id){
						$http({
							method:'get',
							url:moduleService.getServiceUrl() + "/edTemplateTable/findByTable?time="+ new Date().getTime(),
							params:{
								templateId : id
							}
						}).success(
							function(res){
								if(res.resCode === 1){
									dataBack(res.data);
								}else{
									layer.msg(res.resMsg,{time:3000});
								}
						}).error(function(res){
                            layer.msg(res.resMsg,{time:3000});
						});
					}
					tableBack($scope.id);
					//数据回显
					function dataBack(list){
						var obj;
						for(var x = 0; x < list.length; x++){
							obj = list[x];
							var table = {
								id : obj.id,
								kenGenerate : obj.kenGenerate,
								keyName : obj.keyName,
								tableName : obj.tableName,
								keyType:obj.keyType
							};
							getGenerateName(table,obj.kenGenerate);
							$scope.tableList.push(table);
						}
						if(list.length > 0){
							$scope.couldEdit = false;
                            setTimeout(function () {
                                $scope.$apply(function () {
                                    $("[name = 'editState']").attr("disabled",true);
                                });
                            }, 10);
                        }
					}
					//回显主键生成方式中文名称
					function getGenerateName(table,kenGenerate){
						for(var key in $scope.generates){
							if($scope.generates[key] === kenGenerate){
								table.generate_name = key;
							}
						}
					}
					//获取所有表
					function getTables (id){
                        $scope._load = layer.load(1, {shade: [0.1,'#fff']});
						$http({
							method:'get',
							url:moduleService.getServiceUrl() + "/edTemplate/tableConfig?time="+ new Date().getTime(),
							params:{
								templateId : id
							}
						}).success(
							function(res){
								layer.close($scope._load);
								if(res.resCode === 1){
									$scope.tables = res.data;
								}else{
									layer.msg(res.resMsg,{time:3000});
								}
						}).error(function(res){
                            layer.msg(res.resMsg,{time:3000});
						});
					}
					getTables($scope.id);
					
					//选表
					$scope.tableChange = function(table,name){
						for(var x=0; x < $scope.tables.length; x++){
							if($scope.tables[x].tableName === name){
								table.keyName = $scope.tables[x].columnName;
								table.keyType = $scope.tables[x].jdbcType;
							}
						}
					};
					//主键生成方式
					$scope.generateChange = function(table,x){
						table.kenGenerate = $scope.generates[x];
					};
					
					//表单删除
					$scope.moduleDelete = function(table) {
						var layerIndex = layer.confirm('确定删除？', {
							btn: ['确定', '取消']
							// 按钮
						}, function() {
							if(table.id == null){
								layer.msg('成功删除数据！', {time:1000});
							}else{
								$http({
									url: moduleService.getServiceUrl() + "/edTemplateTable/delete",
									method: "post",
									params: {
										id: table.id
									}
								}).success(function success(res) {
									layer.msg('成功删除数据！', {time:1000});
								});
							}
							delTbale($scope.tableList,table);
                            checkTableNum();
							$scope.$apply();
							layer.close(layerIndex);
							}, function() {
		
						});
					};
					//添加表
					$scope.addTable = function(){
						var a = {};
						$scope.tableList.push(a);
						checkTableNum();
					};
					//判断当前选中表是否超过三张
					function checkTableNum(){
						if($scope.tableList.length > 3 && $scope.defaultImportName === import_name){
							$scope.isErrorImport = true;
							layer.alert(import_name+'暂只支持三张表，超过需要选择自定义导入器！');
						}else{
							$scope.isErrorImport = false;
						}
					}
					
					//删除表
					function delTbale(list,obj){
						var index = list.indexOf(obj);
						list.splice(index,1);
					}
					//上移
					$scope.moveUp = function(table){
						var index = $scope.tableList.indexOf(table);
						if(index <= 0){
							layer.msg('第一条无法上移！', {time:1000});
						}else{
							changeIndex($scope.tableList,index,index-1);
						}
					};
					//下移
					$scope.moveDown = function(table){
						var index = $scope.tableList.indexOf(table);
						if(index >= ($scope.tableList.length - 1)){
							layer.msg('最后一条无法下移！', {time:1000});
						}else{
							changeIndex($scope.tableList,index,index+1);
						}
					};
					//交换数组
					function changeIndex(list,index1,index2){
						var temp = list[index1];
						list[index1] = list[index2];
						list[index2] = temp;
					}
					//保存
					$scope.add = function(){
						if($scope.tableList.length <= 0){
							layer.msg('还未选择表，请选择！',{time:2000});
							return ;
						}
						checkTableNum();
						if($scope.isErrorImport){
							return ;
						}
						var table;
						var names = [];
						for(var x = 0; x < $scope.tableList.length; x++){
							table = $scope.tableList[x];
							if(repateName(names,table.tableName,x+1)){
								return;
							}
							names.push(table.tableName);
							table.importSort = x + 1;
							if(! checkTable(table,x+1)){
								return;
							}
						}
						$http({
							url: moduleService.getServiceUrl() + "/edTemplateTable/add",
							method: "post",
							dataType:"json",
							contentType: 'application/json',
							params: {
								jsonData: JSON.stringify($scope.tableList),
								templateId: $scope.id,
								toolId:$scope.defaultImport.id
							}
						}).success(function(res){
							if(res.resCode === 1){
								var layerIndex = layer.confirm('保存成功,是否前往选择导入字段页面？', {
									btn: ['前往', '取消']
								},function(){
									layer.close(layerIndex);
									routeService.route(591, false);
								},function(){
								});
								routeService.route(534, true);
							}else{
								layer.msg(res.resMsg,{time:3000});
							}
						});
					};
					//校验参数
					function checkTable(table,index){
						if(table.tableName == null || table.tableName === ''){
							layer.msg('序号'+index+':表名称不能为空，请选择表！',{time:2000});
							return false;
						}
						if(table.kenGenerate == null || table.kenGenerate === ''){
							layer.msg('序号'+index+':主键生成方式为空，请选择生成方式！！',{time:2000});
							return false;
						}
						return true;
					}
					//判断表名是否重复
					function repateName(list,value,site){
						var index = list.indexOf(value);
						if(index === -1){
							return false;
						}
						index++;
						layer.msg(index+'和'+site+"表名称相同，请勿选择相同的表！",{time:2000});
						return true;
					}
					
					//返回
					$scope.back = function(){
						routeService.route(534, true);
					}
				}
			]);

})(window, angular);