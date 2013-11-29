(function (ng, app) {
  'use strict';
  var _injectors = {};
  var _imageSelectionModal = [
      '$scope',
      '$modalInstance',
      'images',
      function ($scope, $modalInstance, images) {
        $scope.selected = { image: images[0].url };
        $scope.imageGroups = _.chain(images).groupBy(function (image, index) {
          return Math.floor(index / 5);
        }).values().value();
        $scope.ok = function (selectedImage) {
          $modalInstance.close(selectedImage);
        };
        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
      }
    ];
  var _fragmentCommonLink = function (scope, attrs, sokratikDialogueCtrl) {
    scope.model = {};
    scope.model.value = sokratikDialogueCtrl.getProperty(attrs.model);
    scope.model.css = ['fragment'];
    if (!_.str.isBlank(scope.model.value)) {
      sokratikDialogueCtrl.addFragment(scope.model);
    }
  };
  var editCommonLink = function (scope, attrs) {
    scope.model.value = scope.model.value || attrs.default;
    scope.model.placeholder = attrs.placeholder;
  };
  var _fragmentLink = {
      'edit': {
        'text': function (scope, element, attrs, sokratikDialogueCtrl) {
          _fragmentCommonLink(scope, attrs, sokratikDialogueCtrl);
          element.on('blur keyup change', function () {
            scope.$apply(read);
          });
          editCommonLink(scope, attrs);
          function read() {
            sokratikDialogueCtrl.setProperty(attrs.model, scope.model.value);
          }
        },
        'image': function (scope, element, attrs, sokratikDialogueCtrl) {
          _fragmentCommonLink(scope, attrs, sokratikDialogueCtrl);
          editCommonLink(scope, attrs);
          scope.addImage = function () {
            var modalInstance = _injectors.$modal.open({
                templateUrl: 'edit/image.modal.tpl.html',
                controller: _imageSelectionModal,
                resolve: {
                  images: function () {
                    return _injectors.anduril.fetchImages(_injectors.$stateParams.questionId);
                  }
                }
              });
            modalInstance.result.then(function (selectedImage) {
              scope.model.value = _injectors.$sce.trustAsHtml(selectedImage);
              sokratikDialogueCtrl.setProperty(attrs.model, selectedImage);
            }, function () {
              _injectors.$log.info('Modal dismissed at: ' + new Date());
            });
          };
        }
      },
      'record': {
        'text': function (scope, element, attrs, sokratikDialogueCtrl) {
          _fragmentCommonLink(scope, attrs, sokratikDialogueCtrl);
          scope.model.value = sokratikDialogueCtrl.getProperty(attrs.model) || '<br/>';
        },
        image: function (scope, element, attrs, sokratikDialogueCtrl) {
          _fragmentCommonLink(scope, attrs, sokratikDialogueCtrl);
        }
      },
      'play': {
        'text': function (scope, element, attrs, sokratikDialogueCtrl) {
          _fragmentCommonLink(scope, attrs, sokratikDialogueCtrl);
          scope.model.value = sokratikDialogueCtrl.getProperty(attrs.model) || '<br/>';
        },
        image: function (scope, element, attrs, sokratikDialogueCtrl) {
          _fragmentCommonLink(scope, attrs, sokratikDialogueCtrl);
        }
      }
    };
  var _dialogueLink = {
      'edit': function (scope) {
      },
      'record': function (scope) {
        (scope.addFragment || ng.noop)({ fragment: scope.dialogueCtrl.getFragments });
      },
      'play': function (scope) {
        (scope.addFragment || ng.noop)({ fragment: scope.dialogueCtrl.getFragments });
      }
    };
  var _sokratikFragmentDirective = [
      '$state',
      '$sce',
      'anduril',
      '$stateParams',
      '$modal',
      function ($state, $sce, anduril, $stateParams, $modal) {
        _injectors.$sce = $sce;
        _injectors.anduril = anduril;
        _injectors.$modal = $modal;
        _injectors.$stateParams = $stateParams;
        return {
          'restrict': 'E',
          'transclude': true,
          'templateUrl': function (tElement, tAttrs) {
            return $state.current.data.mode + '/' + ng.lowercase(tAttrs.type || 'text') + '.fragment.tpl.html';
          },
          require: '?^sokratikDialogue',
          'scope': { 'model': '=' },
          compile: function (tElement, tAttrs) {
            return { pre: _fragmentLink[$state.current.data.mode][ng.lowercase(tAttrs.type || 'text')] };
          }
        };
      }
    ];
  var _sokratikDialogueContainerDirective = [
      '$state',
      'dialogue',
      '$q',
      'anduril',
      function ($state, dialogue, $q, anduril) {
        _injectors.$q = $q;
        _injectors.dialogue = dialogue;
        _injectors.anduril = anduril;
        _injectors.$state = $state;
        return {
          restrict: 'E',
          templateUrl: function () {
            return $state.current.data.mode + '/dialogue.tpl.html';
          },
          scope: {
            presentation: '=',
            index: '@',
            presentationId: '@',
            addFragment: '&?',
            questionId: '@?',
            increaseImages: '=',
            decreaseImages: '='
          },
          controller: [
            '$scope',
            function ($scope) {
              $scope.templateName = '/views/templates/' + ($scope.presentation.templateName || 'imageText') + '.html';
              $scope.currentFragmentIndex = 0;
              var dialogueFragments = [];
              this.addFragment = function (dialogueFragment) {
                dialogueFragments = _.chain(dialogueFragments).union(dialogueFragment).flatten().value();
              };
              this.getProperty = function (propertyKey, defaultValue) {
                return ($scope.presentation.keyVals || {})[propertyKey] || defaultValue;
              };
              this.setProperty = function (propertyKey, value) {
                ($scope.presentation.keyVals || {})[propertyKey] = value;
              };
              this.getFragments = function () {
                return dialogueFragments;
              };
            }
          ],
          controllerAs: 'dialogueCtrl',
          compile: function () {
            return _dialogueLink[$state.current.data.mode];
          }
        };
      }
    ];
  ng.module(app, [
    'sokratik.atelier.services.istari',
    'sokratik.atelier.services.dialogue'
  ]).directive('sokratikFragment', _sokratikFragmentDirective).directive('sokratikDialogue', _sokratikDialogueContainerDirective);
}(angular, 'sokratik.atelier.directives.minerva'));