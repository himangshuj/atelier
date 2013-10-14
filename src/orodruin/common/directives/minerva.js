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
        scope.model.css = ["fragment"];
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
    var _sokratikDialogueContainerDirective = ["$state", "dialogue", "$q", "anduril",
        function ($state, dialogue, $q, anduril) {
            return {
                restrict: "E",
                templateUrl: $state.current.data.mode + "/dialogue.tpl.html",
                scope: {
                    presentation: "=",
                    presentations: "=",
                    index: "@",
                    scriptId: "@"
                },

                controller: function ($scope) {
                    $scope.templateName = "static/presentations/templates/" + $scope.presentation.templateName + ".html";
                    $scope.currentFragmentIndex = 0;
                    var dialogueFragments = [];
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
                    this.getFragments = function () {
                        return _.clone(dialogueFragments);//returns a shallow copy
                    };
                },
                controllerAs: "dialogueCtrl",
                link: function (scope) {
                    var index = 0;
                    //noinspection JSUnresolvedVariable
                    var dialogueCtrl = scope.dialogueCtrl;
                    var fnMap = {};
                    scope.$watch(index, function () {
                        var dialogueFragments = dialogueCtrl.getFragments();
                        if (index > _.size(dialogueCtrl.getFragments())) {
                            dialogue.resetFragments(dialogueFragments, $q.defer()).then(
                                function (obj) {
                                    anduril.recordAction(scope.scriptId, obj);
                                    console.log(obj);
                                    $q.when(dialogue.showAllDialogues({"dialogues": scope.presentations}, $q.defer())).
                                        then(function (resp) {
                                            anduril.recordAction(scope.scriptId, resp);
                                        });

                                });
                        }
                    });
                    fnMap.next = function () {
                        var dialogueFragments = dialogueCtrl.getFragments();
                        if (index < _.size(dialogueFragments)) {
                            return    dialogue.nextFragment({fragments: dialogueFragments, index: (index++)}, $q.defer());
                        }
                        else {
                            return dialogue.resetFragments(dialogueFragments, $q.defer()).then(
                                function (obj) {
                                    dialogue.showAllDialogues({"dialogues": scope.presentations}, $q.defer());
                                    return obj;
                                }
                            );
                        }

                    };
                    fnMap.previous = function () {

                        var dialogueFragments = dialogueCtrl.getFragments();
                        if (index > 0 && index < _.size(dialogueFragments)) {
                            return dialogue.prevFragment({fragments: dialogueFragments, index: (index--)}, $q.defer());
                        }
                        else {
                            return dialogue.showAllDialogues({dialogues: scope.presentations}, $q.defer());
                        }

                    };

                    fnMap.zoom_in = function () {
                        return  dialogue.zoom({dialogues: scope.presentations, page: scope.index}, $q.defer());
                    };

                    fnMap.zoom_out = function () {
                        return dialogue.showAllDialogues({dialogues: scope.presentations}, $q.defer());
                    };
                    var _recorderFn = function (prevValue) {
                        $q.when(prevValue).then(
                            function (resp) {
                                anduril.recordAction(scope.scriptId, resp);
                            }
                        );

                    };

                    var wrappedFunctions = _.map(fnMap, function (value, key) {
                        return [key, _.compose(_recorderFn, value)];
                    });
                    _.extend(scope, _.object(wrappedFunctions));
                }



            };

        }];
    ng.module(app, ['orodruin.services.istari', 'orodruin.services.dialogue'])
        .directive("sokratikFragment", _sokratikFragmentDirective)
        .directive("sokratikDialogue", _sokratikDialogueContainerDirective);

})(angular, "orodruin.directives.minerva");