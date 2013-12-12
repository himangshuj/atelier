describe('minerva services fragment changes', function () {
    var fragments;
    beforeEach(module('sokratik.atelier.minerva.services'));
    beforeEach(function () {
        fragments = [
            {css: [], index: 1},
            {css: [], index: 2},
            {css: [], index: 3},
            {css: [], index: 4},
            {css: [], index: 5},
            {css: [], index: 6},
            {css: [], index: 7},
            {css: [], index: 8},
            {css: [], index: 9},
            {css: [], index: 10}
        ];

    });
    it("reset Fragments", inject(function (dialogue, $q, $rootScope) {
        var resolved = false;
        var scope = $rootScope.$new();
        var actionInitiated = (new Date()).getTime();
        var fnName = "resetFragments";
        var uniqueCss = _.chain(fragments)
            .pluck("css")
            .flatten()
            .uniq()
            .value();
        expect(uniqueCss.length).toBe(0);
        dialogue[fnName]({fragments: fragments}, $q.defer()).then(function (resp) {
            expect(resp.actionInitiated / 10000).toBeCloseTo(actionInitiated / 10000, 0);
            expect((new Date()).getTime()).toBeGreaterThan(resp.actionInitiated);
            expect(resp.fnName).toBe(fnName);
            expect(resp.module).toBe("dialogue");
            resolved = true;
        });

        runs(function () {// I need this or else resolved functions dont resolve
            setTimeout(function () {
                scope.$apply(function () {
                });
            }, 1000);
        });
        waitsFor(function () {
            return resolved;
        }, "dialogue not completed", 3000);
        runs(function () {
            expect(resolved).toBeTruthy();
            var uniqueCss = _.chain(fragments)
                .pluck("css")
                .flatten()
                .uniq()
                .value();
            expect(uniqueCss[0]).toBe("fragment");
            expect(uniqueCss.length).toBe(1);
        });
    }));
    it("show  Fragment", inject(function (dialogue, $q, $rootScope) {
        var resolved = false;
        var scope = $rootScope.$new();
        var actionInitiated = (new Date()).getTime();
        var fnName = "makeVisible";
        var uniqueCss = _.chain(fragments)
            .pluck("css")
            .flatten()
            .uniq()
            .value();
        expect(uniqueCss.length).toBe(0);
        dialogue.resetFragments({fragments: fragments}, $q.defer()).then(function (resp) {
            expect(resp.actionInitiated / 10000).toBeCloseTo(actionInitiated / 10000, 0);
            expect((new Date()).getTime()).toBeGreaterThan(resp.actionInitiated);
            dialogue[fnName]({fragments: fragments, index: 4}, $q.defer()).then(function (resp) {
                expect(resp.actionInitiated / 10000).toBeCloseTo(actionInitiated / 10000, 0);
                expect((new Date()).getTime()).toBeGreaterThan(resp.actionInitiated);
                expect(resp.fnName).toBe(fnName);
                expect(resp.module).toBe("dialogue");
                resolved = true;
            });
        });

        runs(function () {// I need this or else resolved functions dont resolve
            setTimeout(function () {
                scope.$apply(function () {
                });
            }, 1000);
        });
        runs(function () {// I need this or else resolved functions dont resolve
            setTimeout(function () {
                scope.$apply(function () {
                });
            }, 2000);
        });
        waitsFor(function () {
            return resolved;
        }, "dialogue not completed", 3000);
        runs(function () {
            expect(resolved).toBeTruthy();
            var uniqueCss = _.chain(fragments)
                .pluck("css")
                .flatten()
                .uniq()
                .value();
            expect(uniqueCss).toContain("fragment");
            expect(uniqueCss).toContain("fadeIn");
            expect(uniqueCss).toContain("animated");
            expect(uniqueCss.length).toBe(3);
            expect(_.filter(fragments,function (fragment) {
                return _.contains(fragment.css, "fadeIn");
            }).length).toBe(1);
            var visibleFragment = _.find(fragments, function (fragment) {
                return _.contains(fragment.css, "fadeIn");
            });
            expect(visibleFragment.index).toBe(5);
            expect(visibleFragment.css).toContain("animated");
            expect(fragments[4].css).not.toContain("fragment");
            expect(fragments[3].css).toContain("fragment");

        })
    }));
    it("hide fragment", inject(function (dialogue, $q, $rootScope) {
        var modifiedFragments = _.map(fragments, function (fragment) {
            var newFragment = _.clone(fragment);
            newFragment.css = ["fadeIn", "animated"];
            return newFragment;
        });
        var resolved = false;
        var scope = $rootScope.$new();
        var actionInitiated = (new Date()).getTime();
        var fnName = "hide";
        var uniqueCss = _.chain(modifiedFragments)
            .pluck("css")
            .flatten()
            .uniq()
            .value();
        expect(uniqueCss.length).toBe(2);
        expect(uniqueCss).not.toContain("fragment");

        dialogue[fnName]({fragments: modifiedFragments, index: 4}, $q.defer()).then(function (resp) {
            expect(resp.actionInitiated / 10000).toBeCloseTo(actionInitiated / 10000, 0);
            expect((new Date()).getTime()).toBeGreaterThan(resp.actionInitiated);
            expect(resp.fnName).toBe(fnName);
            expect(resp.module).toBe("dialogue");
            resolved = true;
        });
        runs(function () {// I need this or else resolved functions dont resolve
            setTimeout(function () {
                scope.$apply(function () {
                });
            }, 1000);
        });
        waitsFor(function () {
            return resolved;
        }, "dialogue not completed", 3000);
        runs(function () {
            expect(resolved).toBeTruthy();
            var uniqueCss = _.chain(modifiedFragments)
                .pluck("css")
                .flatten()
                .uniq()
                .value();
            expect(uniqueCss).toContain("fragment");
            expect(uniqueCss.length).toBe(3);
            expect(modifiedFragments[4].css.length).toBe(1);
            expect(modifiedFragments[4].css[0]).toBe("fragment");
            expect(modifiedFragments[5].css).not.toContain("fragment");
            expect(modifiedFragments[5].css.length).toBe(2);
        });
    }));
});
describe('minerva services slide changes', function () {
    beforeEach(module('sokratik.atelier.minerva.services'));
    beforeEach(inject(function ($state) {
        $state.current.data = {mode: "play"};
    }));
    it("changeState", inject(function ($state, dialogue) {
        spyOn($state, "go");
        var actionInitiated = (new Date()).getTime();
        var stateParams = {page: 5};
        var resp = dialogue.changeState({subState: ".activate", params: stateParams});
        expect(resp.actionInitiated / 10000).toBeCloseTo(actionInitiated / 10000, 0);
        expect(resp.fnName).toBe("changeState");
        expect(resp.module).toBe("dialogue");
        var stateChangeCalled = false;
        runs(function () {
            setTimeout(function () {
                expect($state.go).toHaveBeenCalledWith("play.activate", stateParams);
                stateChangeCalled = true;
            }, 500);
        });
        waitsFor(function () {
            return stateChangeCalled;
        }, "state change has not been called", 3000);
    }));
});