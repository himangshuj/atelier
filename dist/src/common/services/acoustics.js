(function (ng, app) {
    var AudioContext = window.webkitAudioContext || window.mozAudioContext || ng.noop;
    var context = new AudioContext() || {};
    var MediaStream = window.MediaStream || window.webkitMediaStream;

    var recorder = context.createJavaScriptNode ? context.createJavaScriptNode(2048, 2, 2) : {};
    var volume = context.createGain ? context.createGain() : {};
    var _streams = {};
    var _sentPackets = 0;
    var _receivedPackets = 0;
    var _closeStream = function (stream, iteration, deferred) {
        "use strict";
        if ((iteration > 100) || (_sentPackets == _receivedPackets)) {
            console.log(stream);
            stream.destroy();
            deferred.resolve("uploaded audio " + _receivedPackets + "  out of " + _sentPackets);
        } else {
            _.delay(_closeStream, 10000, [stream, ++iteration, deferred]);
        }
    };
    var acoustics = function () {
        this.$get = ["$log", "$location", "$q", function ($log, $location, $q) {
            return {
                stream: function (answerId) {
                    if (_streams[answerId]) {
                        return _streams[answerId];
                    }
                    var client = new BinaryClient("ws://socket.closed-beta.sokratik.com:" + $location.port() + "/writer");//todo fix this remove hardcoding
                    var deferred = $q.defer();
                    client.on('open', function () {
                        var stream = client.createStream({answerId: answerId, sampleRate: context.sampleRate });
                        _streams[answerId] = stream;
                        deferred.resolve(stream);
                        _sentPackets = 0;
                        _receivedPackets = 0;
                        recorder.onaudioprocess = function (e) {
                            var left = e.inputBuffer.getChannelData(0);
                            //noinspection JSUnresolvedVariable
                            var right = e.inputBuffer.getChannelData(1);
                            var buffer = new ArrayBuffer(left.length * 4);
                            var view = new DataView(buffer);
                            var index = 0;
                            for (var i = 0; i < left.length; i++) {
                                view.setInt16(index, left[i] * 0x7FFF, true);
                                view.setInt16(index + 2, right[i] * 0x7FFF, true);
                                index += 4;
                            }
                            stream.write(buffer);
                            _sentPackets++;
                        };
                        stream.pause();
                        stream.on("data", function (data) {
                            "use strict";
                            _receivedPackets++;
                        });
                    });
                    return deferred.promise;
                },
                getAudioNode: function () {
                    var deferred = $q.defer();
                    navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                    navigator.getUserMedia({audio: true}, function (mediaStream) {
                        //noinspection JSUnresolvedFunction
                        var audioStream = new MediaStream(mediaStream.getAudioTracks());
                        //noinspection JSUnresolvedFunction
                        var audioInput = context.createMediaStreamSource(audioStream);
                        deferred.resolve(audioInput);
                    });
                    return deferred.promise;
                },

                pause: function (audioInput, stream) {
                    audioInput.disconnect();
                    recorder.disconnect();
                    volume.disconnect();
                    stream.pause();
                },
                resume: function (audioInput, stream) {
                    stream.resume();
                    audioInput.connect(volume);
                    volume.connect(recorder);
                    recorder.connect(context.destination);
                },
                stopRecording: function (audioInput, stream, answerId) {
                    audioInput.disconnect();
                    recorder.disconnect();
                    volume.disconnect();
                    _streams[answerId] = null;
                    var deferred = $q.defer();
                    _closeStream(stream, 0,deferred);
                    return deferred.promise;
                }




            };
        }];
    };
    ng.module(app, [], ["$provide", function ($provide) {
        $provide.provider("acoustics", acoustics);


    }]);

})(angular, 'sokratik.atelier.services.acoustics');