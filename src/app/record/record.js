(function (ng, app) {
    ng.module(app, [
            'ui.router',
            'titleService',
            'plusOne',
            'sokratik.atelier.services.istari',
            'sokratik.atelier.services.dialogue',
            'sokratik.atelier.services.acoustics',
            'ngSanitize',
            'ngAnimate'])

        .config(["$stateProvider", function config($stateProvider) {
            $stateProvider.state('record', {
                url: '/record/:presentationId',
                resolve: {
                    answer: ["$stateParams", "anduril", function ($stateParams, anduril) {
                        return anduril.fetchAnswer($stateParams.presentationId);
                    }], audioNode: ["acoustics", function (acoustics) {
                        return acoustics.getAudioNode();
                    }],
                    stream: [ "acoustics", "$stateParams", function (acoustics, $stateParams) {
                        return acoustics.stream($stateParams.presentationId);
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
                url: "/activate/:page",
                views: {
                    "workspace": {
                        controller: 'RecordDialogue',
                        templateUrl: 'record/active.tpl.html'
                    }
                }
            });

        }])
        .controller('RecordCtrl', ["$scope", "acoustics", "audioNode", "$state", "anduril", "$q", "stream","answer",
            function ($scope, acoustics, audioNode, $state, anduril, $q, stream,answer) {
                $scope.record = function () {
                    $scope.recording = true;
                    acoustics.resume(audioNode, stream);
                };
                $scope.play = function () {
                    acoustics.stopRecording(audioNode, stream, answer._id);
                    $q.when(anduril.completeRecord(answer._id))
                        .then(function (resp) {
                        });
                    $state.go("play", {presentationId: answer._id});

                };
                $scope.pause = function () {
                    acoustics.pause(audioNode, stream);
                    $scope.recording = false;
                };
                $scope.$on('$stateChangeStart',
                    function (event, toState, toParams) {
                        anduril.recordAction(answer._id,{fnName:"stateChange",args:{state:toState.name, params:toParams}});
                    });
                $scope.recording = true;
            }])
        .controller('RecordMaster', ["$scope", "answer", "acoustics", "audioNode", "stream",
            function ($scope, answer, acoustics, audioNode, stream) {
                $scope.presentations = _.map(answer.presentationData, function (obj) { //todo move to clojure script
                    obj.templateName = obj.templateName || "master";
                    return obj;
                });
                $scope.presentationId = answer._id;
                acoustics.resume(audioNode, stream);

            }])
        .controller('RecordDialogue', ["$scope", "answer", "anduril", "dialogue", "$stateParams", "$q", "$state",
            function ($scope, answer, anduril, dialogue, $stateParams, $q, $state) {
                $scope.presentation = answer.presentationData[parseInt($stateParams.page || 0, 10)];
                var fragmentFn = null;
                $scope.addFragment = function (fragment) {//TODO remove duplication
                    fragmentFn = fragment;
                    function resetFragments() {
                        dialogue.resetFragments({fragments: fragmentFn()}, $q.defer()).then(function (resp) {
                            anduril.recordAction(answer._id,resp);
                        });
                    }

                    if (_.size(fragment()) > 0) {  //TODO tie this properly with fragments in presentation also try prelinking and postlinking
                        resetFragments();
                    } else {
                        _.delay(resetFragments, 1000);//dom is not yet ready retry after 1000 ms
                    }
                };


                $scope.masterView = function () {
                    $state.go("record.master");
                };
                var index = 0;
                $scope.next = function () {
                    dialogue.makeVisible({fragments: fragmentFn(), index: index++}, $q.defer()).then(function (resp) {
                        anduril.recordAction(answer._id,resp);
                    });
                };
                $scope.previous = function () {
                    dialogue.hide({fragments: fragmentFn(), index: --index}, $q.defer()).then(function (resp) {
                        anduril.recordAction(answer._id,resp);
                    });
                };
                $scope.nextSlide = function () {
                    var page = parseInt($stateParams.page, 10);
                    $state.go("record.activate", {page: ++page});
                };
            }
        ])
    ;
})(angular, "sokratik.atelier.record");
