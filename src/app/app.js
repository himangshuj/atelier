(function (ng, module) {
    ng.module(module, [
            'templates-app',
            'templates-common',
            'ui.router',
            'ui.validate',
            'ngCookies',
            'ui.bootstrap',
            'sokratik.atelier.edit',
            'sokratik.atelier.record'
        ])

        .config(function myAppConfig($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/start');
        })



        .controller('AppCtrlDemo', function AppCtrl($scope, $location) {
        });
})(angular, "sokratik.atelier.demo");

