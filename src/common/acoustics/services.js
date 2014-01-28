(function (ng, app) {
    //noinspection JSUnresolvedVariable
    var AudioContext = window.webkitAudioContext || window.mozAudioContext || ng.noop;
    var context = window.FakeAudioContext || new AudioContext() || {};
    //noinspection JSUnresolvedVariable
    var MediaStream = window.MediaStream || window.webkitMediaStream;

    var redoMessage = 'There were network issues, Re-record the slide';

    //noinspection JSUnresolvedVariable,JSUnresolvedFunction
    var recorder = context.createJavaScriptNode ? context.createJavaScriptNode(2048, 2, 2) : {};
    var _streams = {};
    var _sentPackets = 0;
    var _receivedPackets = 0;
    var _redoSlide = ng.noop;
    var _closeStream = function (stream, iteration, deferred) {
        "use strict";
        if (!stream.writable) {
            deferred.resolve("uploaded audio " + _receivedPackets + "  out of " + _sentPackets);
            return;

        }
        if ((iteration > 100) || (_sentPackets == _receivedPackets)) {
            stream.destroy();
            deferred.resolve("uploaded audio " + _receivedPackets + "  out of " + _sentPackets);
        } else {
            _.delay(_closeStream, 10000, stream, ++iteration, deferred);
        }
    };

    var streamRaw = function (presentationId, $q, $location, $window) {
        if (_streams[presentationId]) {
            return _streams[presentationId];
        }
        var client = new BinaryClient("ws://socket." + $location.host() + ":" + $location.port() + "/writer");
        var deferred = $q.defer();
        //noinspection JSUnresolvedVariable
        client.on('open', function () {
            var stream = client.createStream({presentationId: presentationId, sampleRate: context.sampleRate });
            _streams[presentationId] = stream;
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
                if (!stream.writable) {
                    stream = client.createStream({presentationId: presentationId, sampleRate: context.sampleRate, resume: true});
                    $window.alert(redoMessage);
                    _redoSlide();
                } else {
                    stream.write(buffer);
                    _sentPackets++;
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

    var streamOgg = function (mediaRecorder, presentationId, $q, $location, $window) {
        if (_streams[presentationId]) {
            return _streams[presentationId];
        }
        var client = new BinaryClient("ws://socket." + $location.host + ":" + $location.port() + "/ogg-writer");
        var deferred = $q.defer();
        //noinspection JSUnresolvedVariable
        client.on('open', function () {
            var stream = client.createStream({presentationId: presentationId});
            _streams[presentationId] = stream;
            deferred.resolve(stream);
            _sentPackets = 0;
            _receivedPackets = 0;
            mediaRecorder.ondataavailable = function (e) {
                if (!stream.writable) {
                    stream = client.createStream({presentationId: presentationId, sampleRate: context.sampleRate, resume: true});
                    $window.alert(redoMessage);
                    _redoSlide();
                } else {
                    stream.write(e.data);
                    _sentPackets++;
                }
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

    var getAudioNode = function ($q) {
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
            // console.log("getUserMedia error: " + err);
        });
        return deferred.promise;
    };

    var getMediaRecorder = function ($q) {
        var deferred = $q.defer();
        //noinspection JSUnresolvedVariable
        navigator.getUserMedia = fakeNavigator.mockGetUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        navigator.getUserMedia({audio: true}, function (mediaStream) {
            //noinspection JSUnresolvedFunction
            var MediaRecorder = FakeMediaRecorder || MediaRecorder;
            var mediaRecorder = new MediaRecorder(mediaStream);
            deferred.resolve(mediaRecorder);
        }, function (err) {
            //  console.log("getUserMedia error: " + err);
        });
        return deferred.promise;
    };


    var acoustics = function () {
        this.$get = ["$log", "$location", "$q", "$window", function ($log, $location, $q, $window) {
            return {
                pause: function (_recorder) {
                    if (_recorder.mediaRecorder) {
                        _recorder.mediaRecorder.pause();

                    } else {
                        _recorder.audionode.disconnect();
                        recorder.disconnect();
                    }
                    _recorder.stream.pause();
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
                registerRedoSlide: function (redoSlide) {
                    _redoSlide = redoSlide;
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
                    _closeStream(_recorder.stream, 0, deferred);
                    return deferred.promise;
                },

                getStream: function (presentationId, recorder) {
                    if (!!$window.MediaRecorder) {
                        return streamOgg(recorder, presentationId, $q, $location, $window);
                    } else {
                        return streamRaw(presentationId, $q, $location, $window);
                    }
                },

                mediaRecorderOrAudioNode: function () {
                    if (!!$window.MediaRecorder) {
                        return getMediaRecorder($q);

                    } else {
                        return getAudioNode($q);
                    }
                }
            };
        }];
    };
    ng.module(app, [], ["$provide", function ($provide) {
        $provide.provider("acoustics", acoustics);


    }]);

})(angular, 'sokratik.atelier.acoustics.services');
