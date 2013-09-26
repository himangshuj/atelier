angular.module( 'sokratik.forgot-password', [
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
        $stateProvider.state( 'forgot-password', {
            url: '/forgotPass',
            views: {
                "main": {
                    controller: 'PasswordCtrl',
                    templateUrl: 'forgot-password/forgot-password.tpl.html'
                }
            }
        });
    })

/**
 * And of course we define a controller for our route.
 */
    .controller( 'PasswordCtrl', function PasswordController( $scope, titleService ) {
        titleService.setTitle( 'Password Reset' );
    })
;