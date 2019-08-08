(function (window, angular) {
	'use strict';
	
	angular.module("app").controller(
		'dataImportController',
		[
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
		function dataImportController($localStorage, $scope, $location, $log,
			$q, $rootScope,globalParam, $window, routeService, $http,moduleService) {
			
			
			var MESSAGE = '数据校验状态';
			
			if($scope.mapList == null){
				$scope.showSave = false;
			}
			
				//打开数据导入模态框
				$scope.openBox = function(){
					// document.getElementById("fileFrom").reset();
					init_temp();
					$("#dataBox").modal('show');
					
				};
				
				//关闭数据导入模态框
				var modalOk = function(){
					$("#dataBox").modal('hide');
				};
				
				var module = localStorage["ngStorage-currentMenu"];
				var app = localStorage["ngStorage-application"];
				var appId;
				if (module){
					var moduleList = JSON.parse(module);
					for(var i = 0; i < moduleList.length; i++){
						if (moduleList[i].seqId === '537'){
							$scope.menuId = moduleList[i].id;
						}
					}
				}
				if (app){
					appId = JSON.parse(app).appId;
				}
                //初始化模板下拉框
                var init_temp = function(){
                	document.getElementById("fileform").reset();
                	$scope.temp_type_name = null;
                	$scope.temp_type_id = null;
                	$http({
                		url: moduleService.getServiceUrl() + "/edTemplate/list",
                		method: 'GET',
                		params:{
                			page: -1,
                			size: -1,
                			appId: appId,
                			moduleId: $scope.menuId
                		}
                	}).success(
                	function(resp) {
                		$scope.tempTypes = resp.data.list;
                	}).error(function(error) {});
                };
                
                
				//下拉框改变
				$scope.type_change = function(temp_type){
					$scope.temp_type_name = temp_type == null ? null : temp_type.templateName;
					$scope.temp_type_id = temp_type == null ? null : temp_type.id;
				};
				
				//数据状态初始化
				$scope.init_dataType = function(){
					$http({
						method:'get',
						url:moduleService.getServiceUrl() + '/edTemplate/dataType?time='+ new Date().getTime(),
					}).success(
					function(res){
						$scope.dataTypes = res.data;
					}).error(
					function(){
					});
				};
				//数据显示状态改变
				$scope.dataType_change = function(type){
					var code = type == null ? null : type.code;
					$scope.dataType = code;
					dataBack();
				};
				
				
				//excel模板导出
				$scope.excelExport = function(){
					if($scope.temp_type_name == null){
						layer.msg("请先选择模板类型!",{time:2000});
						return;
					}
					$scope.surl = moduleService.getServiceUrl() + '/edTemplate/excelExport?templateId='+$scope.temp_type_id;
					var objectUrl = $scope.surl;
					var aForExcel = $("<a><span class='forExcel'>下载excel</span></a>").attr("href",objectUrl);
			        // console.log(aForExcel);
			        $("body").append(aForExcel);
			        $(".forExcel").click();
			        aForExcel.remove();
			      };
			      
			      
				//excel导入
				$scope.fileInput = function() {
					if($scope.temp_type_id == null ){
						layer.msg("请选择模板类型!",{time:2000});
						return ;
					}
					var fd = new FormData();
					// var file = document.querySelector('input[type=file]')[0].files[0];
					var file = $('#input-file')[0].files[0];
					if(file == null){
						layer.msg("请选择文件",{time:2000});
						return ;
					}
					fd.append('multipartFile', file);
					fd.append('templateId', $scope.temp_type_id);
					$scope._load = layer.load(3, {shade: [0.3, '#000000']});
					$http({
						method: 'POST',
						url: moduleService.getServiceUrl() + '/edTemplate/excelImport',
						data: fd,
						headers: {'Content-Type': undefined},
						transformRequest: angular.identity
					}).success(
					function(res) {
						// console.log(res);
						if (res.resCode === 1) {
							$scope.logId = res.data;
							modalOk();
							dataBack();
                            getNullCheckFileds();
							//关闭加载Loading
							layer.close($scope._load);
						  }else {
							layer.msg(res.resMsg,{time:3000});
							layer.close($scope._load);
						  }



						}).error(
						function(error){
							layer.msg("出现了错误，请稍后再试！",{time:2000});
							layer.close($scope._load);
						});
					  };
                          
				//请求数据回显
				var dataBack = function(){
					if($scope.logId == null){
						return null;
					}
					var type = $scope.dataType == null ? null : $scope.dataType;
					$http({
						method:'get',
						url:moduleService.getServiceUrl() + '/edTemplate/dataBack?time='+ new Date().getTime(),
						params:{
							templateId:$scope.temp_type_id,
							logId:$scope.logId,
							dataType:type,
							page:$scope.paginationConf.currentPage,
							size:$scope.paginationConf.itemsPerPage
						}
					}).success(
					function(res){
						if(res.resCode === 1){
							if(res.data.total === 0 && type == null ){
								resetList();
							}else {
								$scope.paginationConf.totalItems = res.data.total;
								$scope.mapList = res.data.list;
								$scope.showSave = true;
							}
						}
					}).error(
					function(){
					})
				};
				
				// 配置分页基本参数
				$scope.paginationConf = {
					currentPage: $location.search().currentPage ? $location.search().currentPage : 1,
					itemsPerPage: 10,
					pagesLength: 5,
					perPageOptions: [5,10,20,50],
					onChange: function() {
						$location.search('currentPage', $scope.paginationConf.currentPage);
					}
				};
				
				// 通过$watch currentPage和itemperPage,当他们一变化的时候，重新获取数据条目
				$scope.$watch('paginationConf.currentPage + paginationConf.itemsPerPage',dataBack);
				
				//重置
				var resetList = function(){
					$scope.showSave = false;
					$scope.paginationConf.totalItems = 0;
					$scope.mapList = [];
					$scope.logId = null;
//					
};

				//返回
				$scope.saveBack = function(){
					var layerIndex = layer.confirm('当前数据尚未保存，是否退出？', {
						btn: ['退出', '返回']
					},function(){
						resetList();
						$scope.$apply();
						layer.close(layerIndex);	
					},function(){
						return;
					});
				};
				
				var index;
				//保存数据到真实数据库
				$scope.savedata = function(){
					layer.msg("正在检查数据，请等待！",{time:1000});
					index = layer.load(1, {
						shade: [0.1,'#fff']
					});
					$http({
						method:"get",
						url:moduleService.getServiceUrl() + '/edTemplate/checkAllData?time='+ new Date().getTime(),
						params:{
							templateId:$scope.temp_type_id,
							logId:$scope.logId
						}
					}).success(
					function(res){
						layer.close(index);
						if(res.resCode === 1){
							saveTemporary();
						}else{
							layer.msg("存在错误数据，请校验完后再保存！",{time:2000});
							return;
						}
					}).error(
					function(){
					});
					
				};
				
                //保存到真是数据库
                function saveTemporary() {
                	$http({
                		method:'post',
                		url:moduleService.getServiceUrl() + '/edTemplate/saveTemporary',
                		params:{
                			templateId:$scope.temp_type_id ,
                			logId:$scope.logId
                		}
                	}).success(
                	function(res){
                		if(res.resCode === 1){
                			layer.msg("成功保存数据！",{time:2000});
                			resetList();
                		}else{
                			wrongTip(res.resMsg);
                		}
                		layer.close(index);
                	}).error(
                	function (res) {
                		layer.msg(res.resMsg,{time:2000});
                		layer.close(index);
                	}
                	);
                	var index = layer.load(1, {
                		shade: [0.1,'#fff']
                	});
                }
				//保存到真实数据库出错提示
				function wrongTip(message) {
					var x = /Field .* doesn't have a default value/;
					var y = /.*id.*/;
					if(x.test(message)){
						if(y.test(message)){
							layer.alert('错误信息: <br>'+message+'<br>暂不支持的主键类型!');
						}else {
							getNullField(message);
						}
					}else {
						layer.alert(message);
					}
				}
				
                //获取当前模板选择表的非空字段
                function getNullField(message) {
                	$http({
                		method:'get',
                		url:moduleService.getServiceUrl() + '/edTemplate/getNullField?time='+ new Date().getTime(),
                		params:{
                			templateId:$scope.temp_type_id
                		}
                	}).success(function (res) {
                		if(res.resCode === 1){
                			layer.alert('错误信息: <br>'+message+'<br>该表存在以下非空字段需要在模板中选择:<br>'+res.data);
                		}else {
                			layer.alert('错误信息: <br>'+message);
                		}
                	}).error(
                	function (res) {
                		layer.alert('错误信息: <br>'+message);
                	}
                	);
                }

				//查询所有需要非空效验字段
				function getNullCheckFileds() {
					$http({
						method:'get',
						url:moduleService.getServiceUrl() + '/edTemplate/getNullCheckFileds?time='+ new Date().getTime(),
						params:{
							templateId:$scope.temp_type_id
						}
					}).success(function (res) {
						if(res.resCode === 1){
							$scope.NullCheckFileds = res.data;
						}else {
						}
					}).error(
						function (res) {

						}
					);
				}


				//编辑数据模态框
				$scope.edit = function(map){
					document.getElementById("fromId").reset();
					$scope.editMap = map;
					if(map['数据校验状态'] === '正确'){
						var layerIndex = layer.confirm('当前数据已经正确，是否继续修改？', {
							btn: ['修改', '返回']
						},function(){
							$('#editBox').modal("show");
							layer.close(layerIndex);	
						},function(){
							return;
						});
					}else{
						$('#editBox').modal("show");
					}
				};
				//关闭模态框并修改数据
				$scope.editBoxOk = function(map){
					var val;
					for(var key in map){
						if(key === "$$hashKey" || key === "id"
							|| key === '数据校验状态' || key === 'log_id'){
							continue; 
					}
					val = $("input[name="+key+"]").val();
					map[key] = val;
				}
				$('#editBox').modal("hide");
				check(map);
			};
				//校验数据
				var check = function(map){
					$http({
						method:"post",
						url:moduleService.getServiceUrl() + '/edTemplate/checkTemporary',
						params:{
							templateId : $scope.temp_type_id,
							data : JSON.stringify(map)
						}
					}).success(
					function(res){
						if(res.resCode === 1){
							var index = $scope.mapList.indexOf(map);
							$scope.mapList[index] = res.data;
						}
					}).error(
					function(){
					});
				};
				//删除数据
				$scope.deleteData = function(map){
					var layerIndex = layer.confirm('是否删除本条数据？', {
						btn: ['删除', '返回']
					},function(){
						$http({
							method:"DELETE",
							url:moduleService.getServiceUrl() + '/edTemplate/deleteTemporary',
							params:{
								templateId:$scope.temp_type_id,
								id:map['id'],
								logId:map['log_id']
							}
						}).success(
						function(res){
							if(res.resCode === 1){
								layer.msg("删除成功！",{time:2000});
								dataBack();
							}
						}).error(
						function(){
							layer.msg("删除出现错误！",{time:2000});
						});
						layer.close(layerIndex);	
					},function(){
						return;
					});
				};
				
				//删除所有数据
				$scope.deleteAll = function () {
					var layerIndex = layer.confirm('是否删除所有数据？', {
						btn: ['删除', '返回']
					},function(){
						$http({
							method:"DELETE",
							url:moduleService.getServiceUrl() + '/edTemplate/deleteTemporary',
							params:{
								templateId:$scope.temp_type_id,
								logId:$scope.logId
							}
						}).success(
						function(res){
							if(res.resCode === 1){
								layer.msg("删除成功！",{time:2000});
								resetList();
							}
						}).error(
						function(){
							layer.msg("删除出现错误！",{time:2000});
						});
						layer.close(layerIndex);
					},function(){
						return;
					});
				};
				
				//删除数组指定元素
				var deleteArr = function(arr,val){
					var index = arr.indexOf(val);
					if(index > -1){
						arr.splice(index,1);
					}
				};

				//是否必须
				$scope.isRequired = function (key) {
					if ($scope.NullCheckFileds == null){
						return false;
					}
                   return $scope.NullCheckFileds.indexOf(key) > 0 ;
                };

				//不显示回显数据的id
				$scope.isShowId = function(map,key){
					//显示校验状态的中文信息
					var data = map[MESSAGE];
					if(data === 1){
						map[MESSAGE] = '正确';
					}else if(data === 2){
						map[MESSAGE] = '警告';
					}else if(data === 3){
						map[MESSAGE] = '错误';
					}
					if(key === "id"){
						return false;
					}else if(key === 'log_id'){
						return false;
					}else if (key === 'wrong_field'){
						return false;
					}else if (key === '数据校验状态'){
						return false;
					}else if (key === '错误信息'){
						return false;
					}
					return true;
				};
				//不显示修改页面的数据
				$scope.isShowField = function(key){
					if(key === "id"){
						return false;
					}else if(key === 'log_id'){
						return false;
					}else if(key === '数据校验状态'){
						return false;
					}else if(key === '错误信息'){
						return false;
					}else if (key === 'wrong_field'){
						return false;
					}
					return true;
				};
				
				//判断是否从日志界面跳转
				if(globalParam.getter() != null 
					&& globalParam.getter().id != null
					&& globalParam.getter().templateId != null){
					$scope.temp_type_id = globalParam.getter().templateId;
				$scope.logId = globalParam.getter().id;
				dataBack();
				getNullCheckFileds();
				globalParam.setter(null);
			}
			
				//主键类型
				$scope.idTypeFun = function (x) {
					$scope.idType = x;
				};
			}]);

})(window, angular);

