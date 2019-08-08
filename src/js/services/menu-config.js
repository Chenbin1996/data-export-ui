angular.module('menu.config', [])
	.service('menuConfig', ['$document', '$q','$http','$localStorage','moduleService', function ($document, $q, $http, $localStorage,moduleService) {


        this.targetHTML = function (menuId) {
            console.log('menuId'+menuId);
            console.log(moduleService.getHtmlUrl())
            var htmlAndJsList = moduleService.getMoudleHtmlAndJs();
            for(var i=0;i<htmlAndJsList.length;i++){
                var mathState = htmlAndJsList[i].type+"_"+htmlAndJsList[i].seqId;
                if(menuId === mathState){
                    console.log('targetHtml'+htmlAndJsList[i].targetHtml);
                    $localStorage.pageId = htmlAndJsList[i].seqId;
                    return moduleService.getHtmlUrl() + "/" + htmlAndJsList[i].targetHtml;
                }
            }
            return moduleService.getHtmlUrl() + "/src/tpl/404.html";

        };

        this.targetJS = function (menuId) {
            console.log('menuId'+menuId);
            var htmlAndJsList = moduleService.getMoudleHtmlAndJs();
            var resTargetJS = [];
            for(var i=0;i<htmlAndJsList.length;i++){
                var mathState = htmlAndJsList[i].type+"_"+htmlAndJsList[i].seqId;
                if(menuId === mathState){
                    console.log('targetJs'+htmlAndJsList[i].targetJs);

                    if(htmlAndJsList[i].targetJs && htmlAndJsList[i].targetJs.length >0){
                        for(var j=0;j<htmlAndJsList[i].targetJs.length; j++){
                            //targetJsArr.push(htmlAndJsList[i].targetJs[j]);
                            var jsPath =  moduleService.getHtmlUrl() + "/" + htmlAndJsList[i].targetJs[j];
                            resTargetJS.push(jsPath);
                        }
                    }
                }
            }
            if(resTargetJS && resTargetJS.length > 0){
                return resTargetJS;
            }else{
                return [moduleService.getHtmlUrl() + "/src/js/controllers/404.js"];
            }
        }
        this.getServiceURL = function(){
            return moduleService.getHtmlUrl();
        }
}]);