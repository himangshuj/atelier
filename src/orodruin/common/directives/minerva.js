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
        },
        "play": {
            "text": function (scope, element, attrs, sokratikDialogueCtrl) {
                _fragmentCommonLink(scope, attrs, sokratikDialogueCtrl);

            }

        }
    };

    var _dialogueLink = {
        "edit": function (scope, $q, anduril, dialogue) {
        },
        "record": function (scope) {
            var index = 0;
            //noinspection JSUnresolvedVariable
            var dialogueCtrl = scope.dialogueCtrl;
            var fnMap = {};
            scope.$watch(index, function () {
                var dialogueFragments = dialogueCtrl.getFragments();
                if (index > _.size(dialogueCtrl.getFragments())) {
                    _injectors.dialogue.resetFragments(dialogueFragments, _injectors.$q.defer()).then(
                        function (obj) {
                            _injectors.anduril.recordAction(scope.scriptId, obj);
                            console.log(obj);
                            _injectors.$q.when(_injectors.dialogue.showAllDialogues({"dialogues": scope.presentations}, _injectors.$q.defer())).
                                then(function (resp) {
                                    _injectors.anduril.recordAction(scope.scriptId, resp);
                                });

                        });
                }
            });
            fnMap.next = function () {
                var dialogueFragments = dialogueCtrl.getFragments();
                if (index < _.size(dialogueFragments)) {
                    return    _injectors.dialogue.nextFragment({fragments: dialogueFragments, index: (index++)}, _injectors.$q.defer());
                }
                else {
                    return _injectors.dialogue.resetFragments(dialogueFragments, _injectors.$q.defer()).then(
                        function (obj) {
                            _injectors.dialogue.showAllDialogues({"dialogues": scope.presentations}, _injectors.$q.defer());
                            return obj;
                        }
                    );
                }

            };
            fnMap.previous = function () {

                var dialogueFragments = dialogueCtrl.getFragments();
                if (index > 0 && index < _.size(dialogueFragments)) {
                    return _injectors.dialogue.prevFragment({fragments: dialogueFragments, index: (index--)}, _injectors.$q.defer());
                }
                else {
                    return _injectors.dialogue.showAllDialogues({dialogues: scope.presentations}, _injectors.$q.defer());
                }

            };

            fnMap.zoom_in = function () {
                return  _injectors.dialogue.zoom({dialogues: scope.presentations, page: scope.index}, _injectors.$q.defer());
            };

            fnMap.zoom_out = function () {
                return _injectors.dialogue.showAllDialogues({dialogues: scope.presentations}, _injectors.$q.defer());
            };
            var _recorderFn = function (prevValue) {
                _injectors.$q.when(prevValue).then(
                    function (resp) {
                        _injectors.anduril.recordAction(scope.scriptId, resp);
                    }
                );

            };

            var wrappedFunctions = _.map(fnMap, function (value, key) {
                return [key, _.compose(_recorderFn, value)];
            });
            _.extend(scope, _.object(wrappedFunctions));
        },
        "play": function (scope) {
            scope.addFragment({fragment: scope.dialogueCtrl.getFragments });

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
            _injectors.$q = $q;
            _injectors.dialogue = dialogue;
            _injectors.anduril = anduril;
            return {
                restrict: "E",
                templateUrl: $state.current.data.mode + "/dialogue.tpl.html",
                scope: {
                    presentation: "=",
                    presentations: "=",
                    index: "@",
                    scriptId: "@",
                    addFragment: "&?"
                },

                controller: function ($scope) {
                    $scope.templateName = "static/presentations/templates/" + ($scope.presentation.templateName || "master") + ".html";
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
                compile: function () {
                    return _dialogueLink[$state.current.data.mode];
                }



            };

        }];
    ng.module(app, ['orodruin.services.istari', 'orodruin.services.dialogue'])
        .directive("sokratikFragment", _sokratikFragmentDirective)
        .directive("sokratikDialogue", _sokratikDialogueContainerDirective);

})(angular, "orodruin.directives.minerva");