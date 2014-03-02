(function (ng, app) {
    var fragmentFn = ng.noop;//global variable is this really bad
    var callBack = null;
    var paused = false;
    var resume = ng.noop;
    var _executeInstruction = function (instructions, modules, $state, scriptIndex, timeStamp, $q, pausedInterval, $scope, $log) {
        'use strict';
        if (scriptIndex < _.size(instructions)) {
            var index = scriptIndex || 0;
            var instruction = instructions[index];
            var delay = 0;
            pausedInterval = parseInt(pausedInterval, 10);
            var recordingDelay = instructions[index].actionInitiated - (timeStamp || instructions[index].actionInitiated);
            if (_.isEqual(instruction.fnName, 'resume')) {
                pausedInterval += recordingDelay;
            } else if (!_.isEqual(instruction.fnName, 'redo')) {
                delay = recordingDelay;
            } else {
            }
            var intraState = function () {
                _executeInstruction(instructions, modules, $state, scriptIndex++, instructions[index].actionInitiated, $q, pausedInterval, $scope, $log);
            };
            var postExecute = !(ng.equals(instruction.fnName, 'changeState')) ? intraState : ng.noop;

            $log.info("Executing " + instruction.fnName + " with delay " + delay);
            _.delay(function () {
                var params = _.extend({scriptIndex: ++scriptIndex, timeStamp: instruction.actionInitiated},
                    (instruction.args || {}).params, {pausedInterval: pausedInterval},{play:true});
                if (!paused) {
                    $q.when(modules[instruction.module][instruction.fnName]
                        (_.extend((instruction.args || {}), {'params': params, fragments: fragmentFn()}), $q.defer())).then(postExecute);
                } else {
                    modules.apollo.pause();
                    modules.apollo.muteBGAudio();
                    $log.info("Pausing the play");
                    resume = function(){
                        $log.info("Resuming the play");
                        $q.when(modules[instruction.module][instruction.fnName]
                            (_.extend((instruction.args || {}), {'params': params, fragments: fragmentFn()}), $q.defer())).then(postExecute);
                    };
                }

            }, delay);
        }
        else {
        }
    };
    ng.module(app, [
            'ui.router',
            'sokratik.atelier.canvas.services',
            'sokratik.atelier.istari.services', ,
            'sokratik.atelier.minerva.services',
            'sokratik.atelier.minerva.directives',
            'sokratik.atelier.apollo.directives',
            'sokratik.atelier.sokratube.services',
            'ui.bootstrap',
            'ngSanitize',
            'ngAnimate'])
        .config(['$stateProvider', function config($stateProvider) {
            $stateProvider.state('play', {
                url: '/play/:presentationId/:scriptIndex/:timeStamp/:pausedInterval',
                abstract: true,
                resolve: {
                    presentation: ['anduril', '$stateParams', function (anduril, $stateParams) {
                        return anduril.fetchPresentation($stateParams.presentationId);
                    }],
                    instructionDetails: [ '$stateParams', 'presentation', function ($stateParams, presentation) {
                        'use strict';
                        var index = $stateParams.scriptIndex || 0;
                        var instruction = presentation.script[index];
                        var delay = presentation.script[index].actionInitiated - ($stateParams.timeStamp || presentation.script[index].actionInitiated);
                        return {instruction: instruction, delay: delay};
                    }],
                    modules: ['dialogue', 'apollo', 'sokratube', 'canvas', function (dialogue, apollo, sokratube, canvas) {
                        return {apollo: apollo, dialogue: dialogue, sokratube: sokratube, canvas: canvas};
                    }]
                },
                data: {
                    mode: 'play'
                },
                views: {
                    'main': {
                        controller: 'PlayCtrl',
                        templateUrl: 'play/play.tpl.html'
                    }
                },
                parent: 'root'
            })
                .state('play.activate', {
                    url: '/activate/:page',
                    views: {
                        'screen': {
                            templateUrl: 'play/activate.tpl.html',
                            controller: 'PlayActive'
                        }
                    }
                })
                .state('play.init', {
                    url: '/init',
                    views: {
                        'audio': {
                            controller: 'PlayInit'
                        }
                    }
                })
            ;
        }])
        .controller('PlayCtrl', ['$scope', 'presentation', '$rootScope',
            function ($scope, presentation, $rootScope) {
                //noinspection JSUnresolvedVariable
                $scope.presentations = presentation.presentationData;
                $scope.presentationId = presentation._id;
                $rootScope.presentationMode = true;

            }])
        .controller('PlayInit', ['$scope', '$state', '$stateParams', '$q', 'modules', 'presentation', '$rootScope', '$sce', 'anduril', '$log',
            function ($scope, $state, $stateParams, $q, modules, presentation, $rootScope, $sce, anduril, $log) {
                'use strict';
                modules.apollo.initBGAudio();
                $rootScope.audioLocation = $sce.trustAsResourceUrl(presentation.audioLocation);
                $rootScope.hideMenu = true;
                $rootScope.showCase = false;
                modules.apollo.cleanUp();

                if (!!callBack) {
                    modules.apollo.getMainAudio().removeEventListener('ended', callBack, false);
                }
                callBack = function () {
                    modules.apollo.muteBGAudio();
                    anduril.clearCache();
                    $state.go('share', {presentationId: $stateParams.presentationId});

                };
                modules.apollo.getMainAudio().addEventListener('ended', callBack, false);
                _executeInstruction(presentation.script,
                    modules, $state,
                    $stateParams.scriptIndex, $stateParams.timeStamp, $q, $stateParams.pausedInterval, $scope, $log);
            }])

        .controller('PlayActive', ['$scope', '$state', '$stateParams', '$q', 'modules', 'presentation', '$log',
            function ($scope, $state, $stateParams, $q, modules, presentation, $log) {
                'use strict';
                var page = parseInt($stateParams.page, 10);
                //noinspection JSUnresolvedVariable
                $scope.presentation = presentation.presentationData[page];
                $scope.presentationId = presentation._id;
                $scope.paused = paused;
                $scope.pause = function () {
                    paused = true;
                    $scope.paused = true;
                };

                $scope.resume = function () {
                    modules.apollo.initBGAudio();
                    paused = false;
                    $scope.paused = false;
                    resume();
                };
                $scope.start = function (){
                    modules.apollo.getMainAudio().play();
                    modules.apollo.initBGAudio();
                };

                $scope.createNew = function(){
                    paused = true;
                    modules.apollo.cleanUp();
                    $state.go('create',{},{inherit:false});
                };

                $scope.played =  modules.apollo.getMainAudio().played.length > 0;
                modules.apollo.getMainAudio().addEventListener('play', function(){
                    $scope.played = true;

                });

                $scope.$emit('variablePropagation',$stateParams.page, _.size(presentation.presentationData),null);

                $scope.addFragment = function (fragment) {//TODO remove duplication
                    fragmentFn = fragment;
                    function resetFragments() {

                        modules.dialogue.resetFragments({fragments: fragmentFn()}, $q.defer()).then(
                            function () {
                                _executeInstruction(presentation.script,
                                    modules, $state,
                                    $stateParams.scriptIndex, $stateParams.timeStamp, $q, $stateParams.pausedInterval, $scope, $log);
                            }
                        );


                    }

                    _.defer(resetFragments);

                };
            }]);
})(angular, 'sokratik.atelier.player');

