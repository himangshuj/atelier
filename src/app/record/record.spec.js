var deferred = {promise: {then: angular.noop},
    resolve: angular.noop
};
var qrecord = {
    defer: function () {
        return deferred;
    },
    when: function () {
        return {
            then: function (fn) {
                fn();
            }
        };
    }
};
describe('record section control ', function () {
    beforeEach(module('sokratik.atelier.record'));
    var scope;
    var presentation = {_id: "presentationId", presentationData: [
        {templateName: "t1", keyVals: {k1: "v1"}},
        {templateName: "t2", keyVals: {k1: "v1"}},
        {templateName: "t3", keyVals: {k1: "v1"}},
        {templateName: "t4", keyVals: {k1: "v1"}},
        {templateName: "t5", keyVals: {k1: "v1"}},
        {templateName: "t6", keyVals: {k1: "v1"}},
        {templateName: "t7", keyVals: {k1: "v1"}},
        {templateName: "t8", keyVals: {k1: "v1"}},
        {templateName: "t9", keyVals: {k1: "v1"}},
        {templateName: "t10", keyVals: {k10: "v10", k11: "v11"}},
        {templateName: "t11", keyVals: {k10: "v10", k11: "v11", k12: "v12"}},
        {templateName: "t12", keyVals: {k1: "v1"}},
        {templateName: "t13", keyVals: {k1: "v1"}}
    ]};
    var fakeMethods = {recordAction: function (resp) {
        presentation.script.push(resp);
    }};
    var acoustics = {
        resume: angular.noop,
        pause: angular.noop,
        stopRecording: function () {
            return {then: angular.noop};
        }

    };

    beforeEach(inject(function ($rootScope, anduril, $state) {
        scope = $rootScope.$new();
        scope.enableCanvas = angular.noop;
        spyOn(anduril, "put");
        spyOn($state, "go").andCallFake(function () {
            _.defer(scope.pause);
        });
        spyOn(fakeMethods, "recordAction").andCallThrough();
        spyOn(acoustics, "resume").andCallThrough();
        spyOn(acoustics, "pause").andCallThrough();
        spyOn(acoustics, "stopRecording").andCallFake(function () {
            return {then: function (fn) {
               fn();
            }};
        });
        spyOn(anduril, "completeRecord").andCallFake(function () {
            return {then: function (fn) {
                fn();
            }};
        });
    }));
    it("initialization checks", inject(function (anduril, $controller, $modal, $log, $state) {
        expect(presentation.script).toBeUndefined();
        $controller("RecordCtrl", {
            $scope: scope,
            acoustics: acoustics,
            $state: $state,
            anduril: anduril,
            $q: qrecord,
            presentation: presentation,
            recordAction: angular.noop,
            recorder: {}
        });
        expect(presentation.script).toBeDefined();
        expect(presentation.script.length).toBe(0);
        expect(presentation.recordingStarted / 1000).toBeCloseTo((new Date()).getTime() / 1000);
        expect(scope.record).toBeDefined();
        expect(scope.redoSlide).toBeUndefined();

    }));
    it("record atests", inject(function (anduril, $controller, $modal, $log, $state) {
        $controller("RecordCtrl", {
            $scope: scope,
            acoustics: acoustics,
            $state: $state,
            anduril: anduril,
            $q: qrecord,
            presentation: presentation,
            recordAction: fakeMethods.recordAction,
            recorder: {}
        });
        scope.record();
        expect(acoustics.resume).toHaveBeenCalled();
        expect(fakeMethods.recordAction).toHaveBeenCalledWith({ fnName: 'resume', args: {  },
            actionInitiated: jasmine.any(Number), module: 'apollo' });
        expect(scope.redoSlide).toBeDefined();
        var definedRedo = scope.redoSlide;
        expect(scope.redoSlide).toBe(definedRedo);
        scope.record();
        expect(scope.redoSlide).not.toBe(definedRedo);
        expect(scope.redoSlide).toBeDefined();
    }));
    it("redo tests", inject(function (anduril, $controller, $modal, $log, $state) {
        $controller("RecordCtrl", {
            $scope: scope,
            acoustics: acoustics,
            $state: $state,
            anduril: anduril,
            $q: qrecord,
            presentation: presentation,
            recordAction: fakeMethods.recordAction,
            recorder: {}
        });
        scope.pause();
        scope.record();
        expect(acoustics.resume).toHaveBeenCalled();
        expect(fakeMethods.recordAction).toHaveBeenCalledWith({ fnName: 'resume', args: {  },
            actionInitiated: jasmine.any(Number), module: 'apollo' });
        expect(scope.redoSlide).toBeDefined();
        var definedRedo = scope.redoSlide;
        expect(scope.redoSlide).toBe(definedRedo);
        scope.record();
        expect(scope.redoSlide).not.toBe(definedRedo);
        expect(presentation.script.length).toBe(4);
        presentation.script.push("to Remove");
        presentation.script.push("to Remove");
        expect(presentation.script.length).toBe(6);
        expect(presentation.script[4]).toBe("to Remove");
        expect(scope.redoSlide).toBeDefined();
        expect(presentation.script[3].fnName).toBe("resume");
        var resumeTime = presentation.script[2].actionInitiated;
        scope.redoSlide();
        expect(presentation.script.length).toBe(6);
        expect(presentation.script[3].fnName).toBe("resume");
        expect(presentation.script[3].actionInitiated / 10).toBeCloseTo(resumeTime / 10, 0);
        expect(presentation.script[4].fnName).toBe("redo");
        expect(presentation.script[4].module).toBe("apollo");
        expect(presentation.script[5].fnName).toBe("pause"); //this is added by redo
        expect($state.go).toHaveBeenCalledWith('record.activate', { dummy: 6 });
        var timedOut = false;
        runs(function () {
            setTimeout(function () {
                timedOut = true;
            }, 100);
        });
        waitsFor(function () {
            return timedOut;
        }, "force delay bombed", 500);
        runs(function () {
            expect(presentation.script.length).toBe(7);
            expect(presentation.script[5].fnName).toBe("pause"); //this is added by state change
            scope.record();
            expect(scope.redoSlide).not.toBe(definedRedo);
            expect(presentation.script.length).toBe(8);
            presentation.script.push("to Remove");
            presentation.script.push("to Remove");
            expect(presentation.script.length).toBe(10);
            expect(presentation.script[9]).toBe("to Remove");
            expect(scope.redoSlide).toBeDefined();
            expect(presentation.script[7].fnName).toBe("resume");
            var resumeTime = presentation.script[6].actionInitiated;
            scope.redoSlide();
            expect(presentation.script.length).toBe(10);
            expect(presentation.script[7].fnName).toBe("resume");
            expect(presentation.script[6].actionInitiated).toBe(resumeTime);
            expect(presentation.script[8].fnName).toBe("redo");
            expect(presentation.script[9].fnName).toBe("pause"); //this is added by redo
            expect($state.go).toHaveBeenCalledWith('record.activate', { dummy: 6 });
            var timedOut = false;
            runs(function () {
                setTimeout(function () {
                    timedOut = true;
                }, 100);
            });
            waitsFor(function () {
                return timedOut;
            }, "force delay bombed", 500);
            runs(function () {
                expect(presentation.script.length).toBe(11);
                expect(presentation.script[9].fnName).toBe("pause"); //this is added by state change
            });


        });

    }));
    it("complete tests", inject(function (anduril, $controller, $modal, $log, $state) {
        $controller("RecordCtrl", {
            $scope: scope,
            acoustics: acoustics,
            $state: $state,
            anduril: anduril,
            $q: qrecord,
            presentation: presentation,
            recordAction: fakeMethods.recordAction,
            recorder: {}
        });
        spyOn(anduril, 'clearCache');
        scope.complete();
        expect(acoustics.stopRecording).toHaveBeenCalledWith({}, "presentationId");
        expect(anduril.completeRecord).toHaveBeenCalled();
        expect(anduril.clearCache).toHaveBeenCalled();
    }));
});
describe("record active initialization", function () {
    beforeEach(module('sokratik.atelier.record'));
    var scope;
    var presentation = {_id: "presentationId", presentationData: [
        {templateName: "t1", keyVals: {k1: "v1"}},
        {templateName: "t2", keyVals: {k1: "v1"}},
        {templateName: "t3", keyVals: {k1: "v1"}},
        {templateName: "t4", keyVals: {k1: "v1"}},
        {templateName: "t5", keyVals: {k1: "v1"}},
        {templateName: "t6", keyVals: {k1: "v1"}},
        {templateName: "t7", keyVals: {k1: "v1"}},
        {templateName: "t8", keyVals: {k1: "v1"}},
        {templateName: "t9", keyVals: {k1: "v1"}},
        {templateName: "t10", keyVals: {k10: "v10", k11: "v11"}},
        {templateName: "t11", keyVals: {k10: "v10", k11: "v11", k12: "v12"}},
        {templateName: "t12", keyVals: {k1: "v1"}},
        {templateName: "t13", keyVals: {k1: "v1"}}
    ]};
    var fakeMethods = {recordAction: function (resp) {
        presentation.script.push(resp);
    }};
    var acoustics = {
        resume: angular.noop,
        pause: angular.noop,
        stopRecording: function () {
            return {then: angular.noop};
        }

    };

    beforeEach(inject(function ($rootScope, anduril, $state) {
        scope = $rootScope.$new();
        scope.enableCanvas = angular.noop;
        spyOn(anduril, "put");
        spyOn($state, "go").andCallFake(function () {
            _.defer(scope.pause);
        });
        spyOn(fakeMethods, "recordAction").andCallThrough();
        spyOn(acoustics, "resume").andCallThrough();
        spyOn(acoustics, "pause").andCallThrough();
        spyOn(acoustics, "stopRecording").andCallThrough();
    }));

    it("initialization tests", inject(function (anduril, $controller, $modal, $log, $state, dialogue, sokratube) {
        $controller("RecordDialogue", {
            "$scope": scope,
            "presentation": presentation,
            "anduril": presentation,
            "dialogue": dialogue,
            "$stateParams": {page: "0"},
            "recordAction": fakeMethods.recordAction,
            "$q": qrecord,
            "sokratube": sokratube
        });
        expect(scope.totalPages).toBe(13);
        expect(scope.page).toBe(0);
        expect(scope.presentation).toBe(presentation.presentationData[0]);
        expect(scope.index).toBe(0);
        expect(scope.videoPresent).toBeFalsy();
    }));
    it("initialization tests with YT", inject(function (anduril, $controller, $modal, $log, $state, dialogue, sokratube) {
        var newpresentation = _.clone(presentation);
        newpresentation.presentationData = _.clone(presentation.presentationData);
        //noinspection JSValidateTypes
        newpresentation.presentationData[0].apps = [
            {name: "YT"}
        ];
        $controller("RecordDialogue", {
            "$scope": scope,
            "presentation": presentation,
            "anduril": newpresentation,
            "dialogue": dialogue,
            "$stateParams": {page: "0"},
            "recordAction": fakeMethods.recordAction,
            "$q": qrecord,
            "sokratube": sokratube
        });
        expect(scope.totalPages).toBe(13);
        expect(scope.page).toBe(0);
        expect(scope.presentation).toBe(presentation.presentationData[0]);
        expect(scope.index).toBe(0);
        expect(scope.videoPresent).toBeTruthy();
    }));

});
describe("record active control", function () {
    beforeEach(module('sokratik.atelier.record'));
    var scope;
    var presentation = {_id: "presentationId", presentationData: [
        {templateName: "t1", keyVals: {k1: "v1"}},
        {templateName: "t2", keyVals: {k1: "v1"}},
        {templateName: "t3", keyVals: {k1: "v1"}},
        {templateName: "t4", keyVals: {k1: "v1"}},
        {templateName: "t5", keyVals: {k1: "v1"}},
        {templateName: "t6", keyVals: {k1: "v1"}},
        {templateName: "t7", keyVals: {k1: "v1"}},
        {templateName: "t8", keyVals: {k1: "v1"}},
        {templateName: "t9", keyVals: {k1: "v1"}},
        {templateName: "t10", keyVals: {k10: "v10", k11: "v11"}},
        {templateName: "t11", keyVals: {k10: "v10", k11: "v11", k12: "v12"}},
        {templateName: "t12", keyVals: {k1: "v1"}},
        {templateName: "t13", keyVals: {k1: "v1"}}
    ], script: []};
    var fakeMethods = {recordAction: function (resp) {
        presentation.script.push(resp);
    }, pause: angular.noop};
    var acoustics = {
        resume: angular.noop,
        pause: angular.noop,
        stopRecording: function () {
            return {then: angular.noop};
        }

    };


    beforeEach(inject(function ($rootScope, anduril, $state, $controller, $modal, $log, dialogue, sokratube) {
        scope = $rootScope.$new();
        scope.enableCanvas = angular.noop;
        spyOn(anduril, "put");
        spyOn($state, "go").andCallFake(function () {
            _.defer(scope.pause);
        });
        spyOn(fakeMethods, "recordAction").andCallThrough();
        spyOn(acoustics, "resume").andCallThrough();
        spyOn(acoustics, "pause").andCallThrough();
        spyOn(acoustics, "stopRecording").andCallThrough();
        var newpresentation = _.clone(presentation);
        newpresentation.presentationData = _.clone(presentation.presentationData);
        //noinspection JSValidateTypes
        newpresentation.presentationData[0].apps = [
            {name: "YT", params: {videoId: "dummy"}}
        ];
        $controller("RecordDialogue", {
            "$scope": scope,
            "presentation": presentation,
            "anduril": newpresentation,
            "dialogue": dialogue,
            "$stateParams": {page: "0"},
            "recordAction": fakeMethods.recordAction,
            "$q": qrecord,
            "sokratube": sokratube
        });
        expect(scope.totalPages).toBe(13);
        expect(scope.page).toBe(0);
        expect(scope.presentation).toBe(presentation.presentationData[0]);
        expect(scope.index).toBe(0);
        spyOn(dialogue, "resetFragments").andCallFake(function () {
            return {then: angular.noop, resolve: angular.noop};
        });
        spyOn(dialogue, "makeVisible").andCallFake(function () {
            return {then: angular.noop, resolve: angular.noop};
        });
        spyOn(sokratube, "initYTVideo").andCallFake(function () {
            return {then: angular.noop, resolve: angular.noop};
        });

    }));

    it("add fragment  tests with real defer", inject(function () {

        expect(scope.totalFragments).toBeUndefined();
        scope.addFragment(function () {
            return [];
        });
        expect(scope.totalFragments).toBeUndefined();

    }));
    it("add fragment  tests with mock defer", inject(function () {

        spyOn(_, "defer").andCallFake(function (fn) {
            fn();
        });
        expect(scope.totalFragments).toBeUndefined();
        scope.addFragment(function () {
            return [];
        });

        expect(scope.totalFragments).toBe(0);
        scope.addFragment(function () {
            return [1, 2, 3];
        });

        expect(scope.totalFragments).toBe(3);

    }));
    it("next fragment  tests with mock defer", inject(function (dialogue) {
        jasmine.Clock.useMock();
        spyOn(_, "defer").andCallFake(function (fn) {
            fn();
        });
        expect(scope.totalFragments).toBeUndefined();
        scope.addFragment(function () {
            return [];
        });

        expect(scope.totalFragments).toBe(0);
        scope.addFragment(function () {
            return [1, 2, 3];
        });

        expect(scope.totalFragments).toBe(3);
        expect(scope.recording).toBeFalsy();
        expect(scope.index).toBe(0);
        scope.next();
        expect(scope.index).toBe(0);

        scope.recording = true;
        scope.next();
        expect(scope.index).toBe(0);
        jasmine.Clock.tick(1501);
        scope.next();
        expect(scope.index).toBe(1);
        scope.recording = false;
        jasmine.Clock.tick(3101);
        scope.next();
        expect(scope.index).toBe(1);
        scope.recording = true;
        jasmine.Clock.tick(4701);
        scope.next();
        expect(scope.index).toBe(2);
        expect(dialogue.makeVisible).toHaveBeenCalledWith({ fragments: [ 1, 2, 3 ], index: 0 }, deferred);
    }));
    it("sokratube fragment  tests with mock defer", inject(function (sokratube) {
        jasmine.Clock.useMock();
        spyOn(_, "defer").andCallFake(function (fn) {
            fn();
        });
        expect(scope.totalFragments).toBeUndefined();
        scope.addFragment(function () {
            return [];
        });

        expect(scope.totalFragments).toBe(0);
        scope.addFragment(function () {
            return [1, 2, 3];
        });

        expect(scope.totalFragments).toBe(3);
        spyOn(fakeMethods, "pause");

        scope.pause = fakeMethods.pause;
        scope.recordYTAction();
        expect(scope.pause).toHaveBeenCalled();
        expect(sokratube.initYTVideo).toHaveBeenCalledWith({ videoId: 'dummy' }, deferred);
    }));
    it("nextSlides with mock defer", inject(function (dialogue) {

        spyOn(_, "defer").andCallFake(function (fn) {
            fn();
        });
        expect(scope.totalFragments).toBeUndefined();
        scope.addFragment(function () {
            return [];
        });

        expect(scope.totalFragments).toBe(0);
        scope.addFragment(function () {
            return [1, 2, 3];
        });

        expect(scope.totalFragments).toBe(3);
        spyOn(dialogue, "changeState").andCallFake(function () {
            return "state Changed";
        });
        scope.nextSlide();
        expect(dialogue.changeState).toHaveBeenCalledWith({ subState: '.activate', params: { page: 1 } });
    }));

});
