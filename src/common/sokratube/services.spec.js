describe('sokratube services ', function () {
    beforeEach(function () {
        module("sokratik.atelier.sokratube.services");
    });
    var divId, options, dummyAudio;
    beforeEach(inject(function (apollo, $state) {
        window.YT = {
            Player: function (_divId, _options) {
                divId = _divId;
                options = _options;
                this.getCurrentTime = function () {
                    return 10;
                };
            },
            PlayerState: {PLAYING: 1, END: 2}
        };
        dummyAudio = {volume: 1, play: function () {
        }};
        apollo.addBGAudio(dummyAudio);
        $state.current = {data: {mode: 'play'}};
        apollo.initBGAudio();

    }));
    it("modal initialization", inject(function (sokratube, $q, $rootScope) {
        var promise = sokratube.initYTVideo({videoId: "dummy"}, $q.defer());
        expect(dummyAudio.volume).toBe(0.1);
        var scope = $rootScope.$new();
        runs(function () {
            setTimeout(function () {
                scope.$apply(function () {
                });
            }, 1000);
        });
        var notified = false;
        promise.then(function (resp) {

        }, angular.noop, function () {
            notified = true;
        });

        waitsFor(function () {
            return notified;
        }, "sokratube not resolved", 1000);
        runs(function () {
            expect(divId).toBe("player");
            expect(dummyAudio.volume).toBe(0);
        });
    }));
    it("modal time out close", inject(function (sokratube, $q, $rootScope) {
        var promise = sokratube.initYTVideo({videoId: "dummy", timeOut: 50}, $q.defer());
        expect(dummyAudio.volume).toBe(0.1);
        var scope = $rootScope.$new();
        runs(function () {
            setTimeout(function () {
                scope.$apply(function () {
                });
            }, 1000);
        });

        var notified = false;
        var resolved = false;
        promise.then(function (resp) {
            resolved = true;
            expect(resp.module).toBe("sokratube");
            expect(resp.fnName).toBe("initYTVideo");
            expect(resp.actionInitiated).toBeDefined();

        }, angular.noop, function () {
            notified = true;
        });

        waitsFor(function () {
            return notified;
        }, "sokratube not resolved", 1000);
        runs(function () {
            expect(divId).toBe("player");
            expect(dummyAudio.volume).toBe(0);
            options.events.onStateChange({data: YT.PlayerState.PLAYING});
        });
        runs(function () {
            setTimeout(function () {
                scope.$apply(function () {
                });
            }, 1000);
        });
        waitsFor(function () {
            return resolved;
        }, "sokratube not resolved", 3000);
        runs(function () {
            expect(dummyAudio.volume).toBe(0.1);
        });
    }));
    it("modal video end close", inject(function (sokratube, $q, $rootScope) {
        var promise = sokratube.initYTVideo({videoId: "dummy", timeOut: null}, $q.defer());
        expect(dummyAudio.volume).toBe(0.1);
        var scope = $rootScope.$new();
        runs(function () {
            setTimeout(function () {
                scope.$apply(function () {
                });
            }, 1000);
        });

        var notified = false;
        var resolved = false;
        promise.then(function (resp) {
            resolved = true;
            expect(resp.module).toBe("sokratube");
            expect(resp.fnName).toBe("initYTVideo");
            expect(resp.actionInitiated).toBeDefined();
        }, angular.noop, function () {
            notified = true;
        });

        waitsFor(function () {
            return notified;
        }, "sokratube not resolved", 1000);
        runs(function () {
            expect(divId).toBe("player");
            expect(dummyAudio.volume).toBe(0);
            options.events.onStateChange({data: YT.PlayerState.END});
        });
        runs(function () {
            setTimeout(function () {
                scope.$apply(function () {
                });
            }, 1000);
        });
        waitsFor(function () {
            return resolved;
        }, "sokratube not resolved", 3000);
        runs(function () {
            expect(dummyAudio.volume).toBe(0.1);
        });
    }));


});
