var startTime = (new Date()).getTime();
var presentationData = [
    {templateName: "templateName", keyVals: {k1: "v1", k2: "v2"}}
];
var successFn = {mock: function (params) {

}};
var deferred = {promise: {then: angular.noop},
    resolve: "resolve"
};
var q = {
    defer: function () {
        return deferred;
    },
    when: function (out) {
        return {
            then: function (fn) {
                successFn.mock(fn);
            }
        };
    }
};

var answer = {_id: "answerId",
    script: [
        {fnName: "changeState",
            args: {subState: ".activate", params: {page: 0}},
            actionInitiated: startTime + 1000, module: "dialogue"} ,
        {fnName: "pause",
            args: { params: {page: 0}},
            actionInitiated: startTime + 2000, module: "apollo"} ,
        {fnName: "resume",
            args: { params: {page: 0}},
            actionInitiated: startTime + 3000, module: "apollo"} ,
        {fnName: "makeVisible",
            args: { params: {page: 0}},
            actionInitiated: startTime + 4000, module: "dialogue"},
        {fnName: "redo",
            args: { params: {page: 0}},
            actionInitiated: startTime + 9000, module: "apollo"},
        {fnName: "pause",
            args: { params: {page: 0}},
            actionInitiated: startTime + 10000, module: "apollo"} ,
        {fnName: "resume",
            args: { params: {page: 0}},
            actionInitiated: startTime + 11000, module: "apollo"} ,
        {fnName: "changeState",
            args: {subState: ".activate", params: {page: 1}},
            actionInitiated: startTime + 14000, module: "dialogue"}
    ],
    presentationData: presentationData};
atelierPlayer(angular, "sokratik.atelier.player", answer);
describe('Player Ctrl', function () {
    beforeEach(module('sokratik.atelier.player'));
    var scope;
    beforeEach(inject(function ($rootScope) {
        scope = $rootScope.$new();
    }));
    it("test initialization", inject(function ($controller) {
        $controller("PlayCtrl", {
            $scope: scope
        });
        expect(scope.presentationId).toBe("answerId");
        expect(scope.presentations).toBe(presentationData);
    }));
});
describe('Player Audio', function () {
    beforeEach(module('sokratik.atelier.player'));
    var scope, modules = {};
    beforeEach(inject(function ($rootScope, apollo, dialogue, sokratube) {
        scope = $rootScope.$new();
        modules.apollo = apollo;
        modules.dialogue = dialogue;
        modules.sokratube = sokratube;
        spyOn(successFn, "mock");
        spyOn(_, "delay").andCallThrough();
        spyOn(apollo, "initBGAudio");
        spyOn(q, "when").andCallThrough();
        spyOn(dialogue, "changeState").andCallFake(function () {
            return arguments;
        });
    }));
    it("test Bg audio", inject(function ($controller, $state, apollo) {
        jasmine.Clock.useMock();
        $controller("PlayAudio", {
            $scope: scope,
            $state: $state,
            modules: modules,
            $stateParams: {timeStamp: startTime, pausedInterval: 0, scriptIndex: 0},
            $q: q
        });

        expect(apollo.initBGAudio).toHaveBeenCalled();
        expect(_.delay).toHaveBeenCalledWith(jasmine.any(Function), 1000);
        jasmine.Clock.tick(1001);
        expect(q.when).toHaveBeenCalled();
        expect(successFn.mock).toHaveBeenCalledWith(angular.noop);
    }));
});
describe('Player Activate', function () {
    beforeEach(module('sokratik.atelier.player'));
    var scope, modules = {};
    beforeEach(inject(function ($rootScope, apollo, dialogue, sokratube) {
        scope = $rootScope.$new();
        modules.apollo = apollo;
        modules.dialogue = dialogue;
        modules.sokratube = sokratube;
        spyOn(successFn, "mock");
        spyOn(_, "delay").andCallThrough();
        spyOn(apollo, "initBGAudio");
        spyOn(q, "when").andCallThrough();
        spyOn(dialogue, "changeState").andCallFake(function () {
            return arguments;
        });
        spyOn(dialogue, "makeVisible").andCallFake(function () {
            return arguments;
        });
        spyOn(apollo, "resume").andCallFake(function () {
            return arguments;
        });
        spyOn(apollo, "pause").andCallFake(function () {
            return arguments;
        });
        spyOn(dialogue, "resetFragments").andCallFake(function () {
            return {then: function (callback) {
                callback();
            }};
        });
    }));
    it("real timer pause", inject(function ($controller, $state, dialogue) {
        var timeOutEnded = false;
        $controller("PlayActive", {
            $scope: scope,
            $state: $state,
            modules: modules,
            $stateParams: {timeStamp: startTime, pausedInterval: 0, scriptIndex: 1, page: 0},
            $q: q
        });
        expect(scope.presentation).toBe(presentationData[0]);
        expect(scope.presentationId).toBe("answerId");
        expect(_.delay).not.toHaveBeenCalled();
        scope.addFragment(function () {
            return [];
        });
        expect(dialogue.resetFragments).not.toHaveBeenCalled();

        runs(function () {
            setTimeout(function () {
                timeOutEnded = true;
            }, 500);
        });

        waitsFor(function () {
            return timeOutEnded;
        }, "force delay bailed", 1000);


        runs(function () {
            expect(dialogue.resetFragments).toHaveBeenCalled();  //calls after end of current stack
            expect(_.delay).toHaveBeenCalledWith(jasmine.any(Function), 2000);
        });

    }));
    it("fake timer pause", inject(function ($controller, $state, dialogue, apollo) {
        jasmine.Clock.useMock();
        $controller("PlayActive", {
            $scope: scope,
            $state: $state,
            modules: modules,
            $stateParams: {timeStamp: startTime, pausedInterval: 0, scriptIndex: 1, page: 0},
            $q: q
        });
        spyOn(_, "defer").andCallFake(function (fn) {
            fn();
        });
        expect(scope.presentation).toBe(presentationData[0]);
        expect(scope.presentationId).toBe("answerId");
        expect(_.delay).not.toHaveBeenCalled();
        scope.addFragment(function () {
            return [];
        });
        expect(dialogue.resetFragments).toHaveBeenCalled();
        expect(_.delay).toHaveBeenCalledWith(jasmine.any(Function), 2000);
        jasmine.Clock.tick(2001);
        expect(q.when).toHaveBeenCalled();
        expect(successFn.mock).toHaveBeenCalled();
        expect(apollo.pause).toHaveBeenCalled();
        expect(successFn.mock).not.toHaveBeenCalledWith(angular.noop);
    }));
    it("resume", inject(function ($controller, $state, dialogue, apollo) {
        jasmine.Clock.useMock();
        $controller("PlayActive", {
            $scope: scope,
            $state: $state,
            modules: modules,
            $stateParams: {timeStamp: startTime, pausedInterval: 0, scriptIndex: 2, page: 0},
            $q: q
        });
        spyOn(_, "defer").andCallFake(function (fn) {
            fn();
        });
        expect(scope.presentation).toBe(presentationData[0]);
        expect(scope.presentationId).toBe("answerId");
        expect(_.delay).not.toHaveBeenCalled();
        scope.addFragment(function () {
            return [];
        });
        expect(dialogue.resetFragments).toHaveBeenCalled();
        expect(_.delay).toHaveBeenCalledWith(jasmine.any(Function), 0);
        jasmine.Clock.tick(1);
        expect(q.when).toHaveBeenCalled();
        expect(successFn.mock).toHaveBeenCalled();
        expect(q.defer()).toEqual(jasmine.any(Object));
        expect(apollo.resume).toHaveBeenCalledWith({ params: { scriptIndex: 3, timeStamp: jasmine.any(Number), page: 0, pausedInterval: 3000 }, fragments: [  ] }, deferred);
        expect(successFn.mock).not.toHaveBeenCalledWith(angular.noop);
    }));
    it("make Visible", inject(function ($controller, $state, dialogue, apollo) {
        jasmine.Clock.useMock();
        $controller("PlayActive", {
            $scope: scope,
            $state: $state,
            modules: modules,
            $stateParams: {timeStamp: startTime + 2000, pausedInterval: 0, scriptIndex: 3, page: 0},
            $q: q
        });
        spyOn(_, "defer").andCallFake(function (fn) {
            fn();
        });
        expect(scope.presentation).toBe(presentationData[0]);
        expect(scope.presentationId).toBe("answerId");
        expect(_.delay).not.toHaveBeenCalled();
        scope.addFragment(function () {
            return [];
        });
        expect(dialogue.resetFragments).toHaveBeenCalled();
        expect(_.delay).toHaveBeenCalledWith(jasmine.any(Function), 2000);
        jasmine.Clock.tick(2001);
        expect(q.when).toHaveBeenCalled();
        expect(successFn.mock).toHaveBeenCalled();
        expect(dialogue.makeVisible).toHaveBeenCalled();
        expect(successFn.mock).not.toHaveBeenCalledWith(angular.noop);
    }));
    it("redo", inject(function ($controller, $state, dialogue, apollo) {
        jasmine.Clock.useMock();
        $controller("PlayActive", {
            $scope: scope,
            $state: $state,
            modules: modules,
            $stateParams: {timeStamp: startTime + 2000, pausedInterval: 0, scriptIndex: 4, page: 0},
            $q: q
        });
        spyOn(_, "defer").andCallFake(function (fn) {
            fn();
        });
        spyOn(apollo, "redo");
        expect(scope.presentation).toBe(presentationData[0]);
        expect(scope.presentationId).toBe("answerId");
        expect(_.delay).not.toHaveBeenCalled();
        scope.addFragment(function () {
            return [];
        });
        expect(dialogue.resetFragments).toHaveBeenCalled();
        expect(_.delay).toHaveBeenCalledWith(jasmine.any(Function), 0);
        jasmine.Clock.tick(5);
        expect(q.when).toHaveBeenCalled();
        expect(successFn.mock).toHaveBeenCalled();
        expect(apollo.redo).toHaveBeenCalledWith({ params: { scriptIndex: 5, timeStamp: jasmine.any(Number),
                page: 0, pausedInterval: 0 }, fragments: [  ] },
            deferred);
        expect(successFn.mock).not.toHaveBeenCalledWith(angular.noop);
    }));
    it("resume last", inject(function ($controller, $state, dialogue, apollo) {
        jasmine.Clock.useMock();
        $controller("PlayActive", {
            $scope: scope,
            $state: $state,
            modules: modules,
            $stateParams: {timeStamp: startTime + 6000, pausedInterval: 4000, scriptIndex: 6, page: 0},
            $q: q
        });
        spyOn(_, "defer").andCallFake(function (fn) {
            fn();
        });
        expect(scope.presentation).toBe(presentationData[0]);
        expect(scope.presentationId).toBe("answerId");
        expect(_.delay).not.toHaveBeenCalled();
        scope.addFragment(function () {
            return [];
        });
        expect(dialogue.resetFragments).toHaveBeenCalled();
        expect(_.delay).toHaveBeenCalledWith(jasmine.any(Function), 0);
        jasmine.Clock.tick(1);
        expect(q.when).toHaveBeenCalled();
        expect(successFn.mock).toHaveBeenCalled();
        expect(q.defer()).toEqual(jasmine.any(Object));
        expect(apollo.resume).toHaveBeenCalledWith({ params: { scriptIndex: 7, timeStamp: jasmine.any(Number), page: 0, pausedInterval: 9000 }, fragments: [  ] }, deferred);
        expect(successFn.mock).not.toHaveBeenCalledWith(angular.noop);
    }));
    it("resume no initial pausedInterval", inject(function ($controller, $state, dialogue, apollo) {
        jasmine.Clock.useMock();
        $controller("PlayActive", {
            $scope: scope,
            $state: $state,
            modules: modules,
            $stateParams: {timeStamp: startTime + 7000, pausedInterval: 0, scriptIndex: 6, page: 0},
            $q: q
        });
        spyOn(_, "defer").andCallFake(function (fn) {
            fn();
        });
        expect(scope.presentation).toBe(presentationData[0]);
        expect(scope.presentationId).toBe("answerId");
        expect(_.delay).not.toHaveBeenCalled();
        scope.addFragment(function () {
            return [];
        });
        expect(dialogue.resetFragments).toHaveBeenCalled();
        expect(_.delay).toHaveBeenCalledWith(jasmine.any(Function), 0);
        jasmine.Clock.tick(1);
        expect(q.when).toHaveBeenCalled();
        expect(successFn.mock).toHaveBeenCalled();
        expect(q.defer()).toEqual(jasmine.any(Object));
        expect(apollo.resume).toHaveBeenCalledWith({ params: { scriptIndex: 7, timeStamp: jasmine.any(Number), page: 0, pausedInterval: 4000}, fragments: [  ] }, deferred);
        expect(successFn.mock).not.toHaveBeenCalledWith(angular.noop);
    }));


});