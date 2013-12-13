describe('apollo service main audio', function () {
    beforeEach(module('sokratik.atelier.apollo.services'));
    var element, apollo;
    var played = false;
    var fakeAudio = function () {
        this.play = function () {
            this.onplay();
            this.paused = false;
        };
        this.src = "audioLocation";
        this.volume = 0;
        this.currentTime = 0.0;
        this.paused = true;
        this.pause = function () {
            this.paused = true;
        };
        this.seekable = [];
    };

    beforeEach(inject(function (_apollo_) {
        element = new fakeAudio();

        element.onplay = function () {
            played = true;
        };
        apollo = _apollo_;
        runs(function () {
            setInterval(function () {
                if (!element.paused) {
                    element.currentTime += 1;
                }
            }, 1000);
        });
        apollo.addMainAudio(element);


    }));
    it("add Main Audio", function () {
        expect(apollo.getMainAudio().src).toBe("audioLocation");
        try {
            apollo.addMainAudio(null);
            expect(true).toBeFalsy();//null audio cannot be added normally except if you want to by handlin exception
        } catch (t) {
            expect(true).toBeTruthy();
        }
        expect(apollo.getMainAudio()).toBe(element);
        apollo.addMainAudio(element);
        expect(apollo.getMainAudio().src).toBe("audioLocation");
        expect(apollo.getMainAudio().play).toBeDefined();
        expect(element.volume).toBe(0);
        expect(played).toBeTruthy();
        waitsFor(function () {
            return element.currentTime > 1;

        }, "current time not emulated", 2000);
        runs(function () {
            expect(element.currentTime).toBeCloseTo(2, 0);
        });
    });
    it("pause main audio", function () {
        apollo.pause();
        expect(element.paused).toBe(true);
        var iteration = 0;
        waitsFor(function () {
            return ++iteration;
        }, "dummy delay failed in timeout", 1000);
        runs(function () {
            expect(element.currentTime / 10).not.toBeCloseTo((new Date).getTime() / 10000, 0);
        });
    });
    it("resume main audio", inject(function ($q, $rootScope) {

        var timeStamp = (new Date).getTime();
        var promise = apollo.resume({params: {pausedInterval: 1000, timeStamp: timeStamp}}, $q.defer());
        var notified = false;
        var resolved = false;
        promise.then(function () {
            resolved = true;
        }, angular.noop, function () {
            notified = true;
            element.seekable.push(1);//dummy entry to enable resume
        });
        $rootScope.$digest();
        var scope = $rootScope.$new();
        runs(function () {
            setTimeout(function () {
                scope.$apply(function () {
                });
            }, 1000);
        });

        waitsFor(function () {
            return notified;
        }, "seek Audio has not been notified", 3000);
        runs(function () {
            expect(notified).toBeTruthy();
            expect(resolved).toBeFalsy();
        });
        runs(function () {
            setTimeout(function () {
                scope.$apply(function () {
                });
            }, 1000);
        });
        waitsFor(function () {
            return resolved;
        }, "seek Audio has not been resolved", 3000);
        runs(function () {
            expect(resolved).toBeTruthy();
            expect(element.currentTime).toBeCloseTo(0, 0);
            var promise = apollo.resume({params: {pausedInterval: 1000, timeStamp: timeStamp + 1000}}, $q.defer());
            resolved = false;
            promise.then(function () {
                resolved = true;
            });
            runs(function () {
                setTimeout(function () {
                    scope.$apply(function () {
                    });
                }, 1000);
            });
            waitsFor(function () {
                return resolved;
            }, "seek Audio has not been resolved", 5000);
            runs(function () {
                expect(resolved).toBeTruthy();
                expect(element.currentTime/10).toBeCloseTo(0, 0);// a lot of set time outs
                expect(element.volume).toBeCloseTo(1,0);
            });
        });
    }));
});
describe('apollo service background audio', function () {
    beforeEach(module('sokratik.atelier.apollo.services'));
    var element, apollo;
    var played = false;
    var fakeAudio = function () {
        this.play = function () {
            this.onplay();
            this.paused = false;
        };
        this.src = "audioLocation";
        this.volume = 0;
        this.currentTime = 0.0;
        this.paused = true;
        this.pause = function () {
            this.paused = true;
        };
        this.seekable = [];
    };

    beforeEach(inject(function (_apollo_) {
        element = new fakeAudio();

        element.onplay = function () {
            played = true;
        };
        apollo = _apollo_;
        runs(function () {
            setInterval(function () {
                if (!element.paused) {
                    element.currentTime += 1;
                }
            }, 1000);
        });
    }));
    it("test BG init",inject(function(){
        expect(element.loop).toBeUndefined();
        apollo.addBGAudio(element);
        expect(element.volume).toBe(0);
        expect(element.loop).toBeTruthy();

    }));
    it("test BG Audio init",inject(function(){
        apollo.initBGAudio();
        expect(element.volume).toBe(0);
        apollo.addBGAudio(element);
        apollo.initBGAudio();
        expect(element.volume).toBe(0.1);
    }));
    it("mute bg audio test",function(){
        apollo.addBGAudio(element);
        apollo.initBGAudio();
        expect(element.volume).toBe(0.1);
        apollo.muteBGAudio();
        expect(element.volume).toBe(0);
    });
    it("pause bg audio test",function(){
        apollo.addBGAudio(element);
        apollo.initBGAudio();
        expect(element.volume).toBe(0.1);
        expect(element.paused).toBeFalsy();
        apollo.stopBGAudio();
        expect(element.paused).toBeTruthy();
    })
});