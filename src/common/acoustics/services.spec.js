describe('acoustics.services', function () {
    beforeEach(module('sokratik.atelier.acoustics.services'));
    var acoustics, rootScope, q;
    beforeEach(inject(function ($q) {
        q = $q;
    }));

    var FakeStream = function () {
        this.state = null;
        this.writable = true;
        this.dataReceivedCallback = null;
        this.writes = 0;
        this.write = function (data) {
            ++this.writes;
            // assume that we recieve a message on sending a message
            this.dataReceivedCallback();
            return true;
        };
        this.on = function (event, callback) {
            if (event == 'open') {
                callback();
            } else {
                this.dataReceivedCallback = callback;
            }
            return true;
        };
        this.pause = function () {
            this.state = "paused";
        };
        this.resume = function () {
            this.state = "streaming";
        };
        this.destroy = function () {
            this.state = "destroyed";
        };
    };

    var FakeBinaryClient = function (_) {
        this.on = function (event, callback) {
            callback();
        };

        this.createStream = function (meta) {
            return new FakeStream();
        };
    };

    beforeEach(inject(function (_acoustics_, _$rootScope_) {
        acoustics = _acoustics_;
        rootScope = _$rootScope_;
        BinaryClient = FakeBinaryClient;

        this.addMatchers({
            toBeMediaRecorderOrAudioNode: function () {
                return (this.actual instanceof FakeMediaRecorder) ||
                    (this.actual.type = "FakeAudioNode");
            }
        });
    }));

    function resolvePromise(promise) {
        var resolved;
        q.when(promise).then(function (value) {
            resolved = value;
        });
        rootScope.$digest();
        return resolved;
    }

    function getRecorder(acoustics, answerId) {
        var mediaRecorderOrAudioNode = resolvePromise(acoustics.mediaRecorderOrAudioNode());
        var stream = resolvePromise(acoustics.getStream(answerId, mediaRecorderOrAudioNode));
        if (mediaRecorderOrAudioNode instanceof FakeMediaRecorder) {
            return { mediaRecorder: mediaRecorderOrAudioNode, stream: stream };
        } else {
            return { mediaRecorder: false,
                audionode: mediaRecorderOrAudioNode, stream: stream };
        }
    }


    it("#mediaRecorderOrAudioNode should return a MediaRecorder or AudioNode", function () {
        expect(resolvePromise(acoustics.mediaRecorderOrAudioNode())).toBeMediaRecorderOrAudioNode();
    });

    it('#getStream should return a stream obj', function () {
        var mediaRecorderOrAudioNode = resolvePromise(acoustics.mediaRecorderOrAudioNode());
        expect(resolvePromise(acoustics.getStream("1", mediaRecorderOrAudioNode)))
            .toEqual(jasmine.any(FakeStream));
    });

    it('#pause should pause mediarecorder/audionodes and pause stream', function () {
        spyOn(FakeAudioNode, 'disconnect').andCallThrough();
        // currently streams created by getRecorder are not destroyed after use
        // so we need to pass a different identifier to getRecorder in each
        // test spec
        var recorder = getRecorder(acoustics, "2");
        acoustics.pause(recorder);
        if (recorder.mediaRecorder) {
            expect(recorder.mediaRecorder.state).toEqual('paused');
        } else {
            expect(FakeAudioNode.disconnect).toHaveBeenCalled();
            expect(recorder.audionode.connected).toBeFalsy();
        }
        expect(recorder.stream.state).toEqual("paused");
    });

    it('#resume should resume mediarecorder/audionodes and resume stream', function () {
        spyOn(FakeAudioNode, 'connect').andCallThrough();
        var recorder = getRecorder(acoustics, "3");
        acoustics.resume(recorder);
        if (recorder.mediaRecorder) {
            expect(recorder.mediaRecorder.state).toEqual('recording');
        } else {
            expect(FakeAudioNode.connect).toHaveBeenCalled();
            expect(recorder.audionode.connected).toBeTruthy();
        }
        expect(recorder.stream.state).toEqual("streaming");
    });

    it('#stopRecording should stop mediarecorder/audionodes and destroy stream', function () {
        spyOn(FakeAudioNode, 'disconnect').andCallThrough();
        var recorder = getRecorder(acoustics, "4");
        acoustics.stopRecording(recorder);
        if (recorder.mediaRecorder) {
            expect(recorder.mediaRecorder.state).toEqual('inactive');
        } else {
            expect(FakeAudioNode.disconnect).toHaveBeenCalled();
            expect(recorder.audionode.connected).toBeFalsy();
        }
        expect(recorder.stream.state).toEqual("destroyed");
    });

    it('should gracefully close streams after sending packets', function () {
        var recorder = getRecorder(acoustics, "5");
        acoustics.resume(recorder);
        if (recorder.mediaRecorder) {
            recorder.mediaRecorder.ondataavailable({data: "foo"});
        } else {
            recorder.audionode.onaudioprocess(
                { inputBuffer: { getChannelData: function (_) {
                    return "foo";
                }}});
        }
        acoustics.stopRecording(recorder);
        expect(recorder.stream.state).toEqual("destroyed");
        expect(recorder.stream.writes).toEqual(1);
    });

});
