(function (ng, module) {
    ng.module(module, [
            'ui.router',
            'titleService',
            'plusOne'
        ])
        .config(["$stateProvider",function config($stateProvider) {
            $stateProvider.state('start', {
                url: '/start'
               /* onEnter:["$rootScope",function($rootScope){
                    $rootScope.loading = false;
                }]*/

            });
        }])
        .controller('StartCtrl',["$state","titleService", function ($state, titleService) {
            titleService.setTitle('Start Creating');
        }]);
})(angular, "sokratik.atelier.start");