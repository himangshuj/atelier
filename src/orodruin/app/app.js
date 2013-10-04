angular.module('sokratik.orodruin', [
        'templates-app',
        'templates-common',
        'ui.router',
        'ui.route',
        'ui.validate',
        'ngCookies',
        'titleService',
        'ui.bootstrap',
        'sokratik.orodruin.start',
        'sokratik.orodruin.edit',
        'orodruin.services.istari'
    ])

    .config(function myAppConfig($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/start');
    })

    .run(function run(titleService) {
    })

    .controller('AppCtrl', function AppCtrl($scope, $location) {
    });

