/**
 * This file defines all the directives used to construct the html for the app
 */
(function (ng, app) {
    'use strict';

    var _injectors = {};

    /**
     * Common actions performed by all post link functions of sokratik fragment
     * @param scope the scope for the directive , this is isolated
     * @param attrs the attrs of the element
     * @param sokratikDialogueCtrl the controller of encapsulating directive
     * @private
     */
    var _fragmentCommonLink = function (scope, attrs, sokratikDialogueCtrl) {
        scope.model = {};
        scope.model.value = sokratikDialogueCtrl.getProperty(attrs.model) || attrs.default;
        scope.model.class = ["fragment"];
        sokratikDialogueCtrl.addFragment(scope.model);

    };


    var _fragmentLink = {
        "edit": {
            "text": function (scope, element, attrs, sokratikDialogueCtrl) {
                _fragmentCommonLink(scope, attrs, sokratikDialogueCtrl);
                new MediumEditor(element);
                // Listen for change events to enable binding
                element.on('blur keyup change', function () {
                    scope.$apply(read);
                });
                sokratikDialogueCtrl.setProperty(attrs.model, sokratikDialogueCtrl.getProperty(attrs.model, "default"));

                // Write data to the model
                function read() {
                    var html = angular.element(element).children().html();
                    scope.model.value = _injectors.$sce.trustAsHtml(html);
                    sokratikDialogueCtrl.setProperty(attrs.model, html);
                }
            }
        },
        "record": {
            "text": function (scope, element, attrs, sokratikDialogueCtrl) {
                _fragmentCommonLink(scope, attrs, sokratikDialogueCtrl);

            }
        }
    };

    var _sokratikFragmentDirective = ["$state", "$sce", function ($state, $sce) {
        _injectors.$sce = $sce;
        return {
            "restrict": "E",
            "transclude": true,
            "templateUrl": function (tElement, tAttrs) {
                return $state.current.data.mode + "/" + ng.lowercase(tAttrs.type || "text") + ".fragment.tpl.html";
            },
            require: "?^sokratikDialogue",
            "scope": {
                "model": "="
            },
            compile: function (tElement, tAttrs) {
                return _fragmentLink[$state.current.data.mode][ng.lowercase(tAttrs.type || "text")];
            }

        };

    }];
    var _sokratikDialogueContainerDirective = ["$state", "dialogue", function ($state, dialogue) {
        return {
            restrict: "E",
            templateUrl: $state.current.data.mode + "/dialogue.tpl.html",
            scope: {
                presentation: "=",
                presentations: "="
            },

            controller: function ($scope) {
                $scope.templateName = "static/presentations/templates/" + $scope.presentation.templateName + ".html";
                $scope.currentFragmentIndex = 0;
                var dialogueFragments = [];
                var index = 0;
                this.addFragment = function (dialogueFragment) {
                    dialogueFragments = _.chain(dialogueFragments)
                        .union(dialogueFragment)
                        .flatten()
                        .value();
                };
                this.getProperty = function (propertyKey, defaultValue) {
                    return $scope.presentation[propertyKey] || defaultValue;
                };

                this.setProperty = function (propertyKey, value) {
                    $scope.presentation[propertyKey] = value;
                };

                $scope.next = function () {
                    if (index < _.size(dialogueFragments)) {
                        dialogue.nextFragment({fragments: dialogueFragments, index: (index++)});
                    }
                    else {
                        dialogue.resetFragments(dialogueFragments);
                        dialogue.showAllDialogues({"dialogues": $scope.presentations});
                    }

                };
                $scope.prev = function () {
                    if (index < 0) {
                        dialogue.prevFragment({fragments: dialogueFragments, index: (index--)});
                    }
                    else {
                        dialogue.showAllDialogues({dialogues: $scope.presentations});
                    }

                };

                $scope.zoom_in = function () {
                    dialogue.zoom({dialogues: $scope.presentations, title: $scope.presentation.title});
                };

                $scope.zoom_out = function () {
                    dialogue.showAllDialogues({dialogues: $scope.presentations});
                };
            }


        };

    }];
    ng.module(app, ['orodruin.services.istari', 'orodruin.services.dialogue'])
        .directive("sokratikFragment", _sokratikFragmentDirective)
        .directive("sokratikDialogue", _sokratikDialogueContainerDirective);

})(angular, "orodruin.directives.minerva");