angular.module('app').factory('globaltree', [ function(){
    var regionObject = {};
    
    var _setter = function (data) {
    	regionObject = data;
    };
    
    var _getter = function () {
    	return regionObject;
    };
    
    return {
    	setter: _setter,
      getter: _getter
    }               
}]);
