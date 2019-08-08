'use strict';

/* Controllers */
  // signin controller
app.controller('SigninFormController', ['$scope', '$http', '$state', function($scope, $http, $state) {
    $scope.user = {};
    $scope.authError = null;
    $scope.login = function() {
      $scope.authError = null;
      // Try to login
      $http.post('api/login', {username: $scope.user.username, password: $scope.user.password})
      .then(function(response) {
        if ( !response.data.user ) {
          $scope.authError = '用户名或密码有误，请重新输入！';
        }else{
          $state.go('app.dashboard-v1');
        }

      }, function(x) {
        $scope.authError = 'Server Error';
      });
    };
  }])
;