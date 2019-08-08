345678910111213141516171819202122232425

<!--引入到你的主页面里面-->
<script src="dataService.js"></script>创建一个factory'use strict';angular.module('myApp').factory('datadService',['$window',function($window) { return{  //存储单个属性  set :function(key,value){  $window.localStorage[key]=value;  },   //读取单个属性  get:function(key,defaultValue){  return $window.localStorage[key] || defaultValue;  },   //存储对象，以JSON格式存储  setObject:function(key,value){  $window.localStorage[key]=JSON.stringify(value);  },   //读取对象  getObject: function (key) {  return JSON.parse($window.localStorage[key] || '{}');  } }}]);