/**
 * This file defines all the directives used to construct the html for the app
 */
(function (ng, app) {
    'use strict';

    var _injectors = {};

    /*   */
    /**
     * the modal which will be used to populate images
     * @type {Array} the list of angular dependencies and the modal controller
     * @private
     */
    var _imageSelectionModal = ["$scope", "$modalInstance", "images", "initImage", "initCaption",
        function ($scope, $modalInstance, images, initImage, initCaption) {
            $scope.selected = {
                image: initImage || (((images || [{}])[0]) || {}) .url,
                caption: initCaption
            };
            $scope.imageGroups = _.chain(images).
                groupBy(function (image, index) {
                    //noinspection JSUnresolvedVariable
                    return Math.floor(index / 5);//splitting images into groups of 5
                })
                .values()
                .value();
            var ok = $scope.ok = function (selectedImage, selectedCaption) {
                $modalInstance.close({selectedImage: selectedImage, selectedCaption: selectedCaption});
            };
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
            $scope.storeImage = function ($event) {
                $event.preventDefault();
                ok($scope.selected.image, $scope.selected.caption);
            };
        }];

    /**
     * Common actions performed by all post link functions of sokratik fragment
     * @param scope the scope for the directive , this is isolated
     * @param attrs the attrs of the element
     * @param sokratikDialogueCtrl the controller of encapsulating directive
     * @private
     */
    var _fragmentCommonLink = function (scope, attrs, sokratikDialogueCtrl) {
        scope.model = {};
        scope.model.value = sokratikDialogueCtrl.getProperty(attrs.model);
        scope.model.caption = sokratikDialogueCtrl.getProperty(attrs.model + '_Caption');
        scope.model.css = ["fragment"];
        if (!_.str.isBlank(scope.model.value)) {
            sokratikDialogueCtrl.addFragment(scope.model);
        }
    };

    var editCommonLink = function (scope, attrs) {
        scope.model.value = scope.model.value || attrs.default;
        scope.model.placeholder = attrs.placeholder;
    };

    var _fragmentLink = {
        "edit": {
            "text": function (scope, element, attrs, sokratikDialogueCtrl) {
                _fragmentCommonLink(scope, attrs, sokratikDialogueCtrl);
                // Listen for change events to enable binding

                // Write data to the model
                scope.read = function () {
                    sokratikDialogueCtrl.setProperty(attrs.model, scope.model.value);
                };
                editCommonLink(scope, attrs);

            },
            "image": function (scope, element, attrs, sokratikDialogueCtrl) {
                _fragmentCommonLink(scope, attrs, sokratikDialogueCtrl);
                //registers the current value in the parent dialogue which is aware of the entire presentation
                editCommonLink(scope, attrs);
                scope.addImage = function () {
                    var modalInstance = _injectors.$modal.open({
                        templateUrl: 'edit/image.modal.tpl.html',
                        controller: _imageSelectionModal,
                        resolve: {
                            initCaption: function () {
                                return sokratikDialogueCtrl.getProperty(attrs.model + '_Caption');
                            },
                            initImage: function () {
                                return sokratikDialogueCtrl.getProperty(attrs.model);
                            },
                            images: function () {
                                return _injectors.anduril.fetchImages(_injectors.$stateParams.questionId);
                            }
                        }
                    });

                    modalInstance.result.then(function (selected) {
                        scope.model.value = _injectors.$sce.trustAsHtml(selected.selectedImage);
                        scope.model.caption = selected.selectedCaption;
                        sokratikDialogueCtrl.setProperty(attrs.model, selected.selectedImage);
                        sokratikDialogueCtrl.setProperty(attrs.model + '_Caption', selected.selectedCaption);
                    }, function () {
                        //noinspection JSUnresolvedFunction
                        _injectors.$log.info('Modal dismissed at: ' + new Date());
                    });
                    return modalInstance;
                };

            }

        },
        "record": {
            "text": function (scope, element, attrs, sokratikDialogueCtrl) {
                _fragmentCommonLink(scope, attrs, sokratikDialogueCtrl);
                scope.model.value = sokratikDialogueCtrl.getProperty(attrs.model) ;

            },
            image: function (scope, element, attrs, sokratikDialogueCtrl) {
                _fragmentCommonLink(scope, attrs, sokratikDialogueCtrl);

            }
        },
        "play": {
            "text": function (scope, element, attrs, sokratikDialogueCtrl) {
                _fragmentCommonLink(scope, attrs, sokratikDialogueCtrl);
                scope.model.value = sokratikDialogueCtrl.getProperty(attrs.model);

            },
            image: function (scope, element, attrs, sokratikDialogueCtrl) {
                _fragmentCommonLink(scope, attrs, sokratikDialogueCtrl);

            }

        }
    };

    var _dialogueLink = {
        "edit": function (scope) {
        },
        "record": function (scope) {
            //noinspection JSUnresolvedVariable
            (scope.addFragment || ng.noop)({fragment: scope.dialogueCtrl.getFragments });


        },
        "play": function (scope) {
            //noinspection JSUnresolvedVariable
            (scope.addFragment || ng.noop)({fragment: scope.dialogueCtrl.getFragments });

        }

    };

    var _sokratikFragmentDirective = ["$state", "$sce", "anduril", "$stateParams", "$modal",
        function ($state, $sce, anduril, $stateParams, $modal) {
            _injectors.$sce = $sce;
            _injectors.anduril = anduril;
            _injectors.$modal = $modal;
            _injectors.$stateParams = $stateParams;
            return {
                "restrict": "E",
                "transclude": true,
                "templateUrl": function (tElement, tAttrs) {
                    return $state.current.data.mode + "/" + ng.lowercase(tAttrs.type || "text") + ".fragment.tpl.html";
                },
                require: "^sokratikDialogue",
                "scope": {
                    "model": "="
                },
                compile: function (tElement, tAttrs) {
                    return {pre: _fragmentLink[$state.current.data.mode][ng.lowercase(tAttrs.type || "text")]};
                }

            };

        }];
    var _sokratikDialogueContainerDirective = ["$state", "dialogue", "$q", "anduril",
        function ($state, dialogue, $q, anduril) {
            _injectors.$q = $q;
            _injectors.dialogue = dialogue;
            _injectors.anduril = anduril;
            _injectors.$state = $state;
            return {
                restrict: "E",
                templateUrl: function () {
                    return $state.current.data.mode + "/dialogue.tpl.html";
                },
                scope: {
                    presentation: "=",
                    index: "@",
                    presentationId: "@",
                    addFragment: "&?",
                    questionId: "@?"
                },

                controller: "DialogueController",
                controllerAs: "dialogueCtrl",
                compile: function () {
                    return _dialogueLink[$state.current.data.mode];
                }



            };

        }];
    ng.module(app, ['sokratik.atelier.istari.services',
            'sokratik.atelier.minerva.services',
            'ui.bootstrap',
            'templates-app'
        ])
        .directive("sokratikFragment", _sokratikFragmentDirective)
        .directive("sokratikDialogue", _sokratikDialogueContainerDirective)
        .controller("DialogueController", ["$scope", function ($scope) {
            $scope.templateName = "templates/" + ($scope.presentation.templateName || "imageText") + ".tpl.html";
            $scope.currentFragmentIndex = 0;
            var dialogueFragments = [];
            this.addFragment = function (dialogueFragment) {
                dialogueFragments = _.chain(dialogueFragments)
                    .union(dialogueFragment)
                    .flatten()
                    .value();
            };
            this.getProperty = function (propertyKey, defaultValue) {
                return ($scope.presentation.keyVals || {})[propertyKey] || defaultValue;
            };

            this.setProperty = function (propertyKey, value) {
                ($scope.presentation.keyVals || {})[propertyKey] = value;
            };
            this.getFragments = function () {
                return dialogueFragments;//returns a shallow copy
            };
        }]);
})(angular, "sokratik.atelier.minerva.directives");