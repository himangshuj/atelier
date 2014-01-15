/* This file defines all the directives used to control the audio
 */
(function (ng, app) {
    'use strict';


    var apollo = function () {
        var _mainAudio = null;
        var _backGroundAudio = [];
        var _recordingStarted = null;
        var playedTillNow = 0;
        var _seekAudio = function (context, deferred) {
            if ((_mainAudio.seekable || []).length > 0) {
                if (_mainAudio.volume > 0) {
                    playedTillNow = _mainAudio.currentTime;
                }
                _mainAudio.volume = 0;
                var args = context.params;
                var pausedInterval = parseInt(args.pausedInterval, 10);
                _recordingStarted = _recordingStarted || (args.timeStamp - pausedInterval);
                var reqdPosition = (args.timeStamp - _recordingStarted - pausedInterval);
                deferred.notify("CurrentTime " + _mainAudio.currentTime + "Reqd Time" + reqdPosition);
                var deltaTime = (_mainAudio.currentTime * 1000) - reqdPosition;
                if (Math.abs((reqdPosition / 1000) - playedTillNow) < 0.2) {
                    _mainAudio.play();
                    _mainAudio.currentTime = reqdPosition / 1000;
                    _mainAudio.volume = 1;
                    deferred.resolve("Audio seeked " + _mainAudio.currentTime);
                } else if (deltaTime > 0) {
                    _mainAudio.pause();
                    _.delay(function () {
                        _mainAudio.play();
                        _mainAudio.volume = 1;
                    }, deltaTime);
                    deferred.resolve("Audio seeked " + _mainAudio.currentTime);
                } else {
                    _mainAudio.play();
                    _mainAudio.volume = 1;
                    _.delay(deferred.resolve, -deltaTime, "Audio seeked " + _mainAudio.currentTime);
                }

            } else {
                deferred.notify("delaying");
                _.delay(_seekAudio, 1000, context, deferred);
            }

        };
        this.$get = ["$log", "$state", function ($log, $state) {
            return {
                addMainAudio: function (mainAudio) {
                    mainAudio.play();
                    mainAudio.volume = 0;
                    playedTillNow = 0;
                    _recordingStarted = null;
                    _mainAudio = mainAudio;

                },
                getMainAudio: function () {
                    return _mainAudio;
                },
                getBGAudio: function () {
                    return _backGroundAudio;
                },
                cleanUp: function () {
                    playedTillNow = 0;
                    _recordingStarted = null;
                    if (_mainAudio.currentTime> 0.5){
                        _mainAudio.currentTime = 0;

                    }
                },
                redo: function (context, deferred) {
                    var args = context.params;
                    var pausedInterval = parseInt(args.pausedInterval, 10);
                    var reqdPosition = (args.timeStamp - _recordingStarted - pausedInterval) / 1000;
                    deferred.notify("CurrentTime " + _mainAudio.currentTime + "Reqd Time" + reqdPosition);
                    _mainAudio.currentTime = reqdPosition;
                    _mainAudio.pause();
                    deferred.resolve("Audio seeked " + _mainAudio.currentTime);
                    return deferred.promise;
                },
                pause: function (context) {
                    if ((!!_mainAudio)) {
                        if (_mainAudio.volume > 0) {
                            playedTillNow = _mainAudio.currentTime;
                        }
                        _mainAudio.pause();
                    } else {
                        //  $log.info("trying to pause null audio");
                    }
                    return context;
                },
                resume: function (context, deferred) {
                    _seekAudio(context, deferred);
                    return deferred.promise;
                },
                addBGAudio: function (backGroundAudio) {
                    _backGroundAudio.push(backGroundAudio);
                    backGroundAudio.play();
                    backGroundAudio.volume = 0;
                    backGroundAudio.loop = true;
                    // $log.info("[Play ] BackGround Audio played");
                },
                initBGAudio: function (index, volume) {
                    if (_.isEqual(($state.current.data || {mode: ''}).mode, "play")) {
                        (_backGroundAudio[index || 0] || {play: ng.noop}).play();
                        (_backGroundAudio[index || 0] || {}).volume = volume || 0.10;
                    }
                },
                stopBGAudio: function () {
                    _.each(_backGroundAudio, function (audio) {
                        audio.pause();
                    });
                },
                muteBGAudio: function () {
                    _.each(_backGroundAudio, function (audio) {
                        (audio || {}).volume = 0;
                    });
                },
                //this was added only for testing
                getState: function () {
                    return {recordingStarted: _recordingStarted, playedTillNow: playedTillNow};
                }
            };
        }];
    };

    ng.module(app, ['ui.router'], ["$provide", function ($provide) {

        $provide.provider("apollo", apollo);
    }]);
})(angular, "sokratik.atelier.apollo.services");