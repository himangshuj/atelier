angular.module( 'sokratik.login', [
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
        $stateProvider.state( 'login', {
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
    .controller( 'LoginCtrl', function LoginController( $scope, titleService ) {
        titleService.setTitle( 'Login' );
    })

;

