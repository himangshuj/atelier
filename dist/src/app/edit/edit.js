(function (ng, app) {
  var _newSlideModalCtrl = [
      '$scope',
      '$modalInstance',
      'templates',
      function ($scope, $modalInstance, templates) {
        $scope.templates = templates;
        $scope.selected = { template: $scope.templates[0] };
        $scope.ok = function () {
          $modalInstance.close($scope.selected.template);
        };
        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
      }
    ];
  ng.module(app, [
    'ui.router',
    'titleService',
    'plusOne',
    'sokratik.atelier.directives.minerva',
    'sokratik.atelier.services.istari',
    'ngSanitize'
  ]).config([
    '$stateProvider',
    function config($stateProvider) {
      $stateProvider.state('edit', {
        url: '/edit/:templateName/:presentationId/:page',
        resolve: {
          presentationId: [
            '$stateParams',
            function ($stateParams) {
              return $stateParams.presentationId ? $stateParams.presentationId : 'default';
            }
          ],
          page: [
            '$stateParams',
            function ($stateParams) {
              return parseInt($stateParams.page ? $stateParams.page : 0, 10);
            }
          ],
          answer: [
            'anduril',
            'presentationId',
            function (anduril, presentationId) {
              return anduril.fetchAnswer(presentationId);
            }
          ]
        },
        data: { mode: 'edit' },
        views: {
          'main': {
            templateUrl: 'edit/edit.tpl.html',
            controller: 'EditCtrl'
          }
        }
      }).state('edit.template', {
        url: '/',
        resolve: {
          templates: [
            'anduril',
            function (anduril) {
              return anduril.getAllTemplates();
            }
          ]
        },
        views: {
          'template': {
            templateUrl: 'edit/template.tpl.html',
            controller: 'TemplateCtrl'
          },
          'control': {
            templateUrl: 'edit/controller.tpl.html',
            controller: 'FlowCtrl'
          }
        }
      });
    }
  ]).controller('EditCtrl', [
    'titleService',
    '$stateParams',
    '$scope',
    '$state',
    'anduril',
    'presentationId',
    'page',
    'answer',
    function (titleService, $stateParams, $scope, $state, anduril, presentationId, page, answer) {
      titleService.setTitle('Edit the knowledge');
      $scope.page = page = parseInt(page, 10);
      $scope.presentationId = presentationId;
      $scope.presentation = answer.presentationData[page] || ng.copy(answer.presentationData[page - 1]);
      $scope.presentation.keyVals = _.extend({}, $scope.presentation.keyVals);
      anduril.put(presentationId, page, $scope.presentation);
      $scope.presentation.templateName = $scope.presentation.templateName || $stateParams.templateName;
      $scope.presentation.css = ['zoom-in'];
      $state.go('edit.template', {
        templateName: $stateParams.templateName,
        presentationId: presentationId,
        page: page
      });
    }
  ]).controller('FlowCtrl', [
    '$scope',
    '$state',
    'anduril',
    'presentationId',
    '$modal',
    '$log',
    'page',
    'templates',
    'answer',
    function ($scope, $state, anduril, presentationId, $modal, $log, page, templates, answer) {
      page = parseInt(page, 10);
      $scope.resume = function () {
        anduril.put(presentationId, page, $scope.presentation);
        anduril.post(presentationId);
        $state.go('record');
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
          anduril.put(presentationId, page, $scope.presentation);
          anduril.post(presentationId);
          $state.go('edit', {
            templateName: selectedTemplate,
            'presentationId': presentationId,
            'page': page + 1
          });
        }, function () {
          $log.info('Modal dismissed at: ' + new Date());
        });
      };
    }
  ]).controller('TemplateCtrl', function TemplateController() {
  });
}(angular, 'sokratik.atelier.edit'));