angular.module( 'sokratik.register', [
        'ui.router',
        'titleService',
        'plusOne'
    ])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
    .config(function config( $stateProvider ) {
        $stateProvider.state( 'register', {
            url: '/register',
            views: {
                "main": {
                    controller: 'RegistrationCtrl',
                    templateUrl: 'register/register.tpl.html'
                }
            }
        });
    })

/**
 * And of course we define a controller for our route.
 */
    .controller( 'RegistrationCtrl', function RegistrationController( $scope, titleService,$state,$http ) {
        titleService.setTitle( 'Register' );
        $scope.registerUser = function(){
           $state.go("login");
        };
    })

;

