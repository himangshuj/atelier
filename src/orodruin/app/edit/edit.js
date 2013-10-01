angular.module('sokratik.orodruin.edit', [
        'ui.router',
        'titleService',
        'plusOne',
        'orodruin.edit.directives',
        'ngSanitize'
    ])

    .config(function config($stateProvider) {
        $stateProvider.state('edit', {
            url: '/edit/:templateName',
            views: {
                "main": {
                    templateUrl: "edit/edit.tpl.html",
                    controller: 'EditCtrl'
                }
            }
        })
            .state("edit.template", {
                url: '/',
                views: {
                    "search": {
                        controller: 'SearchCtrl',
                        templateUrl: "edit/search.tpl.html"

                    },
                    "template": {
                        templateUrl: function (stateParams) {
                            return "static/templates/" + stateParams.templateName + ".html";
                        }
                    }
                }
            });

    })
    .controller('EditCtrl', function EditController(titleService, $stateParams, $scope, $state, $compile, $rootElement) {
        titleService.setTitle('Edit the knowledge');
        $scope.image4 = "http://hacklibschool.files.wordpress.com/2011/07/personal-branding.png";
        $scope.templateName = $stateParams.templateName;
        $state.go("edit.template", {templateName: $stateParams.templateName});
    })
    .controller('SearchCtrl', function SearchController() {
    });



