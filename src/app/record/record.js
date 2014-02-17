(function (ng, app) {
    ng.module(app, [
            'ui.router',
            'sokratik.atelier.istari.services',
            'sokratik.atelier.minerva.services',
            'sokratik.atelier.canvas.services',
            'sokratik.atelier.acoustics.services',
            'sokratik.atelier.sokratube.services',
            'sokratik.atelier.apollo.services',
            'ngSanitize',
            'ngAnimate'])

        .config(['$stateProvider', function config($stateProvider) {
            $stateProvider.state('record', {
                url: '/record/:presentationId',
                resolve: {
                    presentation: ['$stateParams', 'anduril', function ($stateParams, anduril) {
                        return anduril.fetchPresentation($stateParams.presentationId);
                    }],
                    mediaRecorderOrAudioNode: ['acoustics', function (acoustics) {
                        return acoustics.mediaRecorderOrAudioNode();
                    }],
                    stream: ['acoustics', '$stateParams', 'mediaRecorderOrAudioNode', 'presentation',
                        function (acoustics, $stateParams, mediaRecorderOrAudioNode, presentation) {
                            return acoustics.getStream($stateParams.presentationId + '_' + presentation.audioId,
                                mediaRecorderOrAudioNode, false);
                        }],
                    recorder: ['mediaRecorderOrAudioNode', 'stream', '$window', function (mediaRecorderOrAudioNode, stream, $window) {
                        if (!!$window.MediaRecorder) {
                            return {mediaRecorder: mediaRecorderOrAudioNode,
                                stream: stream};
                        } else {
                            return {mediaRecorder: false,
                                audionode: mediaRecorderOrAudioNode,
                                stream: stream};
                        }
                    }],
                    recordAction: ['anduril', 'presentation', function (anduril, presentation) {
                        'use strict';
                        return function (resp) {
                            return anduril.recordAction(presentation, resp);
                        };
                    }]
                },
                data: {
                    mode: 'record'
                },
                views: {
                    'main': {
                        controller: 'RecordCtrl',
                        templateUrl: 'record/record.tpl.html'
                    }
                },
                parent: 'root'
            });

            $stateProvider.state('record.activate', {
                url: '/activate/:page/:dummy',
                views: {
                    'workspace': {
                        controller: 'RecordDialogue',
                        templateUrl: 'record/active.tpl.html'
                    }
                }
            });
            $stateProvider.state('complete', {
                url: '/complete/:presentationId',
                views: {
                    'main': {
                        controller: 'RecordComplete',
                        templateUrl: 'record/complete.tpl.html'
                    }
                },
                parent: 'root'
            });

        }])
        .controller('RecordCtrl', ['$scope', 'acoustics', '$state', 'anduril', '$q', 'presentation', 'recordAction',
            'recorder', '$rootScope', 'canvas', '$stateParams', '$window', 'mediaRecorderOrAudioNode', '$http',
            function ($scope, acoustics, $state, anduril, $q, presentation, recordAction, recorder, $rootScope, canvas, $stateParams, $window, mediaRecorderOrAudioNode, $http) {


                presentation.recordingStarted = new Date().getTime();    //TODO this is crap
                presentation.script = [];//reseting the script    //TODO This is crap
                recordAction({fnName: 'changeState',
                    args: {subState: '.activate', params: {page: 0}},
                    actionInitiated: new Date().getTime(), module: 'dialogue'});
                $scope.presentationId = presentation._id;


                $scope.drawing = false;
                var enableCanvas = $scope.enableCanvas = function (arg) {
                    canvas.enableCanvas(arg);
                    $scope.drawing = arg;
                };

                var pause = $scope.pause = function () {
                    enableCanvas(false);
                    acoustics.pause(recorder);
                    $scope.recording = false;
                    recordAction({'fnName': 'pause', 'args': {},
                        actionInitiated: new Date().getTime(), module: 'apollo' });

                };
                var completed = false;
                var resumeRecordingAfterNetworkDisruption = function () {
                    if (!completed) {
                        var lastTransmittedTime = acoustics.lastTransmittedTime();
                        var instructionsToKeep = _.filter(_.clone(presentation.script), function (instruction) {
                            return lastTransmittedTime > instruction.actionInitiated;
                        });
                        anduril.insertScript(presentation, instructionsToKeep);
                        recordAction({'fnName': 'redo', 'args': {}, module: 'apollo',
                            actionInitiated: lastTransmittedTime });
                        enableCanvas(false);
                        acoustics.pause(recorder);
                        $scope.recording = false;
                        recordAction({'fnName': 'pause', 'args': {},
                            actionInitiated: lastTransmittedTime, module: 'apollo' });
                        //console.log((new Date()).getTime());
                        var reversedInstructions = _.clone(instructionsToKeep).reverse();
                        var lastSlideChange = _.find(reversedInstructions, function (instruction) {
                            return _.isEqual(instruction.fnName, "changeState");
                        }) || {args: {params: {page: 0}}};
                        acoustics.getStream($stateParams.presentationId + '_' + presentation.audioId, mediaRecorderOrAudioNode, true).then(function (stream) {
                            recorder.stream = stream;
                            $window.alert('There has been a network issue when recording the slide, you need to re-record the slide');
                        });
                        $state.go('record.activate', {dummy: _.size(presentation.script),
                            page: lastSlideChange.args.params.page});
                    }
                };

                $scope.recordAction = recordAction;
                $scope.record = function () {
                    $scope.recording = true;
                    acoustics.resume(recorder);
                    recordAction({'fnName': 'resume', 'args': {},
                        actionInitiated: new Date().getTime(), module: 'apollo'});
                    var instructionsToKeep = _.clone(presentation.script);
                    $scope.redoSlide = function () {
                        'use strict';
                        anduril.insertScript(presentation, instructionsToKeep);
                        recordAction({'fnName': 'redo', 'args': {}, module: 'apollo',
                            actionInitiated: new Date().getTime() });
                        pause();
                        $state.go('record.activate', {dummy: _.size(presentation.script)});
                    };


                };

                _.defer(function () {
                    recorder.stream.on('error', resumeRecordingAfterNetworkDisruption);
                    recorder.stream.on('close', resumeRecordingAfterNetworkDisruption);

                });


                var presentationId = presentation._id;//this is a HACK replace with restangular why this is hack log the presentation in
                //then clause
                $scope.complete = function () {
                    $rootScope.loading = true;
                    completed = true;
                    $window.ga('send', 'event', 'ImportantStates', 'click', 'recordComplete');

                    acoustics.stopRecording(recorder, presentation._id).then(function (resp) {
                        $q.when(anduril.completeRecord(presentation))
                            .then(function () {
                                'use strict';
                                anduril.clearCache();
                                $state.go('complete', {presentationId: presentationId});
                            });
                    });
                };


                $scope.$on('$stateChangeSuccess',
                    function () {
                        'use strict';
                        pause();
                        $scope.recording = false;
                    });
                $rootScope.presentationMode = true;
                $rootScope.navigationMode = false;

            }])

        .controller('RecordDialogue', ['$scope', 'presentation', 'anduril', 'dialogue', '$stateParams', 'recordAction',
            '$q', 'sokratube', 'canvas',
            function ($scope, presentation, anduril, dialogue, $stateParams, recordAction, $q, sokratube, canvas) {
                var page = parseInt($stateParams.page, 10);
                $scope.page = page;
                var activePresentation = $scope.presentation = presentation.presentationData[page];
                var fragmentFn = null;
                $scope.totalPages = _.size(presentation.presentationData);
                $scope.addFragment = function (fragment) {//TODO remove duplication
                    fragmentFn = fragment;

                    _.defer(function () {
                        dialogue.resetFragments({fragments: fragmentFn()}, $q.defer()).then(ng.noop);
                        $scope.totalFragments = _.size(fragment());
                    });

                };

                $scope.index = 0;
                $scope.next = _.throttle(function () {
                    if ($scope.recording) {
                        $scope.totalFragments = _.size(fragmentFn());
                        dialogue.makeVisible({fragments: fragmentFn(), index: $scope.index++}, $q.defer()).then(recordAction);
                    }
                }, 1500);
                var existingVideo = _.findWhere(activePresentation.apps, {name: 'YT'});
                $scope.videoPlaying = false;
                $scope.videoPresent = !!existingVideo;
                $scope.recordYTAction = function () {
                    $scope.pause();//pausing the audio
                    $scope.videoPlaying = true;

                    var videoId = existingVideo.params.videoId;
                    sokratube.initYTVideo({videoId: videoId, startTime: existingVideo.params.startTime}, $q.defer()).then(function (resp) {
                        recordAction(resp);
                        $scope.videoPlaying = false;

                    });
                };

                $scope.nextSlide = _.throttle(function () {
                    $scope.enableCanvas(false);
                    canvas.deRegisterMethods();
                    recordAction(dialogue.changeState({subState: '.activate', params: {page: ++page}}));
                }, 1000);

            }
        ])
        .controller('RecordComplete', ['$scope', '$stateParams', function ($scope, $stateParams) {
            'use strict';
            $scope.presentationId = $stateParams.presentationId;
        }]);
})(angular, 'sokratik.atelier.record');
