var atelierPlayer = function (ng, app, answer) {
    var fragmentFn = ng.noop;//global variable is this really bad
    var _executeInstruction = function (instructions, modules, $state, scriptIndex, timeStamp, $q, pausedInterval, $scope) {

        "use strict";
        if (scriptIndex < _.size(instructions)) {
            var index = scriptIndex || 0;
            var instruction = instructions[index];
            var delay = 0;
            pausedInterval = parseInt(pausedInterval, 10);
            var recordingDelay = instructions[index].actionInitiated - (timeStamp || instructions[index].actionInitiated);
            if (_.isEqual(instruction.fnName, "resume")) {
                pausedInterval += recordingDelay;
            } else if (!_.isEqual(instruction.fnName, "redo")) {
                delay = recordingDelay;
            } else {
            }
            var intraState = function () {
                _executeInstruction(instructions, modules, $state, scriptIndex++, instructions[index].actionInitiated, $q, pausedInterval, $scope);
            };
            var postExecute = function () {
                if (!(ng.equals(instruction.fnName, "changeState"))) {
                    intraState();
                }
            };
            _.delay(function () {
                var params = _.extend({scriptIndex: ++scriptIndex, timeStamp: instruction.actionInitiated},
                    (instruction.args || {}).params, {pausedInterval: pausedInterval});
                $q.when(modules[instruction.module][instruction.fnName](_.extend((instruction.args || {}),
                    {"params": params, fragments: fragmentFn()}), $q.defer())).then(postExecute);
            }, delay);
        } else {
            _.delay(
                modules.apollo.stopBGAudio, 1000);
        }
    };
    ng.module(app, [
            'ui.router',
            'ui.route',
            'sokratik.atelier.services.istari', ,
            'sokratik.atelier.services.dialogue',
            'sokratik.atelier.directives.minerva',
            'sokratik.atelier.directives.apollo',
            'sokratik.atelier.services.sokratube',
            'ui.bootstrap',
            'ngSanitize',
            'ngAnimate'])
        .config(["$stateProvider", function config($stateProvider) {
            $stateProvider.state('play', {
                url: '/play/:scriptIndex/:timeStamp/:pausedInterval',
                abstract: true,
                resolve: {
                    instructionDetails: [ "$stateParams", function ($stateParams) {
                        "use strict";
                        var index = $stateParams.scriptIndex || 0;
                        var instruction = answer.script[index];
                        var delay = answer.script[index].actionInitiated - ($stateParams.timeStamp || answer.script[index].actionInitiated);
                        return {instruction: instruction, delay: delay};
                    }],
                    modules: ["dialogue", "apollo", "sokratube", function (dialogue, apollo, sokratube) {
                        return {apollo: apollo, dialogue: dialogue, sokratube: sokratube};
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
                .state('play.init', {
                    url: '/init',
                    views: {
                        "audio": {
                            controller: 'PlayAudio'
                        }
                    }
                })
            ;
        }])
        .controller("PlayCtrl", ["$scope",
            function ($scope) {
                //noinspection JSUnresolvedVariable
                $scope.presentations = answer.presentationData;
                $scope.presentationId = answer._id;

            }])
        .controller("PlayMaster", ["$scope",
            function ($scope, $state, $stateParams, $q, modules) {
                "use strict";
                _executeInstruction(answer.script,
                    modules, $state,
                    $stateParams.scriptIndex, $stateParams.timeStamp, $q, $stateParams.pausedInterval, $scope);


            }])
        .controller("PlayAudio", ["$scope", "$state", "$stateParams", "$q", "modules",
            function ($scope, $state, $stateParams, $q, modules) {
                "use strict";
                modules.apollo.initBGAudio();
                _executeInstruction(answer.script,
                    modules, $state,
                    $stateParams.scriptIndex, $stateParams.timeStamp, $q, $stateParams.pausedInterval, $scope);


            }])

        .controller("PlayActive", ["$scope", "$state", "$stateParams", "$q", "modules",
            function ($scope, $state, $stateParams, $q, modules) {
                "use strict";
                var page = parseInt($stateParams.page, 10);
                //noinspection JSUnresolvedVariable
                $scope.presentation = answer.presentationData[page];
                $scope.presentationId = answer._id;
                $scope.addFragment = function (fragment) {//TODO remove duplication
                    fragmentFn = fragment;
                    function resetFragments() {
                        modules.dialogue.resetFragments({fragments: fragmentFn()}, $q.defer()).then(
                          function(){
                              _executeInstruction(answer.script,
                                  modules, $state,
                                  $stateParams.scriptIndex, $stateParams.timeStamp, $q, $stateParams.pausedInterval, $scope);
                          }
                        );


                    }


                    if (_.size(fragment()) > 0) {  //TODO tie this properly with fragments in presentation also try prelinking and postlinking
                        resetFragments();
                    } else {
                        _.defer(resetFragments);//dom is not yet ready retry after 1000 ms
                    }
                };
            }]);
};
