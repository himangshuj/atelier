/**
 * Tests all the controllers defined in edit.js
 */
describe('edit section initialization ', function () {
    beforeEach(module('sokratik.atelier.edit'));
    var scope;
    var presentation = {presentationData: [
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
            presentation: presentation,
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
            presentation: presentation,
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
    var presentation;
    beforeEach(inject(function ($rootScope, anduril, $state, $controller, $modal, $log) {
        scope = $rootScope.$new();
        spyOn(anduril, "put").andCallThrough();
        spyOn($state, "go");
        spyOn(anduril, "post");
        presentation = {presentationData: [
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
            $stateParams: {presentationId: "presentationId", images: 3, templateName: "template"},
            presentation: presentation,
            anduril: anduril,
            $modal: $modal,
            $log: $log
        });
    }));
    it("record navigation test", inject(function ($state, anduril) {
        scope.record();
        expect($state.go).toHaveBeenCalledWith("record.activate",{page:0});
        expect(anduril.post).toHaveBeenCalledWith(presentation);
    }));
    it("page navigation test", inject(function ($state, anduril) {
        scope.goToPage(5);
        expect($state.go).toHaveBeenCalledWith('edit', { templateName: "template",
            presentationId: 'presentationId', page: 5 });
        expect(anduril.post).toHaveBeenCalledWith(presentation);
    }));
    it("remove page test", inject(function ($state, anduril) {
        expect(presentation.presentationData.length).toBe(13);
        scope.remove();
        expect(presentation.presentationData.length).toBe(12);
        expect($state.go).toHaveBeenCalledWith('edit', { templateName: "template",
            presentationId: 'presentationId', page: 0 });
        expect(anduril.post).toHaveBeenCalledWith(presentation);
    }));
    it("increase images", inject(function ($state, anduril) {
        expect(presentation.presentationData[scope.page].templateName).toBe("t2");
        scope.increaseImages();
        expect(presentation.presentationData[scope.page].templateName).toBe("4imageText");
        expect($state.go).toHaveBeenCalledWith('edit', { templateName: "imageText", images: 4});
        expect(anduril.put).toHaveBeenCalled();
        expect(anduril.post).toHaveBeenCalledWith(presentation);
    }));
    it("decrease images", inject(function ($state, anduril) {
        expect(presentation.presentationData[scope.page].templateName).toBe("t2");
        scope.decreaseImages();
        expect(presentation.presentationData[scope.page].templateName).toBe("2imageText");
        expect($state.go).toHaveBeenCalledWith('edit', { templateName: "imageText", images: 2});
        expect(anduril.put).toHaveBeenCalled();
        expect(anduril.post).toHaveBeenCalledWith(presentation);
    }));
    it("add slide", inject(function ($state, anduril) {
        expect(presentation.presentationData.length).toBe(13);
        scope.add();
        expect(presentation.presentationData.length).toBe(14);
        expect(presentation.presentationData[scope.page].templateName).toBe("t2");
        expect(presentation.presentationData[scope.page + 1].templateName).toBe("1imageText");
        expect($state.go).toHaveBeenCalledWith('edit', { page: 2, templateName: 'imageText', images: 1 });
        expect(anduril.put).toHaveBeenCalled();
        expect(anduril.post).toHaveBeenCalledWith(presentation);
    }));

    it("toggle fullscreenimage", inject(function () {
        expect(presentation.presentationData[scope.page].templateName).toBe("t2");
        scope.toggleFullScreenImage();
        expect(presentation.presentationData[scope.page].templateName).toBe("fullImage");
        scope.presentation.templateName = 'fullImage';
        scope.toggleFullScreenImage();
        expect(presentation.presentationData[scope.page].templateName).toBe("fullImage");

    }));
    it("toggle fullscreenimage", inject(function () {
        scope.presentation.templateName = 'fullImage';
        scope.toggleFullScreenImage();
        expect(presentation.presentationData[scope.page].templateName).toBe("1imageText");
        scope.presentation.templateName = 'tada';
        scope.toggleFullScreenImage();
        expect(presentation.presentationData[scope.page].templateName).toBe("1imageText");

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
        expect(presentation.presentationData[scope.page].apps).toBeUndefined();
        scope.addVideo();
        expect(presentation.presentationData[scope.page].apps).toBeDefined();
        expect(presentation.presentationData[scope.page].apps.length).toBe(0);
        $rootScope.$digest();
        $rootScope.$$childTail.renderYT("ohohoho/watch?v=myVid");
        expect(videoId).toBeNull();
        waitsFor(function(){
            return !!videoId;
        },"render YT not called",2000);
        runs(function(){
            expect(videoId).toBe("myVid");
        });
        $rootScope.$$childTail.ok("ohohoho/watch?v=dummyVideo",678);
        $rootScope.$digest();
        expect(presentation.presentationData[scope.page].apps.length).toBe(1);
        expect(presentation.presentationData[scope.page].apps[0].name).toBe("YT");
        expect(presentation.presentationData[scope.page].apps[0].params.videoId).toBe("dummyVideo");
        expect(presentation.presentationData[scope.page].apps[0].params.startTime).toBe(678);


    }));
});
