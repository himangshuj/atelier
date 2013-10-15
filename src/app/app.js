(function (ng, module) {
    ng.module(module, [
            'templates-app',
            'templates-common',
            'ui.router',
            'ui.route',
            'ui.validate',
            'ngCookies',
            'titleService',
            'ui.bootstrap',
            'sokratik.kamillion.start',
            'sokratik.kamillion.edit',
            'sokratik.kamillion.record',
            'sokratik.kamillion.player'
        ])

        .config(function myAppConfig($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/start');
        })

        .run(function run(titleService) {
        })

        .controller('AppCtrl', function AppCtrl($scope, $location) {
        });
})(angular, "sokratik.kamillion");

