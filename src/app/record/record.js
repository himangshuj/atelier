(function (ng, app) {
    ng.module(app, [
            'ui.router',
            'titleService',
            'plusOne',
            'sokratik.atelier.services.istari',
            'sokratik.atelier.minerva.services',
            'sokratik.atelier.services.acoustics',
            'sokratik.atelier.services.sokratube',
            'sokratik.atelier.apollo.services',
            'ngSanitize',
            'ngAnimate'])

        .config(["$stateProvider", function config($stateProvider) {
            $stateProvider.state('record', {
                url: '/record/:presentationId',
                resolve: {
                    answer: ["$stateParams", "anduril", function ($stateParams, anduril) {
                        return anduril.fetchAnswer($stateParams.presentationId);
                    }],
                    mediaRecorderOrAudioNode: ["acoustics", function (acoustics) {
                        console.log(1);
                        return acoustics.mediaRecorderOrAudioNode();
                    }],
                    stream: ["acoustics", "$stateParams", "mediaRecorderOrAudioNode", function (acoustics, $stateParams, mediaRecorderOrAudioNode) {
                        console.log(2);
                        return acoustics.getStream($stateParams.presentationId, mediaRecorderOrAudioNode);
                    }],
                    recorder: ["mediaRecorderOrAudioNode", "stream", "$window", function (mediaRecorderOrAudioNode, stream, $window) {
                        console.log(3);
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
                        console.log("i");
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
                }
            });
            //this state represents the master view of all the slides
            $stateProvider.state('record.master', {
                url: "/master",
                views: {
                    "workspace": {
                        controller: 'RecordMaster',
                        templateUrl: 'record/master.tpl.html'
                    }
                }
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
        .controller('RecordCtrl', ["$scope", "acoustics", "$state", "anduril", "$q", "answer", "recordAction", "recorder",
            function ($scope, acoustics, $state, anduril, $q, answer, recordAction, recorder) {
                answer.script = [];//reseting the script
                $scope.presentationId = answer._id;
                answer.recordingStarted = new Date().getTime();

                $scope.record = function () {
                    $scope.recording = true;
                    acoustics.resume(recorder);
                    recordAction({"fnName": "resume", "args": {},
                        actionInitiated: new Date().getTime(), module: "apollo"});
                    console.log("Recording started " + new Date().getTime());
                    console.log("Resetting redo slide definition");
                    var instructionsToKeep = _.clone(answer.script);
                    $scope.redoSlide = function () {
                        "use strict";
                        anduril.insertScript(answer, instructionsToKeep);
                        recordAction({"fnName": "redo", "args": {}, module: "dialogue",
                            actionInitiated: new Date().getTime() });
                        $state.go("record.activate", {dummy: _.size(answer.script)});
                    };
                };
                var answerId = answer._id;//this is a HACK replace with restangular why this is hack log the answer in
                //then clause
                $scope.complete = function () {
                    acoustics.stopRecording(recorder, answer._id).then(function (resp) {
                        console.log(resp);
                        $q.when(anduril.completeRecord(answer))
                            .then(function () {
                                "use strict";
                                $state.go("complete", {answerId: answerId});
                            });
                    });
                };


                var pause = $scope.pause = function () {
                    acoustics.pause(recorder);
                    console.log("pausing initiated" + new Date().getTime());
                    _.defer(function () {
                        recordAction({"fnName": "pause", "args": {},
                            actionInitiated: new Date().getTime(), module: "apollo" });
                    });
                    $scope.recording = false;


                };

                $scope.$on('$stateChangeSuccess',
                    function () {
                        "use strict";
                        pause();
                        $scope.recording = false;
                    });
            }])
        .controller('RecordMaster', ["$scope", "answer", "acoustics", "dialogue", "anduril", "recordAction",
            function ($scope, answer, acoustics, dialogue, anduril, recordAction) {
                //noinspection JSUnresolvedVariable
                $scope.presentations = _.map(answer.presentationData, function (obj) { //todo move to clojure script
                    obj.templateName = obj.templateName || "master";
                    return obj;
                });
                $scope.activate = function (index) {
                    var resp = dialogue.changeState({subState: ".activate", params: {page: index}});
                    recordAction(resp);
                };
                $scope.presentationId = answer._id;
                $scope.activate(0);
            }])
        .controller('RecordDialogue', ["$scope", "answer", "anduril", "dialogue", "$stateParams", "recordAction", "$q", "sokratube",
            function ($scope, answer, anduril, dialogue, $stateParams, recordAction, $q, sokratube) {
                var page = parseInt($stateParams.page, 10);
                $scope.page = page;
                var activePresentation = $scope.presentation = answer.presentationData[page];
                var fragmentFn = null;
                $scope.totalPages = _.size(answer.presentationData);
                $scope.addFragment = function (fragment) {//TODO remove duplication
                    fragmentFn = fragment;
                    function resetFragments() {
                        if (_.size(fragment()) > 0) {  //TODO tie this properly with fragments in presentation also try prelinking and postlinking
                            dialogue.resetFragments({fragments: fragmentFn()}, $q.defer()).then(ng.noop);
                            $scope.totalFragments = _.size(fragment());
                        } else {
                            _.delay(resetFragments, 1000);//dom is not yet ready retry after 1000 ms
                        }
                    }

                    resetFragments();
                    $scope.totalFragments = _.size(fragment());

                };
                $scope.masterView = function () {
                    recordAction(dialogue.changeState({subState: ".master", params: null}));
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
                        console.log(resp);
                        recordAction(resp);
                    });
                };
                $scope.previous = _.throttle(function () {
                    $scope.totalFragments = _.size(fragmentFn());
                    dialogue.hide({fragments: fragmentFn(), index: --$scope.index}, $q.defer()).then(recordAction);
                }, 1500);
                $scope.nextSlide = _.throttle(function () {
                    recordAction(dialogue.changeState({subState: ".activate", params: {page: ++page}}));
                }, 1000);

            }
        ])
        .controller('RecordComplete', ["$scope", "$stateParams", function ($scope, $stateParams) {
            "use strict";
            $scope.answerId = $stateParams.answerId;
        }]);
})(angular, "sokratik.atelier.record");
