'use strict';

/* Controllers */
angular.module('app').controller('AppCtrl', ['$scope', '$translate', '$localStorage', '$rootScope', 'globaltree','$window', 'moduleService', '$http',
	function($scope, $translate, $localStorage,$rootScope,globaltree, $window, moduleService, $http) {
		// add 'ie' classes to html
		var isIE = !!navigator.userAgent.match(/MSIE/i);
		isIE && angular.element($window.document.body).addClass('ie');
		isSmartDevice($window) && angular.element($window.document.body).addClass('smart');

		$http.get("config/ip.json").success(function(data) {
			// $localStorage.serviceUrl = data['ip'];
			// console.log('ipAdd = ' + $localStorage.serviceUrl);
		}).error(function() {
			alert("config/ip.json/配置初始化出错了！")
		});

		
		
		// logo显示隐藏
		$scope.noblock = false;
		// config
		$scope.app = {
			name: '数据导入',
			version: '2.1.1',
			logoImg: 'img/logo.png',

			// for chart colors
			color: {
				primary: '#7266ba',
				info: '#23b7e5',
				success: '#27c24c',
				warning: '#fad733',
				danger: '#f05050',
				light: '#e8eff0',
				dark: '#3a3f51',
				black: '#1c2b36'
			},
			settings: {
				themeID: 1,
				navbarHeaderColor: 'bg-black',
				navbarCollapseColor: 'bg-white-only',
				asideColor: 'bg-black',
				headerFixed: true,
				asideFixed: false,
				asideFolded: false,
				asideDock: false,
				container: false
			}
		}

        // save settings to local storage
        if(angular.isDefined($localStorage.settings)) {
            $scope.app.settings = $localStorage.settings;
        } else {
            $localStorage.settings = $scope.app.settings;
        }
        if(moduleService.menus && moduleService.menus!= '' && moduleService.menus!= undefined && moduleService.menus!= null) {
            $scope.appConfig = moduleService.getMoudleConfig();
        } else {
            //加载配置信息
            moduleService.getConfig();
            $scope.appConfig = moduleService.getMoudleConfig();
        };
        moduleService.getIpConfig();

        //获取二级菜单,默认就三级菜单
        $scope.getSecondMenu = function(seqId) {
            var menus = moduleService.getMoudleMenus();
            var secondMenu = [];
            for(var i = 0; i < menus.length; i++) {
                if(menus[i].parentId == seqId) {
                    menus[i].children = [];
                    if(menus[i].url == "") //还有子菜单
                    {
                        for(var j = 0; j < menus.length; j++) {
                            if(menus[i].seqId == menus[j].parentId) {
                                menus[i].children.push(menus[j]);
                            }
                        }
                    }
                    secondMenu.push(menus[i]);
                }
            }
            $localStorage.currentMenu = secondMenu;
            $scope.menuObj = secondMenu;
        }

		$scope.$watch('app.settings', function() {
			if($scope.app.settings.asideDock && $scope.app.settings.asideFixed) {
				// aside dock and fixed must set the header fixed.
				$scope.app.settings.headerFixed = true;
			}
			// save to local storage
			$localStorage.settings = $scope.app.settings;
		}, true);

		// angular translate
		$scope.lang = {
			isopen: false
		};
		$scope.langs = {
			en: 'English',
			de_DE: 'German',
			it_IT: 'Italian'
		};
		$scope.selectLang = $scope.langs[$translate.proposedLanguage()] || "English";
		$scope.setLang = function(langKey, $event) {
			// set the current lang
			$scope.selectLang = $scope.langs[langKey];
			// You can change the language during runtime
			$translate.use(langKey);
			$scope.lang.isopen = !$scope.lang.isopen;
		};

		function isSmartDevice($window) {
			// Adapted from http://www.detectmobilebrowsers.com
			var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
			// Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
			return(/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
		}

	}
]);