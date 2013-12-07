/**This is the file that will control youtube in sokratik's atelier.
 * This will involve communication through the deferred resolve route **/
(function (ng, app) {


    var _videoModalCtrl = ["$scope", "$modalInstance", "$sce", "videoId", "deferred", "timeOut","apollo",
        function ($scope, $modalInstance, $sce, videoId, deferred, timeOut,apollo) {
            var actionInitiated = new Date().getTime();
            apollo.muteBGAudio();
            var player;
            _.defer(function () {
                console.log(videoId + "videoId");
                player = new YT.Player("player", {
                    playerVars: { 'autoplay': 1, "origin": "closed-beta.sokratik.com:3000" },
                    videoId: videoId,
                    events: {
                        'onStateChange': onStateChange
                    }
                });
            });

            var done = $scope.done = function () {
                apollo.initBGAudio();
                deferred.resolve({"fnName": "initYTVideo", module: "sokratube",
                    "args": {timeOut: player.getCurrentTime() * 1000, videoId: videoId},
                    actionInitiated: actionInitiated });
                $modalInstance.close();
            };


            var countDownStarted = false;

            $scope.closeLabel = !!timeOut ? "skip":"done";

            console.log($scope.closeLabel);

            function onStateChange(event) {//asumes no buffering need to fix this
                if (event.data == YT.PlayerState.PLAYING && !countDownStarted && !!timeOut) {
                    var delay = parseInt(timeOut, 10);
                    _.delay(done, delay);
                    countDownStarted = true;
                } else if (event.data == YT.PlayerState.END) {
                    done();
                }
            }

        }];
    var _saas = function () {//sokratube as a service
        this.$get = ["$modal","apollo", function ($modal) {
            return {
                initYTVideo: function (context, deferred) {
                    _.defer(function () {
                        var modalInstance = $modal.open({
                            templateUrl: 'sokratube/yt.modal.tpl.html',
                            controller: _videoModalCtrl,
                            resolve: {
                                videoId: function () {
                                    return context.videoId;
                                },
                                timeOut: function () {
                                    return context.timeOut;
                                },
                                deferred: function () {

                                    return deferred;
                                }
                            }
                        });
                        modalInstance.result.then(function () {
                        }, function () {
                            //noinspection JSUnresolvedFunction
                            deferred.resolve();
                        });

                    });
                    return deferred.promise;
                }
            };
        }];
    };

    ng.module(app, ["sokratik.atelier.services.apollo"], ["$provide", function ($provide) {
        $provide.provider("sokratube", _saas);

    }]);
})(angular, 'sokratik.atelier.services.sokratube');