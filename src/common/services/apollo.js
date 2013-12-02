/* This file defines all the directives used to control the audio
 */
(function (ng, app) {
    'use strict';

    var apollo = function () {
        var _mainAudio = null;
        // var _backGroundAudio = [];
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
                    var args = context.params;
                    var pausedInterval = parseInt(args.pausedInterval, 10);

                    var _recordingStarted1 = _recordingStarted || (args.timeStamp - pausedInterval) ;
                    var reqdPosition = (args.timeStamp - _recordingStarted1 - pausedInterval) / 1000;
                    console.log("Pause mode CurrentTime " + _mainAudio.currentTime +"Reqd Time"+reqdPosition);

                    return context;
                },
                resume: function (context, deferred) {
                    var args = context.params;
                    var pausedInterval = parseInt(args.pausedInterval, 10);
                    _recordingStarted = _recordingStarted || (args.timeStamp - pausedInterval) ;
                    var reqdPosition = (args.timeStamp - _recordingStarted - pausedInterval) / 1000;
                    console.log("Paused Interval " + pausedInterval);
                    console.log(_mainAudio.seekable);
                    _mainAudio.volume = 0;

                    console.log("CurrentTime " + _mainAudio.currentTime +"Reqd Time"+reqdPosition);
                    _mainAudio.currentTime = reqdPosition;
                    _mainAudio.play();
                    _mainAudio.volume = 1;
                    deferred.resolve("Audio seeked");
                    return context;
                }
            };
        }];
    };

    ng.module(app, [], ["$provide", function ($provide) {

        $provide.provider("apollo", apollo);
    }]);
})(angular, "sokratik.atelier.services.apollo");