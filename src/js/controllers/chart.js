'use strict';

/* Controllers */

app.controller('FlotChartDemoCtrl', ['$scope','$http','$location', function($scope,$http,$location) {
    
	var box;
    box = $scope.box = [];
	$scope.get = function(){
		console.log('get...');
            $http({
                url: 'http://g.cn',
                method: 'post',
            }).success(function(data) {
            	console.log(data);
            return box.push(data);
        });
	}
	
    //分页
    var reGetProducts = function(){
        $http({
        	url:'http://f.cn',
        	method:'post',
        	//params:{pageNumber: $scope.paginationConf.currentPage-1,pageSize: $scope.paginationConf.itemsPerPage},
        }).success(function(resp){
        	// 变更分页的总数
            $scope.paginationConf.totalItems = resp.data.totalNum;
//            // 变更产品条目
            $scope.moduleList = resp.data.records;
        }).error(function(error){
        	
        });
    };

	// 配置分页基本参数
	$scope.paginationConf = {
			currentPage: $location.search().currentPage ? $location.search().currentPage : 1,
	        itemsPerPage: 10,
	        pagesLength:5,
	        perPageOptions: [5,10,20,50],
	        onChange: function(){
	            console.log($scope.paginationConf.currentPage);
	            $location.search('currentPage', $scope.paginationConf.currentPage);
	        }
	};

	// 通过$watch currentPage和itemperPage 当他们一变化的时候，重新获取数据条目
	$scope.$watch('paginationConf.currentPage + paginationConf.itemsPerPage', reGetProducts);

	
	$scope.moduleDelete = function(modeuleId,moduleName){
  	  var layerIndex = layer.confirm('确定删除 【'+moduleName+'】 吗？', {
  			btn : [ '确定', '取消' ]
  	// 按钮
		  }, function() {
			  $.ajax({url : 'http://d.com', type: 'post', data : {moduleId:modeuleId}}).success(
					function success(result) {
							reGetProducts();
							
							layer.alert(result.data.resMsg, {
								skin : 'layui-layer-lan',
								closeBtn : 1,
								anim : 4
							});
					}, function failure(result) {
						layer.alert('删除失败！', {
							skin : 'layui-layer-lan',
							closeBtn : 0,
							anim : 4
						});
					});
			layer.close(layerIndex);
		}, function() {

		});
  	  
    };
    
}]);

Mock.mock('http://g.cn', {
    'name'       : '@name()',
    'age|1-100': 100,
    'color'       : '@color'
});


Mock.mock('http://f.cn', {
    'data'       : {
    	'currentPageNumber':1,
    	'pageSize':10,
    	'records|10':[{
    		'createTime':'@date',
    		'description':'',
    		'id':'@id',
    		'lastModifyTime':'',
    		'name':'@name',
    		'serviceUrl':'@url',
    		'status|1':[0,1],
    		'type|1':[1,2,3],
    		'version':'@version'
    	}],
    	'totalNum':'50',
    	'totalPage':'5'
    },
    'resCode': 1,
    'resMsg'       : 'Success'
});


Mock.mock('http://d.com','post',function(options){
    var id = parseInt(options.body.split("=")[1])//获取删除的id
    var index;
//    for(var i in arr){
//        if(arr[i].id===id){//在数组arr里找到这个id
//            index=i
//            break;
//        }
//    }
//    arr.splice(index,1)//把这个id对应的对象从数组里删除
//    return arr;//返回这个数组,也就是返回处理后的假数据
})