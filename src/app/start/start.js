(function (ng, module) {
    ng.module(module, [
            'ui.router',
            'titleService',
            'plusOne'
        ])

        .config(function config($stateProvider) {
            $stateProvider.state('start', {
                url: '/start',
                views: {
                    "main": {
                        controller: 'StartCtrl',
                        templateUrl: 'start/start.tpl.html'
                    }
                }
            });
        })
        .controller('StartCtrl', function HomeController($scope, titleService) {
            titleService.setTitle('Start Creating');
        });
})(angular, "sokratik.kamillion.start");