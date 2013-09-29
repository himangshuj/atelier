angular.module('sokratik.orodruin.edit', [
        'ui.router',
        'titleService',
        'plusOne'
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
                url: '',
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
    .controller('EditCtrl', function EditController(titleService, $stateParams, $scope, $state) {
        titleService.setTitle('Edit the knowledge');
        $scope.templateName = $stateParams.templateName;
        $state.go("edit.template");
    })
    .controller('SearchCtrl', function SearchController() {
    })
;

