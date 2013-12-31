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

        .config(["$stateProvider", function config($stateProvider) {
            $stateProvider.state('record', {
                url: '/record/:presentationId',
                resolve: {
                    answer: ["$stateParams", "anduril", function ($stateParams, anduril) {
                        return anduril.fetchPresentation($stateParams.presentationId);
                    }],
                    mediaRecorderOrAudioNode: ["acoustics", function (acoustics) {
                        return acoustics.mediaRecorderOrAudioNode();
                    }],
                    stream: ["acoustics", "$stateParams", "mediaRecorderOrAudioNode", function (acoustics, $stateParams, mediaRecorderOrAudioNode) {
                        return acoustics.getStream($stateParams.presentationId, mediaRecorderOrAudioNode);
                    }],
                    recorder: ["mediaRecorderOrAudioNode", "stream", "$window", function (mediaRecorderOrAudioNode, stream, $window) {
                        if (!!$window.MediaRecorder) {
                            return {mediaRecorder: mediaRecorderOrAudioNode,
                                stream: stream};
                        } else {
                            return {mediaRecorder: false,
                                audionode: mediaRecorderOrAudioNode,
                                stream: stream};
                        }
                    }],
                    recordAction: ["anduril", "answer", function (anduril, answer) {
                        "use strict";
                        return function (resp) {
                            return anduril.recordAction(answer, resp);
                        };
                    }]
                },
                data: {
                    mode: "record"
                },
                views: {
                    "main": {
                        controller: 'RecordCtrl',
                        templateUrl: 'record/record.tpl.html'
                    }
                },
                parent: 'root'
            });

            $stateProvider.state('record.activate', {
                url: "/activate/:page/:dummy",
                views: {
                    "workspace": {
                        controller: 'RecordDialogue',
                        templateUrl: 'record/active.tpl.html'
                    }
                }
            });
            $stateProvider.state('complete', {
                url: "/complete/:answerId",
                views: {
                    "main": {
                        controller: 'RecordComplete',
                        templateUrl: 'record/complete.tpl.html'
                    }
                }
            });

        }])
        .controller('RecordCtrl', ["$scope", "acoustics", "$state", "anduril", "$q", "answer", "recordAction", "recorder", "$rootScope","canvas",
            function ($scope, acoustics, $state, anduril, $q, answer, recordAction, recorder, $rootScope,canvas) {
                answer.script = [];//reseting the script    //TODO This is crap
                recordAction({fnName: "changeState",
                    args: {subState: '.activate', params: {page: 0}},
                    actionInitiated: new Date().getTime(), module: "dialogue"});

                $scope.presentationId = answer._id;
                answer.recordingStarted = new Date().getTime();    //TODO this is crap
                $scope.drawing = false;
                var enableCanvas = $scope.enableCanvas = function(arg) {
                    canvas.enableCanvas(arg);
                    $scope.drawing = arg;
                };

                var pause = $scope.pause = function () {
                    enableCanvas(false);
                    acoustics.pause(recorder);
                    $scope.recording = false;
                    recordAction({"fnName": "pause", "args": {},
                        actionInitiated: new Date().getTime(), module: "apollo" });

                };

                $scope.recordAction = recordAction;
                $scope.record = function () {
                    $scope.recording = true;
                    acoustics.resume(recorder);
                    recordAction({"fnName": "resume", "args": {},
                        actionInitiated: new Date().getTime(), module: "apollo"});
                    var instructionsToKeep = _.clone(answer.script);
                    $scope.redoSlide = function () {
                        "use strict";
                        anduril.insertScript(answer, instructionsToKeep);
                        recordAction({"fnName": "redo", "args": {}, module: "dialogue",
                            actionInitiated: new Date().getTime() });
                        pause();
                        $state.go("record.activate", {dummy: _.size(answer.script)});
                    };
                };
                var answerId = answer._id;//this is a HACK replace with restangular why this is hack log the answer in
                //then clause
                $scope.complete = function () {
                    acoustics.stopRecording(recorder, answer._id).then(function (resp) {
                        $q.when(anduril.completeRecord(answer))
                            .then(function () {
                                "use strict";
                                $state.go("complete", {answerId: answerId});
                            });
                    });
                };


                $scope.$on('$stateChangeSuccess',
                    function () {
                        "use strict";
                        pause();
                        $scope.recording = false;
                    });
                $rootScope.hideMenu = true;
                $rootScope.showCase = false;
            }])

        .controller('RecordDialogue', ["$scope", "answer", "anduril", "dialogue", "$stateParams", "recordAction",
            "$q", "sokratube",
            function ($scope, answer, anduril, dialogue, $stateParams, recordAction, $q, sokratube) {
                var page = parseInt($stateParams.page, 10);
                $scope.page = page;
                var activePresentation = $scope.presentation = answer.presentationData[page];
                var fragmentFn = null;
                $scope.totalPages = _.size(answer.presentationData);
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
                var existingVideo = _.findWhere(activePresentation.apps, {name: "YT"});
                $scope.videoPresent = !!existingVideo;
                $scope.recordYTAction = function () {
                    $scope.pause();//pausing the audio
                    var videoId = existingVideo.params.videoId;
                    sokratube.initYTVideo({videoId: videoId}, $q.defer()).then(function (resp) {
                        recordAction(resp);
                    });
                };

                $scope.nextSlide = _.throttle(function () {
                    $scope.enableCanvas(false);
                    recordAction(dialogue.changeState({subState: ".activate", params: {page: ++page}}));
                }, 1000);

            }
        ])
        .controller('RecordComplete', ["$scope", "$stateParams", function ($scope, $stateParams) {
            "use strict";
            $scope.answerId = $stateParams.answerId;
        }]);
})(angular, "sokratik.atelier.record");
