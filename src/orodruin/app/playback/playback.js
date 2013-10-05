angular.module('sokratik.orodruin.playback', [
        'ui.router',
        'titleService',
        'plusOne',
        'orodruin.services.istari',
        'ngSanitize'
    ])

    .config(function config($stateProvider) {
        $stateProvider.state('playback', {
            url: '/playback/:templateId',
            resolve: {
                templateName: function ($stateParams, anduril) {
                        return anduril.fetchVariablesForTemplateId($stateParams.templateId);
                }
            },
            views: {
                "main": {
                    controller: 'PlayCtrl',
                    templateUrl: 'playback/playback.tpl.html'
                }
            }
        })
            .state('playback.template', {
                url: '?templateName',
                views: {
                    "template": {
                        templateUrl: function (stateParams) {
                            return "static/templates/" + stateParams.templateName + ".html";
                        }
                    }
                }
            });
    })
    .controller('PlayCtrl', function PlayController($scope, titleService, anduril, $stateParams, $state) {
        console.log("2");
        titleService.setTitle("Sokratik | " + anduril.getVar($stateParams.templateId, "title", "Lets Learn"));
        $state.go("playback.template", {templateName: anduril.getVar($stateParams.templateId, "templateName", "Lets Learn"),
            templateId: $stateParams.templateId});

    });