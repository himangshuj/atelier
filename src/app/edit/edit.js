(function (ng, app) {

    var _newSlideModalCtrl = function ($scope, $modalInstance, templates) {
        $scope.templates = templates.data;
        $scope.selected = {
            template: $scope.templates[0]
        };

        $scope.ok = function () {
            $modalInstance.close($scope.selected.template);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };
    ng.module(app, [
            'ui.router',
            'titleService',
            'plusOne',
            'sokratik.kamillion.directives.minerva',
            'sokratik.kamillion.services.istari',
            'ngSanitize'
        ])

        .config(function config($stateProvider) {
            $stateProvider.state('edit', {
                url: '/edit/:templateName/:presentationId/:page',
                resolve: {
                    presentationId: function ($stateParams) {
                        return $stateParams.presentationId ? $stateParams.presentationId : "default";
                    },
                    page: function ($stateParams) {
                        return $stateParams.page ? $stateParams.page : '0';
                    },
                    templateVars: function ($stateParams, anduril, presentationId) {
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
                    url: '/',
                    views: {
                        "template": {
                            templateUrl: "edit/template.tpl.html",
                            controller: 'TemplateCtrl'
                        },
                        "control": {
                            templateUrl: "edit/controller.tpl.html",
                            controller: 'FlowCtrl'
                        }
                    }
                });

        })

        .controller('EditCtrl', function EditController(titleService, $stateParams, $scope, $state, anduril, presentationId, page, templateVars) {
            titleService.setTitle('Edit the knowledge');
            $scope.page = page = parseInt(page, 10);
            $scope.presentationId = $stateParams.presentationId;
            $scope.presentation = anduril.fetchVariablesForPresentationId(presentationId)[page] || {};
            $scope.presentation.templateName = $scope.presentation.templateName || $stateParams.templateName;
            $scope.presentation.css = ["zoom-in"];
            $state.go("edit.template", {templateName: $stateParams.templateName, presentationId: presentationId, page: page});
        })
        .controller('FlowCtrl', function FlowController($scope, $state, anduril, presentationId, $modal, $log,page) {
            $scope.resume = function () {
                anduril.post();
                anduril.put(presentationId,page,$scope.presentation);
                $state.go("record");
            };
            $scope.templates = anduril.getAllTemplates();
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
                    $state.go("edit", {templateName: selectedTemplate, "presentationId": presentationId, "page": $scope.page + 1 });
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

            };
        })
        .controller('TemplateCtrl', function TemplateController(anduril, $scope, $stateParams, page, templateVars) {

        });
})(angular, "sokratik.kamillion.edit");



