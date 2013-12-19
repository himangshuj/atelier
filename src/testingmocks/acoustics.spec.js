var FakeMediaRecorder = function(mediaStream) {
    this.state = 'inactive';
    this.ondataavailable = null;
    this.timeSlice = 2000;


    this.start = function(timeSlice) {
        this.state = 'recording';
        this.timeSlice = timeSlice;
    };
    this.pause = function() {
        this.state = 'paused';
    };
    this.resume = function() {
        this.state = 'recording';
    };
    this.stop = function() {
        this.state = 'inactive';
    };
};

var FakeAudioNode = {
    type: "FakeAudioNode",
    connected: false,
    connect: function() {
        this.connected = true;
    },
    disconnect: function() {
        this.connected = false;
    },
    onaudioprocess: null
};

var FakeAudioContext = {
    createJavaScriptNode: function(bufferSize, numInputChannels, numOutputChannels) {
        return FakeAudioNode;
    },
    createMediaStreamSource: function(audioStream) {
        return FakeAudioNode;
    },
    destination: {}
};

var fakeMediaStreamObj = {
    getAudioTracks: function() { return true;}
};

var fakeGetUserMedia = function(constraints, success, err) {
    success(fakeMediaStreamObj);
};

var FakeMediaStream = function(_) { return true; };

window.navigator = {
    webkitGetUserMedia: fakeGetUserMedia,
    mozGetUserMedia: fakeGetUserMedia
};

fakeNavigator = {
    mockGetUserMedia: fakeGetUserMedia
};

window.FakeAudioContext = FakeAudioContext;
window.MediaStream = FakeMediaStream;
window.webkitMediaStream = FakeMediaStream;
