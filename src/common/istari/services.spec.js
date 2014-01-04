describe('istari , the one where we do not talk to the server', function () {
    beforeEach(module('sokratik.atelier.istari.services'));
    var answer;
    beforeEach(function () {
        answer = {presentationData: [
            {templateName: "template",
                keyVals: {key1: "val1"}},
            {templateName: "template2",
                keyVals: {key2: "val2"}}
        ], script: []};
    });
    it("put", inject(function (anduril) {
        expect(answer.presentationData[1].keyVals.key2).toBe("val2");
        expect(answer.presentationData[1].keyVals.key3).toBeUndefined();
        var modifiedAnswer = anduril.put(answer, 1, {templateName: "template2",
            keyVals: {key2: "val2", key3: "val3"}});
        expect(modifiedAnswer.presentationData[1].keyVals.key3).toBe("val3");
        expect(answer.presentationData[1].keyVals.key3).toBe("val3");

    }));
    it("insert at start", inject(function (anduril) {
        expect(answer.presentationData[1].keyVals.key2).toBe("val2");
        expect(answer.presentationData[1].keyVals.key1).toBeUndefined();
        expect(answer.presentationData[0].templateName).toBe("template");

        expect(answer.presentationData.length).toBe(2);
        var modifiedAnswer = anduril.insert(answer, 0, {templateName: "newTemplate",
            keyVals: {key0: "val0"}});
        expect(answer.presentationData[0].templateName).toBe("newTemplate");
        expect(modifiedAnswer.presentationData.length).toBe(3);
        expect(modifiedAnswer.presentationData[1].keyVals.key2).toBeUndefined();
        expect(modifiedAnswer.presentationData[1].keyVals.key1).toBe("val1");
    }));
    it("insert at middle", inject(function (anduril) {
        expect(answer.presentationData[1].keyVals.key2).toBe("val2");
        expect(answer.presentationData[1].keyVals.key1).toBeUndefined();
        expect(answer.presentationData[0].templateName).toBe("template");
        expect(answer.presentationData.length).toBe(2);
        var modifiedAnswer = anduril.insert(answer, 1, {templateName: "newTemplate",
            keyVals: {key0: "val0"}});
        expect(answer.presentationData[1].templateName).toBe("newTemplate");
        expect(modifiedAnswer.presentationData.length).toBe(3);
        expect(modifiedAnswer.presentationData[1].keyVals.key2).toBeUndefined();
        expect(modifiedAnswer.presentationData[1].keyVals.key0).toBe("val0");
        expect(modifiedAnswer.presentationData[2].keyVals.key2).toBe("val2");
        expect(answer.presentationData[2].keyVals.key2).toBe("val2");
    }));
    it("change template", inject(function (anduril) {
        expect(answer.presentationData[0].templateName).toBe("template");
        anduril.changeTemplate(answer, 0, "etalpmet");
        expect(answer.presentationData[0].templateName).toBe("etalpmet");
        try {
            anduril.changeTemplate(answer, 5, "etalpmet");
            expect(false).toBeTruthy();//we should not reach here
        } catch (t) {
            expect(true).toBeTruthy();
        }


    }));
    it("remove", inject(function (anduril) {
        answer.presentationData.push({templateName: "template3",
            keyVals: {key3: "val3"}});
        expect(answer.presentationData.length).toBe(3);
        expect(answer.presentationData[1].keyVals.key2).toBe("val2");
        expect(answer.presentationData[1].keyVals.key3).toBeUndefined();
        anduril.remove(answer, 1);
        expect(answer.presentationData.length).toBe(2);
        expect(answer.presentationData[1].keyVals.key2).toBeUndefined();
        expect(answer.presentationData[1].keyVals.key3).toBe("val3");


    }));
    it("record script", inject(function (anduril) {
        expect(answer.script.length).toBe(0);
        anduril.recordAction(answer,{fnName:"x"});
        expect(answer.script.length).toBe(1);
        anduril.recordAction(answer,{fnName:"y"});
        expect(answer.script.length).toBe(2);
        expect(answer.script[0].fnName).toBe("x");
    }));
    it("insert script", inject(function (anduril) {
        expect(answer.script.length).toBe(0);
        anduril.recordAction(answer,{fnName:"x"});
        expect(answer.script.length).toBe(1);
        anduril.recordAction(answer,{fnName:"y"});
        expect(answer.script.length).toBe(2);
        expect(answer.script[0].fnName).toBe("x");
        anduril.insertScript(answer,[{fnName:"z"}]);
        expect(answer.script.length).toBe(1);
        expect(answer.script[0].fnName).toBe("z");
    }));

});
describe("istari, the one where we talk to server", function () {
    var presentation, httpBackend;
    beforeEach(module('sokratik.atelier.istari.services'));
    beforeEach(inject(function ($httpBackend, anduril) {
        $httpBackend.when('GET', '/presentation/presentationId').respond(
            {_id: "presentationId",
                presentationData: [
                    {templateName: "template",
                        keyVals: {key1: "val1"}},
                    {templateName: "template2",
                        keyVals: {key2: "val2"}}
                ],
                script: []}
        );

        httpBackend = $httpBackend;
        anduril.fetchPresentation("presentationId").then(function (_presentation_) {
            presentation = _presentation_;
        });
        $httpBackend.flush();
    }));
    it("saveAnswer", inject(function (anduril) {
        httpBackend.when('PUT', '/presentation/presentationId').respond(function (method, url, data) {
                return [200, data];
            }
        );
        var posted = false;
        anduril.post(presentation).then(function (resp) {
            posted = true;
            expect(resp._id).toBe("presentationId");
        });
        httpBackend.flush();
        waitsFor(function () {
            return posted;
        }, "put call did not succeed", 1000);
    }));
    it("complete Record", inject(function (anduril) {
        httpBackend.when('PUT', '/presentation/presentationId').respond(function (method, url, data) {
                return [200, data];
            }
        );
        var posted = false;
        anduril.completeRecord(presentation).then(function (resp) {
            posted = true;
            expect(resp._id).toBe("presentationId");
        });
        httpBackend.flush();
        waitsFor(function () {
            return posted;
        }, "put call did not succeed", 1000);
    }));
    it("fetchImage", inject(function (anduril) {
        httpBackend.when('GET', '/related-images/testId').respond([
            {url: "image1", thumbnail: "image2"}
        ]);
        var images = [];
        expect(images.length).toBe(0);
        anduril.fetchImages("testId").then(function (data) {
            images = data;
        });
        httpBackend.flush();
        expect(images.length).toBe(1);
        expect(images[0].url).toBe("image1");
    }));
});