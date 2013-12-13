/**
 * Tests all the controllers defined in edit.js
 */
describe('edit section initialization ', function () {
    beforeEach(module('sokratik.atelier.edit'));
    var scope;
    var answer = {presentationData: [
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
    beforeEach(inject(function ($rootScope, anduril, $state) {
        scope = $rootScope.$new();
        spyOn(anduril, "put");
        spyOn($state, "go");
    }));
    it("initialization checks", inject(function (anduril, $controller, $modal, $log) {
        $controller("EditController", {
            $scope: scope,
            page: "10",
            $stateParams: {presentationId: "presentationId"},
            answer: answer,
            anduril: anduril,
            $modal: $modal,
            $log: $log
        });
        expect("10").not.toBe(10);
        expect(scope.page).toBe(10);
        expect(anduril.put).toHaveBeenCalled();
        expect(scope.presentation.keyVals.k12).toBe("v12");
        expect(scope.images).toBe(1);
        expect(scope.presentation.templateName).toBe("t11");
    }));
    it("initialization checks", inject(function (anduril, $controller, $modal, $log) {
        $controller("EditController", {
            $scope: scope,
            page: "1",
            $stateParams: {presentationId: "presentationId", images: 5},
            answer: answer,
            anduril: anduril,
            $modal: $modal,
            $log: $log
        });
        expect(scope.page).toBe(1);
        expect(anduril.put).toHaveBeenCalled();
        expect(scope.presentation.keyVals.k1).toBe("v1");
        expect(scope.images).toBe(5);
        expect(scope.presentation.templateName).toBe("t2");
    }));
});
describe('edit section post initialization ', function () {
    beforeEach(module('sokratik.atelier.edit'));
    var scope, controller;
    var answer;
    beforeEach(inject(function ($rootScope, anduril, $state, $controller, $modal, $log) {
        scope = $rootScope.$new();
        spyOn(anduril, "put");
        spyOn($state, "go");
        spyOn(anduril, "post");
        answer = {presentationData: [
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
        controller = $controller("EditController", {
            $scope: scope,
            page: "1",
            $stateParams: {presentationId: "presentationId", images: 5, templateName: "template"},
            answer: answer,
            anduril: anduril,
            $modal: $modal,
            $log: $log
        });
    }));
    it("record navigation test", inject(function ($state, anduril) {
        scope.record();
        expect($state.go).toHaveBeenCalledWith("record.master");
        expect(anduril.post).toHaveBeenCalledWith(answer);
    }));
    it("page navigation test", inject(function ($state, anduril) {
        scope.goToPage(5);
        expect($state.go).toHaveBeenCalledWith('edit.template', { templateName: "template",
            presentationId: 'presentationId', page: 5 });
        expect(anduril.post).toHaveBeenCalledWith(answer);
    }));
    it("remove page test", inject(function ($state, anduril) {
        expect(answer.presentationData.length).toBe(13);
        scope.remove();
        expect(answer.presentationData.length).toBe(12);
        expect($state.go).toHaveBeenCalledWith('edit.template', { templateName: "template",
            presentationId: 'presentationId', page: 0 });
        expect(anduril.post).toHaveBeenCalledWith(answer);
    }));
    it("increase images", inject(function ($state, anduril) {
        expect(answer.presentationData[scope.page].templateName).toBe("t2");
        scope.increaseImages();
        expect(answer.presentationData[scope.page].templateName).toBe("1imageText");
        expect($state.go).toHaveBeenCalledWith('edit.template', { templateName: "imageText", images: 1});
        expect(anduril.post).toHaveBeenCalledWith(answer);
    }));
    it("decrease images", inject(function ($state, anduril) {
        expect(answer.presentationData[scope.page].templateName).toBe("t2");
        scope.decreaseImages();
        expect(answer.presentationData[scope.page].templateName).toBe("4imageText");
        expect($state.go).toHaveBeenCalledWith('edit.template', { templateName: "imageText", images: 4});
        expect(anduril.post).toHaveBeenCalledWith(answer);
    }));
    it("add slide", inject(function ($state, anduril) {
        expect(answer.presentationData.length).toBe(13);
        scope.add();
        expect(answer.presentationData.length).toBe(14);
        expect(answer.presentationData[scope.page].templateName).toBe("t2");
        expect(answer.presentationData[scope.page + 1].templateName).toBe("1imageText");
        expect($state.go).toHaveBeenCalledWith('edit.template', { page: 2, templateName: 'imageText', images: 1 });
        expect(anduril.post).toHaveBeenCalledWith(answer);
    }));
    it("add video", inject(function ($state, anduril, $rootScope) {
        var videoId = null;
        window.YT = {
            Player: function (_divId, _options) {
                this.getCurrentTime = function () {
                    return 10;
                };
                this.loadVideoById = function (vId, delay, format) {
                    expect(format).toBe("large");
                    videoId = vId;
                };
            },
            PlayerState: {PLAYING: 1, END: 2}
        };
        expect(answer.presentationData[scope.page].apps).toBeUndefined();
        scope.addVideo();
        expect(answer.presentationData[scope.page].apps).toBeDefined();
        expect(answer.presentationData[scope.page].apps.length).toBe(0);
        $rootScope.$digest();
        $rootScope.$$childTail.renderYT("ohohoho/watch?v=myVid");
        expect(videoId).toBeNull();
        waitsFor(function(){
            return !!videoId;
        },"render YT not called",2000);
        runs(function(){
            expect(videoId).toBe("myVid");
        });
        $rootScope.$$childTail.ok("ohohoho/watch?v=dummyVideo");
        $rootScope.$digest();
        expect(answer.presentationData[scope.page].apps.length).toBe(1);
        expect(answer.presentationData[scope.page].apps[0].name).toBe("YT");
        expect(answer.presentationData[scope.page].apps[0].params.videoId).toBe("dummyVideo");

    }));
});
