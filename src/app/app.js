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
            'sokratik.atelier.start',
            'sokratik.atelier.edit',
            'sokratik.atelier.record'
        ])

        .config(function myAppConfig($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/start');
        })

        .run(function run(titleService) {
        })

        .controller('AppCtrlDemo', function AppCtrl($scope, $location) {
        });
})(angular, "sokratik.atelier.demo");

