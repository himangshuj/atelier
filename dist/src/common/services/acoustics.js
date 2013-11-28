(function (ng, app) {
  var AudioContext = window.webkitAudioContext || window.mozAudioContext || ng.noop;
  var context = new AudioContext() || {};
  var MediaStream = window.MediaStream || window.webkitMediaStream;
  var recorder = context.createJavaScriptNode ? context.createJavaScriptNode(2048, 2, 2) : {};
  var volume = context.createGain ? context.createGain() : {};
  var _streams = {};
  var acoustics = function () {
    this.$get = [
      '$log',
      '$location',
      '$q',
      function ($log, $location, $q) {
        return {
          stream: function (answerId) {
            if (_streams[answerId]) {
              return _streams[answerId];
            }
            var client = new BinaryClient('ws://socket.closed-beta.sokratik.com:' + $location.port() + '/writer');
            var deferred = $q.defer();
            client.on('open', function () {
              var stream = client.createStream({
                  answerId: answerId,
                  sampleRate: context.sampleRate
                });
              _streams[answerId] = stream;
              deferred.resolve(stream);
              recorder.onaudioprocess = function (e) {
                var left = e.inputBuffer.getChannelData(0);
                var right = e.inputBuffer.getChannelData(1);
                var buffer = new ArrayBuffer(left.length * 4);
                var view = new DataView(buffer);
                var index = 0;
                for (var i = 0; i < left.length; i++) {
                  view.setInt16(index, left[i] * 32767, true);
                  view.setInt16(index + 2, right[i] * 32767, true);
                  index += 4;
                }
                stream.write(buffer);
              };
              stream.pause();
            });
            return deferred.promise;
          },
          getAudioNode: function () {
            var deferred = $q.defer();
            navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            navigator.getUserMedia({ audio: true }, function (mediaStream) {
              var audioStream = new MediaStream(mediaStream.getAudioTracks());
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
            stream.destroy();
          }
        };
      }
    ];
  };
  ng.module(app, [], [
    '$provide',
    function ($provide) {
      $provide.provider('acoustics', acoustics);
    }
  ]);
}(angular, 'sokratik.atelier.services.acoustics'));