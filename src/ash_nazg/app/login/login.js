angular.module('sokratik.login', [
        'ui.router',
        'titleService',
        'plusOne'
    ])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
    .config(function config($stateProvider) {
        $stateProvider.state('login', {
            url: '/login',
            views: {
                "main": {
                    controller: 'LoginCtrl',
                    templateUrl: 'login/login.tpl.html'
                }
            }
        });
    })

/**
 * And of course we define a controller for our route.
 */
    .controller('LoginCtrl', function LoginController($scope, titleService, $stateParams, $state, $cookies,$http) {
        $scope.user={};
        if ($cookies.user != null) {
            $scope.user.name= $cookies.user.name;
        }
        $scope.sokratikLogin = function(){
            var data = {"email": $scope.user.email, "password":$scope.user.password} ;
            $http.defaults.headers.post['X-CSRFToken'] = $cookies['csrftoken'];
            $http.defaults.headers.post['Content-Type'] = "application/x-www-form-urlencoded";
            console.log(angular.toJson(data));

            $http.post("/login_post", "email="+$scope.user.email+"&password="+$scope.user.password,{"X-CSRFToken": $cookies.csrftoken,
                'Content-Type': 'application/x-www-form-urlencoded'}).success(function(data, status, headers, config) {
                console.log(data);
                console.log(headers);
                console.log(config);
            });

        };
        titleService.setTitle('Login');
    })

;

