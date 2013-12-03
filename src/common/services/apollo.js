/* This file defines all the directives used to control the audio
 */
(function (ng, app) {
    'use strict';

    var apollo = function () {
        var _mainAudio = null;
        var _backGroundAudio = [];
        var _recordingStarted = null;
        this.$get = ["$log", function ($log) {
            return {
                addMainAudio: function (mainAudio) {
                    _mainAudio = mainAudio;
                    mainAudio.play();
                    mainAudio.volume = 0;
                    _recordingStarted = null;
                    $log.info("[Play ] Audio played");
                },
                getMainAudio: function () {
                    return _mainAudio;
                },
                pause: function (context) {
                    _mainAudio.pause();
                    return context;
                },
                resume: function (context, deferred) {
                    var args = context.params;
                    var pausedInterval = parseInt(args.pausedInterval, 10);
                    _recordingStarted = _recordingStarted || (args.timeStamp - pausedInterval);
                    var reqdPosition = (args.timeStamp - _recordingStarted - pausedInterval) / 1000;
                    console.log(_mainAudio.seekable);
                    _mainAudio.volume = 0;
                    console.log("CurrentTime " + _mainAudio.currentTime + "Reqd Time" + reqdPosition);
                    _mainAudio.currentTime = reqdPosition;
                    _mainAudio.play();
                    _mainAudio.volume = 1;
                    deferred.resolve("Audio seeked");
                    return context;
                },
                addBGAudio: function (backGroundAudio) {
                    _backGroundAudio.push(backGroundAudio);
                    backGroundAudio.play();
                    backGroundAudio.volume = 0;
                    backGroundAudio.loop = true;
                    $log.info("[Play ] BackGround Audio played");
                },
                initBGAudio: function (index, volume) {
                    console.log("here");
                    _backGroundAudio[index || 0].volume = volume || 0.10;
                },
                stopBGAudio: function () {
                    _.each(_backGroundAudio, function (audio) {
                        audio.pause();
                    });
                }
            };
        }];
    };

    ng.module(app, [], ["$provide", function ($provide) {

        $provide.provider("apollo", apollo);
    }]);
})(angular, "sokratik.atelier.services.apollo");