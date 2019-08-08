(function(window, angular) {
	'use strict';

	angular.module("app")
		.controller(
			'tableFieldController', [
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
				function tableFieldController($localStorage, $scope,$location, $log, $q, $rootScope,globalParam, $window,routeService, $http,moduleService) {
					
					//若有数据则无法保存和删除
					$scope.couldEdit = true;
                    $("[name = 'editState']").attr("disabled",false);

                    $scope.enter = function(){
                        $scope.tip = layer.tips('生成器:根据需求由系统自动生成某个值', '#generate_id');
					};
					$scope.leave = function(){
                    	layer.close($scope.tip);
					};

					//获取模板id
					$scope.id = globalParam.getter();
					$scope.fieldList = [];
                    getAllFields($scope.id);
                    allGenerate();
                    generateType();
					//数据回显
					function dataBack(id){
						$http({
							url: moduleService.getServiceUrl() + "/edTableField/detail?time="+ new Date().getTime(),
							method: "get",
							params: {
								templateId: id
							}
						}).success(function success(res) {
							dataToList(res.data);
						});
					}
					dataBack($scope.id);
					//将回显数据封装成list
					function dataToList(list){
						var obj;
						for(var x = 0; x < list.length; x++){
							obj = list[x];
							obj.typeName = getByType(obj.type);
							obj.tableAndField = obj.tableName + '.' + obj.fieldName;
							if(obj.foreignField != null){
								obj.foreign_tableAndField = obj.foreignTableName + '.' + obj.foreignField;
							}
							$scope.fieldList.push(obj);
//							$scope.$apply();
							$scope.typeChange(obj,x+1,false);
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
					//根据type找到生成方式名称
					function getByType(value){
						for(var key in $scope.types){
							if($scope.types[key] === value){
								return key;
							}
						}
						return null;
					}
					//获取所有字段
					function getAllFields(id){
                        $scope._load = layer.load(1, {shade: [0.1,'#fff']});
						$http({
							url: moduleService.getServiceUrl() + "/edTableField/selectDb?time="+ new Date().getTime(),
							method: "get",
							params: {
								templateId: id
							}
						}).success(function success(res) {
                            layer.close($scope._load);
							if(res.resCode === 1){
								$scope.allFields = res.data;
							}else{
								layer.msg(res.resMsg,{time:3000});
							}
						});
					}
					//所选字段改变
					$scope.fieldChange = function(field){
						if(field.tableAndField == null || field.tableAndField === ''){
							field.fieldType = null;
							field.tableName = null;
							field.fieldName = null;
							field.tableAndField = null;
                            field.importSort = null;
							return;
						}
						var obj;
						for(var x = 0; x < $scope.allFields.length; x++){
							obj = $scope.allFields[x];
							if(obj.tableAndField === field.tableAndField){
								field.fieldType = obj.fieldType;
								field.tableName = obj.toTable;
								field.fieldName = obj.fieldName;
								field.importSort = obj.importSort;
							}
						}
					};
					//查询所有生成器
					function allGenerate(){
						$http({
							url: moduleService.getServiceUrl() + "/edTableField/generatorAll?time="+ new Date().getTime(),
							method: "get"
						}).success(function success(res) {
							if(res.resCode === 1){
								$scope.generates = res.data;
							}
						});
					}
					//生成方式
					function generateType(){
						$http({
							url: moduleService.getServiceUrl() + "/edTableField/valueType?time="+ new Date().getTime(),
							method: "get",
						}).success(function success(res) {
							if(res.resCode === 1){
								$scope.types = res.data;
							}
						});
					}
					//生成方式改变
					$scope.typeChange = function(field,index,bool){
						field.type = $scope.types[field.typeName];
						//根据类型设置是否可以输入
						var a = $('#'+index+'input');
						var b = $('#'+index+'select_generate');
						var c = $('#'+index+'select_field');
						switch(field.type){
							//excel
							case 1:
								a.attr('disabled',true);
								b.attr('disabled',true);
								c.attr('disabled',true);
								break;
							//默认值
							case 2:
								a.attr('disabled',false);
								b.attr('disabled',true);
								c.attr('disabled',true);
								break;
							//生成器
							case 3:
								a.attr('disabled',true);
								b.attr('disabled',false);
								c.attr('disabled',true);
								break;
							//外键关联
							case 4:
								a.attr('disabled',true);
								b.attr('disabled',true);
								c.attr('disabled',false);
								break;
							default:
								a.attr('disabled',true);
								b.attr('disabled',true);
								c.attr('disabled',true);
								break;
						}
						//清空数据
						if(bool){
							field.value = null;
							field.toolId = '';
							field.foreign_tableAndField = '';
						}

					};
					//查询字段详细信息模态框
					$scope.fieldDetail = function(field){
						$("#fieldDetail").modal('show');
						$scope.detail_field_name = field.fieldName;
						$scope.detail_field_table = field.tableName;
						$scope.detail_field_type = field.fieldType;
						$scope.detail_field_foreignField = field.foreignField;
						$scope.detail_field_foreignFieName = field.foreignTableName;
					};
					//关闭详细信息模态框
					$scope.close_detail = function(){
						$("#fieldDetail").modal('hide');
					};
					//关联外键改变
					$scope.foreignChange = function(field){
						if(field.foreign_tableAndField == null || field.foreign_tableAndField === ''){
							field.foreignField = null;
							field.foreignTableName = null;
							return;
						}
						var obj;
						for(var x = 0; x < $scope.allFields.length; x++){
							obj = $scope.allFields[x];
							if(obj.tableAndField === field.foreign_tableAndField){
								if(field.importSort < obj.importSort){
                                	layer.msg("关联存在错误："+obj.toTable+"表的导入顺序在"+field.tableName+"表之后！",{time:3000});
                                	field.foreign_tableAndField = "";
                                	return;
                                }else if(field.importSort === obj.importSort){
                                   layer.msg("请勿关联自身表字段！",{time:3000});
                                   field.foreign_tableAndField = "";
                                   return;
                                }
                                field.foreignField = obj.fieldName;
                                field.foreignTableName = obj.toTable;
							}
						}
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
									url: moduleService.getServiceUrl() + "/edTableField/delete",
									method: "post",
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
					//添加一行
					$scope.addField = function(){
						var a = {};
						$scope.fieldList.push(a);
					};
					//删除一行
					function delField(list,obj){
						var index = list.indexOf(obj);
						list.splice(index,1);
					}
					//保存字段
					$scope.add = function(){
						if(! checkData($scope.fieldList)){
							return;
						}
						if(! checkId()){
							return;
						}
						if(! checkNullField()){
							return;
						}
                        var receiver = {};
                        receiver.id = $scope.id;
                        receiver.stringFields = JSON.stringify($scope.fieldList);
						$http({
							url: moduleService.getServiceUrl() + "/edTableField/addPost",
							method: "post",
							dataType:"json",
							contentType: 'application/json',
							// params: {
							// 	jsonData: JSON.stringify($scope.fieldList),
							// 	tempId: $scope.id
							// }
                            data:receiver
						}).success(function(res){
							if(res.resCode === 1){
								var layerIndex = layer.confirm('保存成功,是否前往模板字段页面？', {
									btn: ['前往', '取消']
								},function(){
									layer.close(layerIndex);
									routeService.route(586, false);
								},function(){
								});
								routeService.route(534, true);
							}else{
								layer.msg(res.resMsg,{time:3000});
							}
						}).error(function(res){
							layer.msg("服务器异常！",{time:3000});
						});
					};
					//校验数据
					function checkData(list){
						if(list.length <= 0){
							layer.msg('尚未选择字段，请选择导入字段！');
							return false;
						}
						var obj;
						var index;
						var names = [];
						for(var x = 0; x<list.length; x++){
							obj = list[x];
							index = x + 1;
							
							if(repeatField(names,obj.tableAndField,index)){
								return;
							}
							names.push(obj.tableAndField);
							
							
							if(obj.fieldName == null || obj.fieldName === ''){
								layer.msg('序号'+index+':字段不能为空，请选择字段！',{time:2000});
								return false;
							}
							if(obj.type == null || obj.type === ''){
								layer.msg('序号'+index+':生成方式不能为空，请选择生成方式！',{time:2000});
								return false;
							}
							switch(obj.type){
								//默认值
								case 2:
									if(obj.value == null || obj.value === ''){
										layer.msg('序号'+index+':默认值不能为空，请输入默认值！',{time:2000});
										return false;
									}
									break;
								//生成器
								case 3:
									if(obj.toolId == null || obj.toolId === ''){
										layer.msg('序号'+index+':生成器不能为空，请选择生成器！',{time:2000});
										return false;
									}
									break;
								//外键关联
								case 4:
									if(obj.foreignField == null || obj.foreignField === ''){
										layer.msg('序号'+index+':外键关联不能为空，请选择外键关联！',{time:2000});
										return false;
									}
									break;
								default:
									break;
							}
						}
						return true;
					}
					//判断是否选中相同字段
					function repeatField(list,value,site){
						var index = list.indexOf(value);
						if(index === -1){
							return false;
						}
						index++;
						layer.msg(index+'和'+site+"为相同表字段，请修改！",{time:2000});
						return true
					}
					//校验是否已经选择所有非空字段
					function checkNullField(){
						var list;
						var falg;
						for(var key in $scope.nullFiedls){
							list = $scope.nullFiedls[key];
							for(var x = 0; x < list.length; x++){
								falg = false;
								for(var y = 0; y < $scope.fieldList.length; y++){
									if(key === $scope.fieldList[y].tableName && list[x] === $scope.fieldList[y].fieldName){
										falg = true;
										break;
									}
								}
								if(! falg){
									layer.alert(key+"表"+list[x]+'字段在表中为非空字段，请选中该字段！<br/>其余所有非空字段为：<br/>'+prinfNullFields());
									return false;
								}
							}
						};
						return true;
					}
					//打印所有非空字段
					function prinfNullFields(){
						var data = '';
						for(var key in $scope.nullFiedls){
							data = data +  key + '表:<br>';
							for(var x = 0; x < $scope.nullFiedls[key].length; x++){
								data = data + '&nbsp&nbsp&nbsp&nbsp' + $scope.nullFiedls[key][x] + '&nbsp&nbsp';
								if(x === $scope.nullFiedls[key].length - 1){
									data = data + '<br/>';
								}
							}
						}
						return data;
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
					getNotNullFields($scope.id);
					
					//校验是否选择了非定义的主键
					function checkId(){
						var name;
						var index;
						for(var x = 0; x < $scope.fieldList.length; x++){
							index = x + 1;
							name = $scope.fieldList[x].tableName + '.' + $scope.fieldList[x].fieldName;
							if($scope.ids.indexOf(name) !== -1){
								layer.alert('序号'+index+':'+$scope.fieldList[x].fieldName+'字段为'+$scope.fieldList[x].tableName+'表主键，且值的生成方式为自动生成，请勿选中！');
								return false;
							}
						}
						return true;
					}
					//获取已选表的所有信息
					function getTableInform(id){
						$http({
							url: moduleService.getServiceUrl() + "/edTemplateTable/findByTable?time="+ new Date().getTime(),
							method: "get",
							params: {
								templateId: id
							}
						}).success(function success(res) {
							$scope.ids = [];
							for(var x = 0; x < res.data.length; x++){
								//选择不是自定义的主键
								if(res.data[x].kenGenerate !== 3){
									$scope.ids.push(res.data[x].tableName+'.'+res.data[x].keyName);
								}
							}
						});
					}
					getTableInform($scope.id);
					
					//返回
					$scope.back = function(){
						routeService.route(534, true);
					};

					$scope.isRepeatCheck = function (field, index) {
						if (field.repeatCheck){
                            field.repeatCheck = 0;
                            $scope.tip = layer.tips('已取消对该字段的重复性校验', '#notRepeatCheck-'+index);
						}else {
							field.repeatCheck = 1;
                            $scope.tip = layer.tips('已将该字段放入重复性校验中','#repeatCheck-'+index);
						}
                    }
				}
			]);

})(window, angular);