angular.module('sokratik.orodruin.edit', [
        'ui.router',
        'titleService',
        'plusOne',
        'orodruin.edit.directives',
        'orodruin.services.istari',
        'ngSanitize'
    ])

    .config(function config($stateProvider) {
        $stateProvider.state('edit', {
            url: '/edit/:templateName?templateId',
            resolve: {
                templateId: function ($stateParams,anduril) {
                    var templateId = $stateParams.templateId ? $stateParams.templateId : "default";
                    anduril.put(templateId,"templateName",$stateParams.templateName);
                    return templateId;
                }
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
                    "search": {
                        controller: 'SearchCtrl',
                        templateUrl: "edit/search.tpl.html"

                    },
                    "template": {
                        templateUrl: function (stateParams) {
                            return "static/templates/" + stateParams.templateName + ".html";
                        },
                        controller: 'TemplateCtrl'
                    }
                }
            });

    })
    .controller('EditCtrl', function EditController(titleService, $stateParams, $scope, $state, anduril, templateId) {
        titleService.setTitle('Edit the knowledge');
        $scope.templateName = $stateParams.templateName;
        $scope.ok = function () {
            anduril.post($stateParams.templateName);
        };
        $state.go("edit.template", {templateName: $stateParams.templateName, templateId: templateId});
    })
    .controller('SearchCtrl', function SearchController() {
    })
    .controller('TemplateCtrl', function TemplateController(anduril, $scope, templateId) {
    })
;



