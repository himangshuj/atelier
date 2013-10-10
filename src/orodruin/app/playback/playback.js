angular.module('sokratik.orodruin.playback', [
        'ui.router',
        'titleService',
        'plusOne',
        'orodruin.services.istari',
        'ngSanitize'    ])

    .config(function config($stateProvider) {
        $stateProvider.state('playback', {
            url: '/playback/:presentationId/:page',
            resolve: {
                presentationVars: function ($stateParams, anduril) {
                    return anduril.fetchVariablesForPresentationId($stateParams.presentationId);
                }
            },
            data: {
                mode: "play"
            },
            views: {
                "main": {
                    controller: 'PlayCtrl',
                    templateUrl: 'playback/playback.tpl.html'
                }
            }
        })

        ;


    })
    .controller('PlayCtrl', function PlayController($scope, titleService, anduril, $stateParams, presentationVars, $timeout) {
        titleService.setTitle("Sokratik | " + anduril.getVar($stateParams.presentationId, $stateParams.page, "title", "Lets Learn"));
        var templateName = anduril.getVar($stateParams.presentationId, $stateParams.page, "templateName", "template3");
        $scope.templates = ["template1", "template2"];
        var presentations = _.map(presentationVars.data, function (obj) { //todo move to clojure script
            obj.templateName = obj.templateName ? obj.templateName : "default";
            obj.css = ["slide", "nggrid"];
            return obj;
        });
        $scope.changeClass = function (index) {
            alert(index);
        };
        $scope.presentations = presentations;
        //$state.go("playback.template", {templateName: templateName});
    })
    .controller('PlayTemplateCtrl', function PlayTemplateCtrl($state, $scope) {
        $state.go('playback.template.play');

    });
