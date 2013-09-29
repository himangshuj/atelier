angular.module('sokratik.orodruin.start', [
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
        $scope.myInterval = 5000;
        $scope.slides = [
            {"text": "template1", "image": "static/template1.jpg"},
            {"text": "template2", "image": "static/template2.jpg"},
            {"text": "template3", "image": "static/template3.jpg"}
        ];
    });