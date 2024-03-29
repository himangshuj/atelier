(function (ng, app) {
    //noinspection JSUnresolvedVariable
    var AudioContext = window.webkitAudioContext || window.mozAudioContext || ng.noop;
    var context = window.FakeAudioContext || new AudioContext() || {};
    //noinspection JSUnresolvedVariable
    var MediaStream = window.MediaStream || window.webkitMediaStream;

    //noinspection JSUnresolvedVariable,JSUnresolvedFunction
    var recorder = context.createJavaScriptNode ? context.createJavaScriptNode(8192, 2, 2) : {};
    var _streams = {};
    var _sentPackets = 0;
    var _receivedPackets = 0;
    var _timeStamps = {};
    var _closeStream = function (stream, iteration, deferred, $log) {
        "use strict";
        if (!stream.writable) {
            deferred.resolve("uploaded audio " + _receivedPackets + "  out of " + _sentPackets);
            return;

        }
        if ((iteration > 100) || (_sentPackets === _receivedPackets)) {
            stream.destroy();
            _sentPackets = _receivedPackets = 0;
            deferred.resolve("uploaded audio " + _receivedPackets + "  out of " + _sentPackets);
        } else {
            $log.info("sent" + _sentPackets);
            $log.info("received" + _receivedPackets);

            _.delay(_closeStream, 10000, stream, ++iteration, deferred);
        }
    };

    var streamRaw = function (audioId, $q, $location, resumeFlag, $log) {
        if (_streams[audioId] && !resumeFlag) {
            return _streams[audioId];
        }
        var client = new BinaryClient("ws://socket." + $location.host() + ":" + $location.port() + "/writer");
        var deferred = $q.defer();
        //noinspection JSUnresolvedVariable
        client.on('open', function () {
            var stream = client.createStream({presentationId: audioId, sampleRate: context.sampleRate, resume: !!resumeFlag, sentPackets: _sentPackets});
            _streams[audioId] = stream;
            deferred.resolve(stream);
            _sentPackets = 0;
            _receivedPackets = 0;
            recorder.onaudioprocess = function (e) {
                //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                var left = e.inputBuffer.getChannelData(0);
                //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                var right = e.inputBuffer.getChannelData(1);
                var buffer = new ArrayBuffer(left.length * 4);
                var view = new DataView(buffer);
                var index = 0;
                for (var i = 0; i < left.length; i++) {
                    //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                    view.setInt16(index, left[i] * 0x7FFF, true);
                    //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                    view.setInt16(index + 2, right[i] * 0x7FFF, true);
                    index += 4;
                }
                if (stream.writable) {
                    _timeStamps[_sentPackets++] = (new Date()).getTime();
                    stream.write(buffer);

                } else {
                    $log.info("stream not writeable");
                }
            };
            stream.pause();
            stream.on("data", function () {
                "use strict";
                _receivedPackets++;
            });
        });
        return deferred.promise;
    };

    var streamOgg = function (mediaRecorder, audioId, $q, $location, resumeFlag, $log) {
        if (_streams[audioId] && !resumeFlag) {
            return _streams[audioId];
        }
        var client = new BinaryClient("ws://socket." + $location.host() + ":" + $location.port() + "/ogg-writer");
        var deferred = $q.defer();
        //noinspection JSUnresolvedVariable
        client.on('open', function () {
            var stream = client.createStream({presentationId: audioId, resume: !!resumeFlag, sentPackets: _sentPackets});
            _streams[audioId] = stream;
            deferred.resolve(stream);
            _sentPackets = 0;
            _receivedPackets = 0;
            mediaRecorder.ondataavailable = function (e) {
                stream.write(e.data);
                _sentPackets++;
            };
            mediaRecorder.start(2000);
            mediaRecorder.pause();
            stream.pause();
            stream.on("data", function () {
                "use strict";
                _receivedPackets++;
            });
        });
        return deferred.promise;
    };

    var getAudioNode = function ($q,$log) {
        var deferred = $q.defer();
        //noinspection JSUnresolvedVariable
        navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        navigator.getUserMedia({audio: true}, function (mediaStream) {
            //noinspection JSUnresolvedFunction
            var audioStream = new MediaStream(mediaStream.getAudioTracks());
            //noinspection JSUnresolvedFunction
            var audioInput = context.createMediaStreamSource(audioStream);
            deferred.resolve(audioInput);
        }, function (err) {
            $log.info(err);
        });
        return deferred.promise;
    };

    var getMediaRecorder = function ($q, $window) {
        var deferred = $q.defer();
        //noinspection JSUnresolvedVariable

        navigator.getUserMedia = ($window.fakeNavigator || {}).mockGetUserMedia || navigator.webkitGetUserMedia ||navigator.mozGetUserMedia;
        navigator.getUserMedia({audio: true}, function (mediaStream) {
            //noinspection JSUnresolvedFunction
            var MediaRecorderClass = $window.FakeMediaRecorder || MediaRecorder;
            var mediaRecorderObj = new MediaRecorderClass(mediaStream);
            deferred.resolve(mediaRecorderObj);
        }, function (err) {
            throw err;
        });
        return deferred.promise;
    };


    var acoustics = function () {
        this.$get = ["$log", "$location", "$q", "$window", "$http", function ($log, $location, $q, $window, $http) {

            return {
                pause: function (_recorder) {
                    if (_recorder.mediaRecorder) {
                        _recorder.mediaRecorder.pause();

                    } else {
                        _recorder.audionode.disconnect();
                        recorder.disconnect();
                    }
                    if (_recorder.stream.writeable) {
                        _recorder.stream.pause();
                    }
                },
                resume: function (_recorder) {
                    _recorder.stream.resume();
                    if (_recorder.mediaRecorder) {
                        _recorder.mediaRecorder.resume();
                    }
                    else {
                        //noinspection JSUnresolvedVariable
                        _recorder.audionode.connect(recorder);
                        recorder.connect(context.destination);
                    }
                },
                stopRecording: function (_recorder, presentationId) {
                    if (_recorder.mediaRecorder) {

                        _recorder.mediaRecorder.stop();
                    }
                    else {
                        _recorder.audionode.disconnect();
                        recorder.disconnect();
                    }
                    _streams[presentationId] = null;
                    var deferred = $q.defer();
                    _closeStream(_recorder.stream, 0, deferred, $log);
                    return deferred.promise;
                },

                getStream: function (audioId, recorder, resumeFlag) {
                    if (!resumeFlag) {
                        _timeStamps = {};
                    }
                    if (!!$window.MediaRecorder) {

                        return streamOgg(recorder, audioId, $q, $location, resumeFlag, $log);
                    } else {
                        return streamRaw(audioId, $q, $location, resumeFlag, $log);
                    }
                },

                mediaRecorderOrAudioNode: function () {
                    if (!!$window.MediaRecorder) {
                        return getMediaRecorder($q, $window);

                    } else {
                        return getAudioNode($q,$log);
                    }
                },

                lastTransmittedTime: function () {
                    if (_receivedPackets > 0) {
                        return _timeStamps[_receivedPackets - 1];
                    } else {
                        return 0;
                    }
                }
            };
        }];
    };
    ng.module(app, [], ["$provide", function ($provide) {
        $provide.provider("acoustics", acoustics);


    }]);

})(angular, 'sokratik.atelier.acoustics.services');
