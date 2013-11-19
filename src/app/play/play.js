(function (ng, app) {
    var _injectors = {};
    var fragmentFn = ng.noop;//global variable is this really bad
    var _executeInstruction = function (instructions, dialogue, $state, scriptIndex, timeStamp, $q) {
        "use strict";
        var index = scriptIndex || 0;
        var instruction = instructions[index];
        var delay = instructions[index].actionInitiated - (timeStamp || instructions[index].actionInitiated);

        var intraState = function (args) {
            console.log(args);
            _executeInstruction(instructions, dialogue, $state, scriptIndex++, instructions[index].actionInitiated,$q);
        };
        _.delay(function () {
            var params = _.extend({scriptIndex: ++scriptIndex, timeStamp: instruction.actionInitiated}, (instruction.args || {}).params);
            var postExecute = ng.equals(instruction.fnName, "changeState") ? ng.noop : intraState;
            $q.when(dialogue[instruction.fnName](_.extend((instruction.args || {}), {"params": params, fragments: fragmentFn()}), $q.defer())).then(postExecute);
        }, delay);
    };
    ng.module(app, [
            'ui.router',
            'titleService',
            'plusOne',
            'sokratik.atelier.services.istari',
            'sokratik.atelier.services.dialogue',
            'ngSanitize',
            'ngAnimate'])
        .config(["$stateProvider", function config($stateProvider) {
            $stateProvider.state('play', {
                url: '/play/:presentationId/:scriptIndex/:timeStamp',
                resolve: {
                    answer: ["$stateParams", "anduril", function ($stateParams, anduril) {
                        return anduril.fetchAnswer($stateParams.presentationId);
                    }],
                    instructionDetails: ["answer", "$stateParams", function (answer, $stateParams) {
                        "use strict";
                        var index = $stateParams.scriptIndex || 0;
                        var instruction = answer.script[index];
                        var delay = answer.script[index].actionInitiated - ($stateParams.timeStamp || answer.script[index].actionInitiated);
                        return {instruction: instruction, delay: delay};
                    }]
                },
                data: {
                    mode: "play"
                },
                views: {
                    "main": {
                        controller: 'PlayCtrl',
                        templateUrl: 'play/play.tpl.html'
                    }
                }
            })
                .state('play.master', {
                    url: '/master',
                    views: {
                        "screen": {
                            templateUrl: 'play/master.tpl.html',
                            controller: 'PlayMaster'
                        }
                    }
                })
                .state('play.activate', {
                    url: '/activate/:page',
                    views: {
                        "screen": {
                            templateUrl: 'play/activate.tpl.html',
                            controller: 'PlayActive'
                        }
                    }
                })
                .state('play.activate.transition', {
                    url: '/transition',
                    views: {
                        "transition": {
                            template: '',
                            controller: 'PlayTransition'
                        }
                    }
                })
            ;
        }])
        .controller("PlayCtrl", ["$scope", "answer", "$stateParams", "dialogue", "$state", "$q",
            function ($scope, answer, $stateParams, dialogue, $state, $q) {
                $scope.presentations = answer.presentationData;
                $scope.presentationId = $stateParams.presentationId;
                _injectors.dialogue = dialogue;
                $scope.audioLocation = "/recordings/" + $stateParams.presentationId + ".wav";
                console.log("parent");
                if ($stateParams.scriptIndex === '0') {
                    _executeInstruction(answer.script,
                        dialogue, $state,
                        $stateParams.scriptIndex, $stateParams.timeStamp, $q);
                }
            }])
        .controller("PlayMaster", ["$scope", "$state", "answer", "dialogue", "$stateParams", "$q",
            function ($scope, $state, answer, dialogue, $stateParams, $q) {
                "use strict";
                console.log("master");
                _executeInstruction(answer.script,
                    dialogue, $state,
                    $stateParams.scriptIndex, $stateParams.timeStamp, $q);


            }])

        .controller("PlayActive", ["$scope", "$state", "$stateParams", "answer", "dialogue", "$q",
            function ($scope, $state, $stateParams, answer, dialogue, $q) {
                "use strict";
                var page = parseInt($stateParams.page, 10);
                console.log("activate");
                $scope.presentation = answer.presentationData[page];
                $scope.presentationId = $stateParams.presentationId;

                $scope.addFragment = function (fragment) {//TODO remove duplication
                    fragmentFn = fragment;
                    function resetFragments() {
                        dialogue.resetFragments({fragments: fragmentFn()}, ng.noop);
                        _executeInstruction(answer.script,
                            dialogue, $state,
                            $stateParams.scriptIndex, $stateParams.timeStamp, $q);

                    }

                    if (_.size(fragment()) > 0) {  //TODO tie this properly with fragments in presentation also try prelinking and postlinking
                        resetFragments();
                    } else {
                        _.delay(resetFragments, 1000);//dom is not yet ready retry after 1000 ms
                    }
                };
            }]);
})(angular, "sokratik.atelier.player");