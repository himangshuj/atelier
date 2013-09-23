angular.module( 'sokratik', [
  'templates-app',
  'templates-common',
  'sokratik.home',
  'sokratik.login',
  'sokratik.forgot-password',
  'sokratik.register',
  'ui.router',
  'ui.route'
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider ) {
  $urlRouterProvider.otherwise( '/home' );
})

.run( function run ( titleService ) {
  titleService.setSuffix( ' | Sokratik' );
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {
})

;

