(function (ng, app) {
    var _newSlideModalCtrl = ["$scope", "$modalInstance", "templates", function ($scope, $modalInstance, templates) {
        $scope.templates = templates;
        $scope.selected = {
            template: $scope.templates[0]
        };

        $scope.ok = function () {
            $modalInstance.close($scope.selected.template);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }];
    ng.module(app, [
            'ui.router',
            'titleService',
            'plusOne',
            'sokratik.atelier.directives.minerva',
            'sokratik.atelier.services.istari',
            'ngSanitize'
        ])

        .config(["$stateProvider", function config($stateProvider) {
            $stateProvider.state('edit', {
                url: '/edit/:questionId/:templateName/:presentationId/:page',
                resolve: {

                    page: ["$stateParams", function ($stateParams) {
                        //noinspection JSUnresolvedFunction
                        return parseInt($stateParams.page ? $stateParams.page : 0, 10);
                    }],
                    answer: ["anduril", "$stateParams", function (anduril, $stateParams) {
                        return anduril.fetchAnswer($stateParams.presentationId);
                    }],
                    images: ["$stateParams", "anduril", function ($stateParams, anduril) {
                        return anduril.fetchImages($stateParams.questionId);
                    }],
                    templates: ["anduril", function (anduril) {
                        return anduril.getAllTemplates();
                    }]

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
                    url: '/',
                    views: {
                        "template": {
                            templateUrl: "edit/template.tpl.html",
                            controller: 'TemplateCtrl'
                        }
                    }
                });

        }])

        .controller('EditCtrl',
            ["$scope", "page", "$stateParams", "answer", "anduril", "$state", "templates", "$modal", "$log",
                function ($scope, page, $stateParams, answer, anduril, $state, templates, $modal, $log) {
                    //noinspection JSUnresolvedFunction
                    $scope.page = page = parseInt(page, 10);
                    var presentationId = $stateParams.presentationId;
                    $scope.presentationId = presentationId;
                    $scope.presentation = answer.presentationData[page] || ng.copy(answer.presentationData[page - 1]);
                    $scope.totalPages = _.size(answer.presentationData);
                    $scope.presentation.keyVals = _.extend({}, $scope.presentation.keyVals);
                    anduril.put(presentationId, page, $scope.presentation);
                    $scope.presentation.templateName = $scope.presentation.templateName || $stateParams.templateName;
                    $scope.presentation.css = [""];
                    $state.go("edit.template", {templateName: $stateParams.templateName, presentationId: presentationId, page: page});

                    page = parseInt(page, 10);
                    $scope.resume = function () {
                        anduril.put(presentationId, page, $scope.presentation);
                        anduril.post(presentationId);
                        $state.go("record.master");

                    };

                    $scope.goToPage = function (page) {
                        "use strict";
                        anduril.post(presentationId);
                        $state.go("edit.template", {templateName: $stateParams.templateName, presentationId: presentationId, page: page});
                    };
                    $scope.remove = function () {
                        "use strict";
                        anduril.remove(presentationId, page);
                        anduril.post(presentationId);
                        $state.go("edit.template", {templateName: $stateParams.templateName, presentationId: presentationId, page: page - 1});
                    };
                    $scope.templates = templates;
                    $scope.add = function () {
                        var modalInstance = $modal.open({
                            templateUrl: 'edit/newslide.modal.tpl.html',
                            controller: _newSlideModalCtrl,
                            resolve: {
                                templates: function () {
                                    return $scope.templates;
                                }
                            }
                        });

                        modalInstance.result.then(function (selectedTemplate) {
                            $scope.selected = selectedTemplate;
                            anduril.insert(presentationId, page + 1, {templateName: selectedTemplate});

                            anduril.post(presentationId);
                            $state.go("edit", {templateName: selectedTemplate, "presentationId": presentationId, "page": page + 1 });
                        }, function () {
                            //noinspection JSUnresolvedFunction
                            $log.info('Modal dismissed at: ' + new Date());
                        });

                    };

                }])
        .controller('TemplateCtrl', function TemplateController() {
        });
})(angular, "sokratik.atelier.edit");



