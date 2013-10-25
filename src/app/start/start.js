(function (ng, module) {
    ng.module(module, [
            'ui.router',
            'titleService',
            'plusOne'
        ])

        .config(["$stateProvider",function config($stateProvider) {
            $stateProvider.state('start', {
                url: '/start',
                views: {
                    "main": {
                        controller: 'StartCtrl',
                        templateUrl: 'start/start.tpl.html'
                    }
                }
            });
        }])
        .controller('StartCtrl',["$state","titleService", function ($state, titleService) {
            titleService.setTitle('Start Creating');
        }]);
})(angular, "sokratik.atelier.start");