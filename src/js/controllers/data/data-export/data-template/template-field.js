(function(window, angular) {
	'use strict';

	angular.module("app")
		.controller(
			'dataFieldController', [
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
				function dataFieldController($localStorage, $scope,$location, $log, $q, $rootScope,globalParam, $window,routeService, $http,moduleService) {
					
					//若有数据则无法保存和删除
					$scope.couldEdit = true;
                    $("[name = 'editState']").attr("disabled",false);

					//获取模板id
					$scope.id = globalParam.getter();
					//所有字段信息
					$scope.fieldList = [];
                    excelDataBack($scope.id);
                    getExcelField($scope.id);
                    //获取校验方法
                    getTools('fieldChecks',1);
                    //获取转换方法
                    getTools('fieldChanges',2);
                    getFailType();
                    getNotNullFields($scope.id);
					//模板字段数据回显
					function excelDataBack(id){
						$http({
							url: moduleService.getServiceUrl() + "/edTemplateField/detail?time="+ new Date().getTime(),
							method: "get",
							params: {
								id: id
							}
						}).success(function(res){
							dealWithData(res.data);
						}).error(function(res){
							layer.msg('服务器异常！', {time:1000});
						});
					}
					//处理回显数据
					function dealWithData(list){
						for(var x = 0; x < list.length; x++){
							list[x].excels = list[x].edTableFields;
							var a = [];
							for(var y = 0; y < list[x].edTools.length; y++){
								//判断是转换器还是校验器
								if(list[x].edTools[y].type === 1){
									a.push(list[x].edTools[y]);
								}else{
									list[x].change = list[x].edTools[y];
								}
							}
							list[x].checks = a;
						}
						$scope.fieldList = list;
						if(list.length > 0){
							$scope.couldEdit = false;
                            setTimeout(function () {
                                $scope.$apply(function () {
                                    $("[name = 'editState']").attr("disabled",true);
                                });
                            }, 10);
						}
					}
					
					//获取所有excel字段
					function getExcelField(id){
						$http({
							url: moduleService.getServiceUrl() + "/edTemplateField/excelAll?time="+ new Date().getTime(),
							method: "get",
							params: {
								tempId: id
							}
						}).success(function(res){
							$scope.excelFields = res.data;
						}).error(function(res){
							layer.msg('服务器异常！', {time:1000});
						});
					}

					//根据类型获取工具
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
							}
						}).error(function(res){
							layer.msg('服务器异常,获取工具失败！！', {time:1000});
						});
					}

					//获取校验或转换出错提示
					function getFailType(){
						$http({
							url: moduleService.getServiceUrl() + "/edFieldTools/failType?time="+ new Date().getTime(),
							method: "get"
						}).success(function(res){
							if(res.resCode === 1){
								$scope.failTypes = res.data;
							}
						}).error(function(res){
							layer.msg('服务器异常,获取工具失败！！', {time:1000});
						});
					}

					//校验出错被点击
					$scope.clickFailType = function(fieldCheckOrChange,fail){
						fieldCheckOrChange.failType = fail.code;
						fieldCheckOrChange.typeName = fail.name;
					};
					//校验出错是否选中
					$scope.failTypeCheck = function(fieldCheckOrChange,code){
						if(fieldCheckOrChange.check){
							if(fieldCheckOrChange.failType != null && fieldCheckOrChange.failType === code){
								return true;
							}
						}
						return false;
					};
					
					//新增字段
					$scope.addField = function(){
						var a = {};
						$scope.fieldList.push(a);
					};
					//删除一行
					$scope.fieldDelete = function(field){
						var layerIndex = layer.confirm('确定删除？', {
							btn: ['确定', '取消']
							// 按钮
						}, function() {
							if(field.id == null){
								layer.msg('成功删除数据！', {time:1000});
							}else{
								$http({
									url: moduleService.getServiceUrl() + "/edTemplateField/delete",
									method: "delete",
									params: {
										id: field.id
									}
								}).success(function success(res) {
									layer.msg('成功删除数据！', {time:1000});
								});
							}
							delField($scope.fieldList,field);
							$scope.$apply();
							layer.close(layerIndex);
							}, function() {
						});
					};
					//删除一行
					function delField(list,obj){
						var index = list.indexOf(obj);
						list.splice(index,1);
					}
					
					//选择字段模态框打开
					$scope.selectField = function(field){
						if(!$scope.couldEdit){
							return;
						}
						$scope.nowField = field;
						var x_obj;
						var y_obj;
						if(field.excels != null && field.excels.length > 0){
							for(var x = 0; x < field.excels.length; x++){
								x_obj = field.excels[x];
								for(var y =0; y < $scope.excelFields.length; y++){
									y_obj = $scope.excelFields[y];
									if(x_obj.fieldName === y_obj.fieldName && x_obj.tableName === y_obj.tableName ){
										y_obj.check = true;
									}
								}
							}
						}
						$("#select_field").modal("show");
					};
					//确定按钮关闭模态框
					$scope.closeField = function(){
						var field = $scope.nowField;
						var excels = [];
						for(var x = 0; x < $scope.excelFields.length; x++){
							if($scope.excelFields[x].check){
								excels.push($scope.excelFields[x]);
								$scope.excelFields[x].check = false;
							}
						}
						field.excels = excels;
                        checkNotNullField(field,field.excels);
						$("#select_field").modal("hide");
					};
					//x关闭模态框
					$scope.closeAndClean = function(){
                        for(var x = 0; x < $scope.excelFields.length; x++){
                            $scope.excelFields[x].check = false;
                        }
                        $("#select_field").modal("hide");
					};
					//判断是否有非空字段
					function checkNotNullField(field,list) {
						var obj;
						var nullList;
						for(var x=0; x < list.length; x++){
							obj = list[x];
                            nullList = $scope.nullFiedls[obj.tableName];
                            if(nullList.indexOf(obj.fieldName) !== -1){
                                findNullCheck(field);
                            	return;
							}
						}
                    }
                    //当选了非空字段，默认加上非空校验
                    function findNullCheck(field){
						for(var x=0; x<$scope.fieldChecks.length;x++){
							if($scope.fieldChecks[x].name === '非空校验'){
                                addNullCheck(field,$scope.fieldChecks[x])
							}
						}
					}
					//判断字段是否有非空校验，没有则添加
					function addNullCheck(field,nullCheck) {
						if(field.checks == null){
                            field.checks = [];
						}
						for(var x=0; x<field.checks.length; x++){
							if(field.checks[x].name === '非空校验'){
								return;
							}
						}
                        for(var y=0; y<$scope.failTypes.length;y++){
							if($scope.failTypes[y].name === "错误"){
                                nullCheck.failType = $scope.failTypes[y].code;
                                nullCheck.typeName = $scope.failTypes[y].name;
							}
						}
                        field.checks.push(copyObj(nullCheck));
                    }

                    //获取所有非空字段
                    function getNotNullFields(id){
                        $http({
                            url: moduleService.getServiceUrl() + "/edTableField/notNull?time="+ new Date().getTime(),
                            method: "get",
                            params: {
                                templateId: id
                            }
                        }).success(function success(res) {
                            $scope.nullFiedls = res.data;
                        });
                    }
					//回显字段是否被选中
					$scope.isFieldCheck = function(excel){
						if(excel.check){
							return false;
						}
						return false;
					};
					
					//校验方法模态框打开
					$scope.selectCheck = function(field){
                        if(!$scope.couldEdit){
                            return;
                        }
						$scope.nowField = field;
						cancelFailType();
						var x_obj;
						var y_obj;
						if(field.checks != null && field.checks.length > 0){
							for(var x = 0; x < field.checks.length; x++){
								x_obj = field.checks[x];
								for(var y =0; y < $scope.fieldChecks.length; y++){
									y_obj = $scope.fieldChecks[y];
									
									if(x_obj.name === y_obj.name){
										y_obj.check = true;
										y_obj.other = x_obj.other;
										y_obj.failType = x_obj.failType;
										y_obj.typeName = x_obj.typeName;
									}
								}
							}
						}
						initInput();
						$("#select_tool").modal("show");
					};

					//校验方法被点击
					$scope.checkChose = function(fieldCheck){
						if(!fieldCheck.check){
							fieldCheck.failType = null;
							fieldCheck.other = null;
							fieldCheck.check = false;
						}
					};
					//校验方法是否被选中
					$scope.isCheck = function(fieldCheck){
						if(fieldCheck.check){
							return true;
						}
						return false;
					};
					//关闭校验方法
					$scope.closeChecks = function(){
						var field = $scope.nowField;
						var checks = [];
						for(var x = 0; x < $scope.fieldChecks.length; x++){
							if($scope.fieldChecks[x].check){
								if(!dealCheck($scope.fieldChecks[x])){
									return;
								}
								checks.push(copyObj($scope.fieldChecks[x]));
							}
						}
						cancelFailType();
						cleanCheck();
						field.checks = checks;
						$("#select_tool").modal("hide");
					};
					//右上角关闭模态框
					$scope.close_check = function(){
                        cancelFailType();
                        cleanCheck();
                        $("#select_tool").modal("hide");
					};

					//对校验方法进行校验
					function dealCheck(obj){
						if(obj.failType == null){
							layer.msg("请为校验工具选择出错提示！",{time:2000});
							return false;
						}
						if(obj.name !== '长度校验'){
                            return true;
						}
                        if(obj.other == null || obj.other === ''){
                            layer.msg("长度校验请输入校验位数！",{time:2000});
                            return false;
                        }else{
                            var re = /^[0-9]+$/;
                            if(!re.test(obj.other) || obj.other <= 0){
                                layer.msg("长度校验位数请输入正整数！",{time:2000});
                                return false;
                            }
                        }
						return true;
					}
					
					//清空校验方法数据
					function cleanCheck(){
						for(var x = 0; x < $scope.fieldChecks.length; x++){
							$scope.fieldChecks[x].other = null;
							$scope.fieldChecks[x].check = false;
							$scope.fieldChecks[x].failType = null;
						}
					}
					
					
					//转换器模态框打开
					$scope.selectChange = function(field){
                        if(!$scope.couldEdit){
                            return;
                        }
						$scope.nowField = field;
						if(field.change != null){
							for(var x = 0; x < $scope.fieldChanges.length; x++){
								if($scope.fieldChanges[x].name === field.change .name){
									$scope.fieldChanges[x].check = true;
									$scope.fieldChanges[x].failType = field.change.failType;
									break;
								}
							}
						}
						$("#select_change").modal("show");
					};
					//转换器模态框关闭
					$scope.closeChanges = function(){
						var field = $scope.nowField;
						field.change = null;
						for(var x = 0; x < $scope.fieldChanges.length; x++){
							if($scope.fieldChanges[x].check){
								if($scope.fieldChanges[x].failType == null){
									layer.msg("请为转换方法选择出错提示！",{time:2000});
									return ;
								}
								field.change = copyObj($scope.fieldChanges[x]);
								$scope.fieldChanges[x].check = false;
								break;
							}
						}
						for(var y = 0; y < $scope.failTypes.length; y++){
							$scope.failTypes[y].check = false;
						}
						$("#select_change").modal("hide");
					};
					//右上角关闭模态框
					$scope.close_change = function(){
                        $scope.cancel();
                        $("#select_change").modal("hide");
					};
					//转换器是否被選中
					$scope.isChangeCheck = function(fieldChange){
						if(fieldChange.check){
							return true;
						}
						return false;
					};
					//转换器被点击
					$scope.clickChange = function(fieldChange){
						fieldChange.check = true;
						for(var x = 0; x < $scope.fieldChanges.length; x++){
							if(fieldChange.name !== $scope.fieldChanges[x].name){
								$scope.fieldChanges[x].check = false;
							}
							$scope.fieldChanges[x].failType = null;
						}
						cancelFailType();
					};
					//取消转换器选择
					$scope.cancel = function(){
						for(var x = 0; x < $scope.fieldChanges.length; x++){
							$scope.fieldChanges[x].check = false;
							$scope.fieldChanges[x].failType = null;
						}
						cancelFailType();
					};
					//重置表单
					function cancelFailType(){
						var froms = document.getElementsByName("changeBoxName");
						for(var x=0; x < froms.length;x++){
                            froms[x].reset();
						}
					}
					
					//复制对象
					function copyObj(obj){
						var newObj = {};
						for(var key in obj){
							newObj[key] = obj[key];
						}
						return newObj;
					}
					//输入框设置值
					function initInput(){
						var name;
						for(var x = 0; x < $scope.fieldChecks.length; x++){
							name = $scope.fieldChecks[x].name;
							if(name === '长度校验'){
								$("#"+name).attr('placeholder','请输入校验长度');
							}else{
								$("#"+name).attr('placeholder','选填');
							}
						}
					}
					
					//保存
					$scope.add = function(){
						if(! checkData($scope.fieldList)){
							return;
						}
						var receiver = {};
                        receiver.id = $scope.id;
                        receiver.stringFields = JSON.stringify($scope.fieldList);

						$http({
							url: moduleService.getServiceUrl() + "/edTemplateField/addBody",
							method: "post",
							dataType:"json",
							contentType: 'application/json',
							// params: {
							// 	vo : JSON.stringify($scope.fieldList),
							// 	id:$scope.id
							// }
							data:receiver
						}).success(function(res){
							if(res.resCode === 1){
								var layerIndex = layer.confirm('保存成功,是否前往数据导入页面？', {
									btn: ['前往', '取消']
								},function(){
									layer.close(layerIndex);
									routeService.route(537, true);
								},function(){
								});
								routeService.route(534, true);
							}else{
								layer.msg(res.resMsg,{time:3000});
							}
						}).error(function(res){
							layer.msg("服务器异常！",{time:2000});
						});
					};
					//校验参数
					function checkData(list){
						if(list.length <= 0){
							layer.msg("请至少添加一条数据！",{time:2000});
							return false;
						}
						var obj;
						var index;
						var allFields = [];
						var field;
						var size = 0;
						for(var x = 0; x < list.length; x++){
							obj = list[x];
							index = x + 1;
							if(obj.name == null || obj.name === ''){
								layer.msg('序号' + index + ":请填写模板字段名称！",{time:2000});
								return false;
							}
							if(obj.excels == null || obj.excels.length === 0){
								layer.msg('序号' + index + ":请选择对应数据库字段！",{time:2000});
								return false;
							}
							for(var y = 0; y < obj.excels.length; y++){
								size++;
								field = obj.excels[y].tableName+'.'+obj.excels[y].fieldName;
								if(allFields.indexOf(field) === -1){
									allFields.push(field);
								}else{
									layer.msg('序号' + index +':'+ field+'字段已经被选择，请勿选择两次！',{time:3000});
									return false;
								}

							}
						}
						var tableAndField;
						if(size !== $scope.excelFields.length){
                            tableAndField = $scope.excelFields[x].tableName +'.'+ $scope.excelFields[x].fieldName;
							for(var x=0; x<$scope.excelFields.length;x++){
								for(var y=0; y<allFields.length;y++){
									if(tableAndField === allFields[y]){
										continue;
									}
									layer.msg(tableAndField+"字段尚未被选择！",{time:3000});
                                    return false;
								}
							}

						}
						return true;
					}
					//展示长度校验位数
					$scope.showOther = function(x){
						if(x.name === '长度校验'){
							return true;
						}else{
							return false;
						}
					};
					
					// 返回
					$scope.back = function() {
						routeService.route(534, true);
					}
					
				}
			]);

})(window, angular);