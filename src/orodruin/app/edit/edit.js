angular.module('sokratik.orodruin.edit', [
        'ui.router',
        'titleService',
        'plusOne',
        'orodruin.directives.glamdring',
        'orodruin.services.istari',
        'ngSanitize'
    ])

    .config(function config($stateProvider) {
        $stateProvider.state('edit', {
            url: '/edit/:templateName/:presentationId/:page',
            resolve: {
                presentationId: function ($stateParams) {
                    var presentationId = $stateParams.presentationId ? $stateParams.presentationId : "defaultPresentation";
                    return presentationId;
                },
                page: function ($stateParams) {
                    var page = $stateParams.page ? $stateParams.page : "0";
                    return page;
                },
                templateVars: function($stateParams, anduril, presentationId){
                    return anduril.fetchVariablesForPresentationId(presentationId);
                }
            },
            data: {
                mode: "edit"
            },
            views: {
                "main": {
                    templateUrl: "edit/edit.tpl.html",
                    controller: 'EditCtrl'
                }
            }
        })
            .state("edit.template", {
                url: '',
                views: {
                    "template": {
                        templateUrl: function (stateParams) {
                            return "static/templates/" + stateParams.templateName + ".html";
                        },
                        controller: 'TemplateCtrl'
                    }
                }
            });

    })
    .controller('EditCtrl', function EditController(titleService, $stateParams, $scope, $state, anduril, presentationId, page) {
        titleService.setTitle('Edit the knowledge');
        $scope.templateName = $stateParams.templateName;
        anduril.put(presentationId, page, "templateName", $stateParams.templateName);
        $scope.ok = function () {
            $state.go('playback', {presentationId: presentationId});
        };
        $state.go("edit.template", {templateName: $stateParams.templateName});
    })
    .controller('SearchCtrl', function SearchController() {
    })
    .controller('TemplateCtrl', function TemplateController(anduril, $scope) {
    })
;



