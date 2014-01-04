/**
 *Defines all the use cases for minerva, which is the module that
 * translates the templates
 */
describe('minerva edit mode text', function () {
    beforeEach(module('sokratik.atelier.minerva.directives'));
    var scope, compile, element;
    var dialogue = "<sokratik-dialogue presentation=\"presentation\"" +
        "increase-images=\"increaseImages\"" +
        "decrease-images=\"decreaseImages\"></sokratik-dialogue>";
    var fragment = "<sokratik-fragment type=\"text\" model=\"text1\" default=\"default text\"" +
        " placeholder=\"Click to edit line 3\"></sokratik-fragment>";
    beforeEach(inject(function ($compile, $rootScope, $state, $templateCache) {
        scope = $rootScope;
        compile = $compile;
        $state.current.data = {"mode": "edit"};
        $templateCache.put("templates/textOnly.tpl.html", "<sokratik-fragment type=\"text\" model=\"text3\" default=\"default text\"" +
            " placeholder=\"Click to edit line 3\"></sokratik-fragment>");
        $templateCache.put("templates/2textOnly.tpl.html", "<sokratik-fragment type=\"text\" model=\"text1\" default=\"default text\"" +
            " placeholder=\"Click to edit line 3\"></sokratik-fragment><sokratik-fragment type=\"text\" model=\"text2\" default=\"default text\"" +
            " placeholder=\"Click to edit line 3\"></sokratik-fragment>");


    }));
    it('Sokratik Dialogue link up Test with 1 fragment', inject(function () {
        scope.presentation = {"templateName": "textOnly", keyVals: {text3: "default text"}};
        element = compile(dialogue)(scope);
        scope.$apply();
        expect(element.children().scope().dialogueCtrl.getProperty("text3")).toBe("default text");
        expect(element.children().scope().dialogueCtrl.getFragments()[0].value).toBe("default text");
        expect(element.children().scope().dialogueCtrl.getFragments().length).toBe(1);
        expect(element.attr("class")).toBe("ng-scope ng-isolate-scope");
        expect(angular.element(element.children()[0]).attr("class")).toBe("full-height");
        expect(angular.element(element.find("input")[0]).attr("ng-model")).toBe("model.value");
    }));
    it('Sokratik fragment html Test with 1 fragment', inject(function () {
        scope.presentation = {"templateName": "textOnly", keyVals: {text3: "test text"}};
        element = compile(dialogue)(scope);
        scope.$digest();
        var dialogueElement = angular.element(angular.element(element.children()[0]).children(0));
        expect(dialogueElement.children().scope().text3.value).toBe("test text");
        var fragmentElement = angular.element(dialogueElement.children()[0]);
        expect(fragmentElement.children().scope().model.css[0]).toBe("fragment");
        expect(fragmentElement.children().scope().model.value).toBe("test text");
        scope.$apply(function () {
            fragmentElement.children().scope().model.value = "new value";
        });
        expect(dialogueElement.children().scope().text3.value).toBe("new value");
    }));
    it('Sokratik fragment html Test with 1 fragment initialization', inject(function () {
        scope.presentation = {"templateName": "textOnly", keyVals: {}};
        element = compile(dialogue)(scope);
        scope.$digest();
        var dialogueElement = angular.element(angular.element(element.children()[0]).children(0));
        expect(element.children().scope().dialogueCtrl.getProperty("text3")).toBeUndefined();
        var fragmentElement = angular.element(dialogueElement.children()[0]);
        expect(fragmentElement.children().scope().model.css[0]).toBe("fragment");
        expect(fragmentElement.children().scope().model.value).toBe("default text");
        expect(element.children().scope().dialogueCtrl.getFragments().length).toBe(0);
        scope.$apply(function () {
            fragmentElement.children().scope().model.value = "new value";
            fragmentElement.children().scope().read();
        });
        expect(element.children().scope().dialogueCtrl.getProperty("text3")).toBe("new value");
        expect(dialogueElement.children().scope().text3.value).toBe("new value");
    }));
    it('Sokratik fragment html Test with 2 fragments', inject(function () {
        scope.presentation = {"templateName": "2textOnly", keyVals: {text2: "text2init"}};
        element = compile(dialogue)(scope);
        scope.$digest();
        var dialogueElement = angular.element(angular.element(element.children()[0]).children(0));
        expect(element.children().scope().dialogueCtrl.getProperty("text1")).toBeUndefined();
        expect(element.children().scope().dialogueCtrl.getProperty("text2")).toBe("text2init");
        var fragmentElement = angular.element(dialogueElement.children()[0]);
        expect(fragmentElement.children().scope().model.css[0]).toBe("fragment");
        expect(fragmentElement.children().scope().model.value).toBe("default text");
        expect(element.children().scope().dialogueCtrl.getFragments().length).toBe(1);
        expect(element.children().scope().dialogueCtrl.getFragments()[0].value).toBe("text2init");//1st fragment was not included in add fragments
        scope.$apply(function () {
            fragmentElement.children().scope().model.value = "new value";
            fragmentElement.children().scope().read();
        });
        expect(element.children().scope().dialogueCtrl.getProperty("text1")).toBe("new value");
        expect(dialogueElement.children().scope().text1.value).toBe("new value");
    }));
    it("sokratik fragment dialogue need test", inject(function () {
        scope.presentation = {"templateName": "2textOnly", keyVals: {text2: "text2init"}};
        element = compile(fragment)(scope);
        try {
            scope.$digest();
            expect(false).toBeTruthy();
        } catch (t) {
            expect(true).toBeTruthy();
        }
    }));
});
describe("minerava dialogue controller test", function () {
    beforeEach(module('sokratik.atelier.minerva.directives'));
    var controller, scope;
    beforeEach(inject(function ($controller, $rootScope) {
        controller = $controller;
        scope = $rootScope.$new();
        scope.presentation = {"templateName": "textOnly", keyVals: {text3: "default text"}};
    }));
    it("addFragment", function () {
        var ctrl = controller('DialogueController', {$scope: scope, $element: null});
        ctrl.addFragment({value: "fr1", css: ["css1"], caption: "cap1"});
        ctrl.addFragment({value: "fr2", css: ["css2"], caption: "cap2"});
        expect(ctrl.getFragments()[0].value).toBe("fr1");
        expect(ctrl.getFragments().length).toBe(2);

    });
    it("setProperty", function () {
        var ctrl = controller('DialogueController', {$scope: scope, $element: null});
        ctrl.setProperty("fr1", "val1");
        expect(scope.presentation.keyVals.fr1).toBe("val1");
    });
    it("getProperty", function () {
        var ctrl = controller('DialogueController', {$scope: scope, $element: null});
        expect(ctrl.getProperty("text3")).toBe("default text");
    });
});
describe('minerva record mode text', function () {
    beforeEach(module('sokratik.atelier.minerva.directives'));
    var scope, compile, element;
    var dialogue = "<sokratik-dialogue presentation=\"presentation\"" +
        "increase-images=\"increaseImages\"" +
        "decrease-images=\"decreaseImages\"></sokratik-dialogue>";
    var fragment = "<sokratik-fragment type=\"text\" model=\"text1\" default=\"default text\"" +
        " placeholder=\"Click to edit line 3\"></sokratik-fragment>";
    beforeEach(inject(function ($compile, $rootScope, $state, $templateCache) {
        scope = $rootScope;
        compile = $compile;
        $state.current.data = {"mode": "record"};
        $templateCache.put("templates/textOnly.tpl.html", "<sokratik-fragment type=\"text\" model=\"text3\" default=\"default text\"" +
            " placeholder=\"Click to edit line 3\"></sokratik-fragment>");
        $templateCache.put("templates/2textOnly.tpl.html", "<sokratik-fragment type=\"text\" model=\"text1\" default=\"default text\"" +
            " placeholder=\"Click to edit line 3\"></sokratik-fragment><sokratik-fragment type=\"text\" model=\"text2\" default=\"default text\"" +
            " placeholder=\"Click to edit line 3\"></sokratik-fragment>");


    }));
    it('Sokratik Dialogue link up Test with 1 fragment', inject(function () {
        scope.presentation = {"templateName": "textOnly", keyVals: {text3: "default text"}};
        element = compile(dialogue)(scope);
        scope.$apply();
        expect(element.children().scope().dialogueCtrl.getProperty("text3")).toBe("default text");
        expect(element.children().scope().dialogueCtrl.getFragments()[0].value).toBe("default text");
        expect(element.children().scope().dialogueCtrl.getFragments().length).toBe(1);
        expect(element.attr("class")).toBe("ng-scope ng-isolate-scope");
        expect(angular.element(element.children()[0]).attr("class")).toBe("full-height");
        expect(_.str.strip(angular.element(element.find("span")[0]).text())).toBe("default text");
    }));
    it('Sokratik fragment html Test with 1 fragment', inject(function () {
        scope.presentation = {"templateName": "textOnly", keyVals: {text3: "test text"}};
        element = compile(dialogue)(scope);
        scope.$digest();
        var dialogueElement = angular.element(angular.element(element.children()[0]).children(0));
        var fragmentElement = angular.element(dialogueElement.children()[0]);
        expect(fragmentElement.children().scope().model.css.length).toBe(1);
        expect(fragmentElement.children().scope().model.css[0]).toBe("fragment");
        expect(fragmentElement.children().scope().model.value).toBe("test text");
    }));
    it('Sokratik fragment html Test with 1 fragment initialization', inject(function () {
        scope.presentation = {"templateName": "textOnly", keyVals: {}};
        element = compile(dialogue)(scope);
        scope.$digest();
        expect(element.children().scope().dialogueCtrl.getProperty("text3")).toBeUndefined();
        expect(element.children().scope().dialogueCtrl.getFragments().length).toBe(0);
    }));
    it('Sokratik fragment html Test with 2 fragments', inject(function () {
        scope.presentation = {"templateName": "2textOnly", keyVals: {text2: "text2init"}};
        element = compile(dialogue)(scope);
        scope.$digest();
        var dialogueElement = angular.element(angular.element(element.children()[0]).children(0));
        expect(element.children().scope().dialogueCtrl.getProperty("text1")).toBeUndefined();
        expect(element.children().scope().dialogueCtrl.getProperty("text2")).toBe("text2init");
        var fragmentElement = angular.element(dialogueElement.children()[0]);
        expect(fragmentElement.children().scope().model.css[0]).toBe("fragment");
        expect(fragmentElement.children().scope().model.value).toBeUndefined();//this will maintain css sanity
        expect(element.children().scope().dialogueCtrl.getFragments().length).toBe(1);
        expect(element.children().scope().dialogueCtrl.getFragments()[0].value).toBe("text2init");//1st fragment was not included in add fragments
    }));
    it("sokratik fragment dialogue need test", inject(function () {
        scope.presentation = {"templateName": "2textOnly", keyVals: {text2: "text2init"}};
        element = compile(fragment)(scope);
        try {
            scope.$digest();
            expect(false).toBeTruthy();
        } catch (t) {
            expect(true).toBeTruthy();
        }
    }));
});
describe('minerva play mode text', function () {
    beforeEach(module('sokratik.atelier.minerva.directives'));
    var scope, compile, element;
    var dialogue = "<sokratik-dialogue presentation=\"presentation\"" +
        "increase-images=\"increaseImages\"" +
        "decrease-images=\"decreaseImages\"></sokratik-dialogue>";
    var fragment = "<sokratik-fragment type=\"text\" model=\"text1\" default=\"default text\"" +
        " placeholder=\"Click to edit line 3\"></sokratik-fragment>";
    beforeEach(inject(function ($compile, $rootScope, $state, $templateCache) {
        scope = $rootScope;
        compile = $compile;
        $state.current.data = {"mode": "play"};
        $templateCache.put("templates/textOnly.tpl.html", "<sokratik-fragment type=\"text\" model=\"text3\" default=\"default text\"" +
            " placeholder=\"Click to edit line 3\"></sokratik-fragment>");
        $templateCache.put("templates/2textOnly.tpl.html", "<sokratik-fragment type=\"text\" model=\"text1\" default=\"default text\"" +
            " placeholder=\"Click to edit line 3\"></sokratik-fragment><sokratik-fragment type=\"text\" model=\"text2\" default=\"default text\"" +
            " placeholder=\"Click to edit line 3\"></sokratik-fragment>");


    }));
    it('Sokratik Dialogue link up Test with 1 fragment', inject(function () {
        scope.presentation = {"templateName": "textOnly", keyVals: {text3: "default text"}};
        element = compile(dialogue)(scope);
        scope.$apply();
        expect(element.children().scope().dialogueCtrl.getProperty("text3")).toBe("default text");
        expect(element.children().scope().dialogueCtrl.getFragments()[0].value).toBe("default text");
        expect(element.children().scope().dialogueCtrl.getFragments().length).toBe(1);
        expect(element.attr("class")).toBe("ng-scope ng-isolate-scope");
        expect(angular.element(element.children()[0]).attr("class")).toBe("full-height");
        expect(_.str.strip(angular.element(element.find("span")[0]).text())).toBe("default text");
    }));
    it('Sokratik fragment html Test with 1 fragment', inject(function () {
        scope.presentation = {"templateName": "textOnly", keyVals: {text3: "test text"}};
        element = compile(dialogue)(scope);
        scope.$digest();
        var dialogueElement = angular.element(angular.element(element.children()[0]).children()[0]);
        var fragmentElement = angular.element(angular.element(angular.element(dialogueElement.children()[0])).children()[0]);
        expect(fragmentElement.children().scope().model.css.length).toBe(1);
        expect(fragmentElement.children().scope().model.css[0]).toBe("fragment");
        expect(fragmentElement.children().scope().model.value).toBe("test text");
    }));
    it('Sokratik fragment html Test with 1 fragment initialization', inject(function () {
        scope.presentation = {"templateName": "textOnly", keyVals: {}};
        element = compile(dialogue)(scope);
        scope.$digest();
        expect(element.children().scope().dialogueCtrl.getProperty("text3")).toBeUndefined();
        expect(element.children().scope().dialogueCtrl.getFragments().length).toBe(0);
    }));
    it('Sokratik fragment html Test with 2 fragments', inject(function () {
        scope.presentation = {"templateName": "2textOnly", keyVals: {text2: "text2init"}};
        element = compile(dialogue)(scope);
        scope.$digest();
        var dialogueElement = angular.element(angular.element(element.children()[0]).children(0));
        expect(element.children().scope().dialogueCtrl.getProperty("text1")).toBeUndefined();
        expect(element.children().scope().dialogueCtrl.getProperty("text2")).toBe("text2init");
        var fragmentElement = angular.element(angular.element(dialogueElement.children()[0]).children()[0]);
        expect(_.str.strip(angular.element(fragmentElement).text())).toBe("");
        var visibleFragment = angular.element(angular.element(dialogueElement.children()[0]).children()[1]);
        expect(_.str.strip(angular.element(visibleFragment).text())).toBe("text2init");
        expect(fragmentElement.children().scope().model.css[0]).toBe("fragment");
        expect(fragmentElement.children().scope().model.value).toBeUndefined();//this will maintain css sanity
        expect(element.children().scope().dialogueCtrl.getFragments().length).toBe(1);
        expect(element.children().scope().dialogueCtrl.getFragments()[0].value).toBe("text2init");//1st fragment was not included in add fragments
    }));
    it("sokratik fragment dialogue need test", inject(function () {
        scope.presentation = {"templateName": "2textOnly", keyVals: {text2: "text2init"}};
        element = compile(fragment)(scope);
        try {
            scope.$digest();
            expect(false).toBeTruthy();
        } catch (t) {
            expect(true).toBeTruthy();
        }
    }));
});
describe('minerva edit mode image', function () {
    beforeEach(module('sokratik.atelier.minerva.directives'));
    var scope, compile, element;
    var dialogue = "<sokratik-dialogue presentation=\"presentation\"" +
        "increase-images=\"increaseImages\"" +
        "decrease-images=\"decreaseImages\"></sokratik-dialogue>";
    var fragment = "<sokratik-fragment type=\"image\" caption=\"\" model=\"image1\" default=\"http://pureviewclub.com/wp-content/uploads/2013/02/Sunlit-leaves-640-x-360.jpg\"" +
        " caption=\"leaves\">" +
        "</sokratik-fragment>";
    var defaultImage = "http://misguidedchildren.com/wp-content/uploads/2013/10/branded%252Beducate%252B102.jpg";

    beforeEach(inject(function ($compile, $rootScope, $state, $templateCache) {
        scope = $rootScope;
        compile = $compile;
        $state.current.data = {"mode": "edit"};
        $templateCache.put("templates/1Image.tpl.html", fragment);
        $templateCache.put("templates/2Image.tpl.html", "<sokratik-fragment type=\"image\" caption=\"\" model=\"image1\" " +
            "default=\"http://blog.latterdaylearning.org/wp-content/uploads/2013/04/importance_of_education_1.jpg\"" +
            " caption=\"leaves\">" +
            "</sokratik-fragment>" +
            "<sokratik-fragment type=\"image\" caption=\"\" model=\"image2\" " +
            "default=\"http://blog.latterdaylearning.org/wp-content/uploads/2013/04/importance_of_education_1.jpg\"" +
            " caption=\"leaves\">" +
            "</sokratik-fragment>");


    }));

    it('Sokratik Dialogue link up Test with 1 fragment', inject(function () {
        scope.presentation = {"templateName": "1Image", keyVals: {image1: defaultImage}};
        element = compile(dialogue)(scope);
        scope.$digest();
        expect(element.children().scope().dialogueCtrl.getProperty("image1")).toBe(defaultImage);
        expect(element.children().scope().dialogueCtrl.getFragments()[0].value).toBe(defaultImage);
        expect(element.children().scope().dialogueCtrl.getFragments().length).toBe(1);
        expect(element.attr("class")).toBe("ng-scope ng-isolate-scope");
        expect(angular.element(element.children()[0]).attr("class")).toBe("full-height");
        var images = element.find("img");
        expect(angular.element(images[0]).attr("ng-click")).toBe("addImage()");
        expect(angular.element(images[1]).attr("ng-src")).toBe(defaultImage);
        expect(_.str.strip(angular.element(angular.element(element.find("div")[0]).find("div")[2]).text())).toBe("");
    }));

    it('Sokratik Dialogue link up Test with 1 fragment and caption', inject(function () {
        scope.presentation = {"templateName": "1Image", keyVals: {image1: defaultImage, image1_Caption: "caption"}};
        element = compile(dialogue)(scope);
        scope.$digest();
        expect(element.children().scope().dialogueCtrl.getProperty("image1")).toBe(defaultImage);
        expect(element.children().scope().dialogueCtrl.getFragments()[0].value).toBe(defaultImage);
        expect(element.children().scope().dialogueCtrl.getFragments().length).toBe(1);
        expect(element.attr("class")).toBe("ng-scope ng-isolate-scope");
        expect(angular.element(element.children()[0]).attr("class")).toBe("full-height");
        var images = element.find("img");
        expect(images.length).toBe(2);
        expect(angular.element(images[0]).attr("ng-click")).toBe("addImage()");
        expect(angular.element(images[1]).attr("ng-src")).toBe(defaultImage);
        expect(_.str.strip(angular.element(angular.element(element.find("div")[0]).find("div")[2]).text())).toBe("caption");
    }));

    it('Sokratik image fragment html Test with 1 fragment initialization', inject(function () {
        scope.presentation = {"templateName": "1Image", keyVals: {}};
        element = compile(dialogue)(scope);
        scope.$digest();
        var dialogueElement = angular.element(angular.element(element.children()[0]).children(0));
        expect(element.children().scope().dialogueCtrl.getProperty("image1")).toBeUndefined();
        var fragmentElement = angular.element(dialogueElement.children()[0]);
        expect(fragmentElement.children().scope().model.css[0]).toBe("fragment");
        expect(fragmentElement.children().scope().model.value).toBe("http://pureviewclub.com/wp-content/uploads/2013/02/Sunlit-leaves-640-x-360.jpg");
        expect(element.children().scope().dialogueCtrl.getFragments().length).toBe(0);
    }));
    it("sokratik image modal test", inject(function ($stateParams, $httpBackend) {
        scope.presentation = {"templateName": "1Image", keyVals: {}};
        $httpBackend.when('GET', '/related-images/testId').respond([
            {url: defaultImage, thumbnail: defaultImage}
        ]);
        element = compile(dialogue)(scope);
        $stateParams.questionId = "testId";
        scope.$digest();
        var dialogueElement = angular.element(angular.element(element.children()[0]).children(0));
        expect(element.children().scope().dialogueCtrl.getProperty("image1")).toBeUndefined();
        var fragmentElement = angular.element(dialogueElement.children()[0]);
        var modal = fragmentElement.children().scope().addImage();
        $httpBackend.flush();
        modal.close({selectedImage: defaultImage, selectedCaption: "new caption"});
        scope.$digest();
        expect(element.children().scope().dialogueCtrl.getProperty("image1")).toBe(defaultImage);
        expect(_.str.strip(angular.element(angular.element(element.find("div")[0]).find("div")[2]).text())).toBe("new caption");
    }));
    it("sokratik image modal internal", inject(function ($stateParams, $httpBackend,$document) {
        scope.presentation = {"templateName": "1Image", keyVals: {}};
        $httpBackend.when('GET', '/related-images/testId').respond([
            {url: defaultImage, thumbnail: defaultImage}
        ]);
        element = compile(dialogue)(scope);
        $stateParams.questionId = "testId";
        scope.$digest();
        var dialogueElement = angular.element(angular.element(element.children()[0]).children(0));
        expect(element.children().scope().dialogueCtrl.getProperty("image1")).toBeUndefined();
        var fragmentElement = angular.element(dialogueElement.children()[0]);
        fragmentElement.children().scope().addImage();
        $httpBackend.flush();
        var modal = angular.element($document.find("body")[0]);
        scope.$$childTail.selected.caption="new caption";

        angular.element(modal.find("button")[1]).triggerHandler("click");
        expect(element.children().scope().dialogueCtrl.getProperty("image1")).toBe(defaultImage);
        expect(_.str.strip(angular.element(angular.element(element.find("div")[0]).find("div")[2]).text())).toBe("new caption");
    }));
    it("sokratik image modal internal npe check", inject(function ($stateParams, $httpBackend,$document) {
        scope.presentation = {"templateName": "1Image", keyVals: {}};
        $httpBackend.when('GET', '/related-images/testId').respond(null);
        element = compile(dialogue)(scope);
        $stateParams.questionId = "testId";
        scope.$digest();
        var dialogueElement = angular.element(angular.element(element.children()[0]).children(0));
        expect(element.children().scope().dialogueCtrl.getProperty("image1")).toBeUndefined();
        var fragmentElement = angular.element(dialogueElement.children()[0]);
        fragmentElement.children().scope().addImage();
        $httpBackend.flush();
        var modal = angular.element($document.find("body")[0]);
        scope.$$childTail.selected.caption="new caption";

        angular.element(modal.find("button")[1]).triggerHandler("click");
        expect(element.children().scope().dialogueCtrl.getProperty("image1")).toBeUndefined();
        expect(_.str.strip(angular.element(angular.element(element.find("div")[0]).find("div")[2]).text())).toBe("new caption");
    }));
    it("sokratik image modal internal npe check for an array of null", inject(function ($stateParams, $httpBackend,$document) {
        scope.presentation = {"templateName": "1Image", keyVals: {}};
        $httpBackend.when('GET', '/related-images/testId').respond([null]);
        element = compile(dialogue)(scope);
        $stateParams.questionId = "testId";
        scope.$digest();
        var dialogueElement = angular.element(angular.element(element.children()[0]).children(0));
        expect(element.children().scope().dialogueCtrl.getProperty("image1")).toBeUndefined();
        var fragmentElement = angular.element(dialogueElement.children()[0]);
        fragmentElement.children().scope().addImage();
        $httpBackend.flush();
        var modal = angular.element($document.find("body")[0]);
        scope.$$childTail.selected.caption="new caption";

        angular.element(modal.find("button")[1]).triggerHandler("click");
        expect(element.children().scope().dialogueCtrl.getProperty("image1")).toBeUndefined();
        expect(_.str.strip(angular.element(angular.element(element.find("div")[0]).find("div")[2]).text())).toBe("new caption");
    }));
    it("sokratik image modal external", inject(function ($stateParams, $httpBackend,$document) {
        scope.presentation = {"templateName": "1Image", keyVals: {}};
        $httpBackend.when('GET', '/related-images/testId').respond([
            {url: defaultImage, thumbnail: defaultImage}
        ]);
        element = compile(dialogue)(scope);
        $stateParams.questionId = "testId";
        scope.$digest();
        var dialogueElement = angular.element(angular.element(element.children()[0]).children(0));
        expect(element.children().scope().dialogueCtrl.getProperty("image1")).toBeUndefined();
        var fragmentElement = angular.element(dialogueElement.children()[0]);
        fragmentElement.children().scope().addImage();
        $httpBackend.flush();
        var modal = angular.element($document.find("body")[0]);
        scope.$$childTail.selected.caption="new caption";
        var newImage = "http://www.ineesite.org/uploads/images/pages/EDUCATION_FIRSTgirlShadow2.jpg";
        expect(scope.$$childTail.selected.image).toBe(defaultImage);
        scope.$$childTail.selected.image=newImage;
        angular.element(modal.find("button")[1]).triggerHandler("click");
        scope.$digest();
        expect(element.children().scope().dialogueCtrl.getProperty("image1")).not.toBe(defaultImage);
        expect(element.children().scope().dialogueCtrl.getProperty("image1")).toBe(newImage);


        expect(_.str.strip(angular.element(angular.element(element.find("div")[0]).find("div")[2]).text())).toBe("new caption");
    }));
    it('Sokratik fragment html Test with 2 fragments skip Fragments test', inject(function () {
        scope.presentation = {"templateName": "2Image", keyVals: {image2: defaultImage,
            image2_Caption: "caption"
        }};
        element = compile(dialogue)(scope);
        scope.$digest();
        var dialogueElement = angular.element(angular.element(element.children()[0]).children(0));
        expect(element.children().scope().dialogueCtrl.getProperty("image1")).toBeUndefined();
        expect(element.children().scope().dialogueCtrl.getProperty("image2")).toBe(defaultImage);
        var fragmentElement = angular.element(dialogueElement.children()[0]);
        expect(fragmentElement.children().scope().model.css[0]).toBe("fragment");
        expect(fragmentElement.children().scope().model.value).toBe("http://blog.latterdaylearning.org/wp-content/uploads/2013/04/importance_of_education_1.jpg");
        expect(element.children().scope().dialogueCtrl.getFragments().length).toBe(1);
        expect(element.children().scope().dialogueCtrl.getFragments()[0].value).toBe(defaultImage);//1st fragment was not included in add fragments
    }));
    it('Sokratik fragment html Test with 2 fragments override test', inject(function () {
        scope.presentation = {"templateName": "2Image", keyVals: {image2: defaultImage,
            image2_Caption: "caption"
        }};
        element = compile(dialogue)(scope);
        scope.$digest();
        var dialogueElement = angular.element(angular.element(element.children()[0]).children(0));
        expect(element.children().scope().dialogueCtrl.getProperty("image1")).toBeUndefined();
        expect(element.children().scope().dialogueCtrl.getProperty("image2")).toBe(defaultImage);
        var fragmentElement = angular.element(dialogueElement.children()[0]);
        expect(fragmentElement.children().scope().model.css[0]).toBe("fragment");
        expect(fragmentElement.children().scope().model.value).toBe("http://blog.latterdaylearning.org/wp-content/uploads/2013/04/importance_of_education_1.jpg");
        expect(element.children().scope().dialogueCtrl.getFragments().length).toBe(1);
        expect(element.children().scope().dialogueCtrl.getFragments()[0].value).toBe(defaultImage);//1st fragment was not included in add fragments
        var secondImage = angular.element(dialogueElement.children()[1]);
        expect(secondImage.children().scope().model.value).toBe(defaultImage);
    }));
    it("sokratik fragment dialogue need test", inject(function () {
        scope.presentation = {"templateName": "1Image", keyVals: {text2: "text2init"}};
        element = compile(fragment)(scope);
        try {
            scope.$digest();
            expect(false).toBeTruthy();
        } catch (t) {
            expect(true).toBeTruthy();
        }
    }));
});
describe('minerva record mode image', function () {
    beforeEach(module('sokratik.atelier.minerva.directives'));
    var scope, compile, element;
    var dialogue = "<sokratik-dialogue presentation=\"presentation\"" +
        "increase-images=\"increaseImages\"" +
        "decrease-images=\"decreaseImages\"></sokratik-dialogue>";
    var fragment = "<sokratik-fragment type=\"image\" caption=\"\" model=\"image1\" default=\"http://pureviewclub.com/wp-content/uploads/2013/02/Sunlit-leaves-640-x-360.jpg\"" +
        " caption=\"leaves\">" +
        "</sokratik-fragment>";
    var defaultImage = "http://misguidedchildren.com/wp-content/uploads/2013/10/branded%252Beducate%252B102.jpg";

    beforeEach(inject(function ($compile, $rootScope, $state, $templateCache) {
        scope = $rootScope;
        compile = $compile;
        $state.current.data = {"mode": "record"};
        $templateCache.put("templates/1Image.tpl.html", fragment);
        $templateCache.put("templates/2Image.tpl.html", "<sokratik-fragment type=\"image\" caption=\"\" model=\"image1\" " +
            "default=\"http://blog.latterdaylearning.org/wp-content/uploads/2013/04/importance_of_education_1.jpg\"" +
            " caption=\"leaves\">" +
            "</sokratik-fragment>" +
            "<sokratik-fragment type=\"image\" caption=\"\" model=\"image2\" " +
            "default=\"http://blog.latterdaylearning.org/wp-content/uploads/2013/04/importance_of_education_1.jpg\"" +
            " caption=\"leaves\">" +
            "</sokratik-fragment>");
    }));

    it('Sokratik Dialogue link up Test with 1 fragment', inject(function () {
        scope.presentation = {"templateName": "1Image", keyVals: {image1: defaultImage}};
        element = compile(dialogue)(scope);
        scope.$digest();
        expect(element.children().scope().dialogueCtrl.getProperty("image1")).toBe(defaultImage);
        expect(element.children().scope().dialogueCtrl.getFragments()[0].value).toBe(defaultImage);
        expect(element.children().scope().dialogueCtrl.getFragments().length).toBe(1);
        expect(element.attr("class")).toBe("ng-scope ng-isolate-scope");
        expect(angular.element(element.children()[0]).attr("class")).toBe("full-height");
        var images = element.find("img");
        expect(images.length).toBe(1);
        expect(angular.element(images[0]).attr("ng-src")).toBe(defaultImage);
        expect(_.str.strip(angular.element(angular.element(element.find("div")[0]).find("div")[2]).text())).toBe("");
    }));

    it('Sokratik Dialogue link up Test with 1 fragment and caption', inject(function () {
        scope.presentation = {"templateName": "1Image", keyVals: {image1: defaultImage, image1_Caption: "caption"}};
        element = compile(dialogue)(scope);
        scope.$digest();
        expect(element.children().scope().dialogueCtrl.getProperty("image1")).toBe(defaultImage);
        expect(element.children().scope().dialogueCtrl.getFragments()[0].value).toBe(defaultImage);
        expect(element.children().scope().dialogueCtrl.getFragments().length).toBe(1);
        expect(element.attr("class")).toBe("ng-scope ng-isolate-scope");
        expect(angular.element(element.children()[0]).attr("class")).toBe("full-height");
        var images = element.find("img");
        expect(images.length).toBe(1);
        expect(angular.element(images[0]).attr("ng-click")).toBeUndefined();
        expect(angular.element(images[0]).attr("ng-src")).toBe(defaultImage);
        expect(_.str.strip(angular.element(angular.element(element.find("div")[0]).find("div")[2]).text())).toBe("caption");
    }));

    it('Sokratik image fragment html Test with 1 fragment initialization', inject(function () {
        scope.presentation = {"templateName": "1Image", keyVals: {}};
        element = compile(dialogue)(scope);
        scope.$digest();
        var dialogueElement = angular.element(angular.element(element.children()[0]).children(0));
        expect(element.children().scope().dialogueCtrl.getProperty("image1")).toBeUndefined();
        var fragmentElement = angular.element(dialogueElement.children()[0]);
        expect(fragmentElement.children().scope().model.css[0]).toBe("fragment");
        expect(fragmentElement.children().scope().model.value).toBeUndefined();
        expect(element.children().scope().dialogueCtrl.getFragments().length).toBe(0);
    }));
    it('Sokratik fragment html Test with 2 fragments skip Fragments test', inject(function () {
        scope.presentation = {"templateName": "2Image", keyVals: {image2: defaultImage,
            image2_Caption: "caption"
        }};
        element = compile(dialogue)(scope);
        scope.$digest();
        var dialogueElement = angular.element(angular.element(element.children()[0]).children(0));
        expect(element.children().scope().dialogueCtrl.getProperty("image1")).toBeUndefined();
        expect(element.children().scope().dialogueCtrl.getProperty("image2")).toBe(defaultImage);
        var fragmentElement = angular.element(dialogueElement.children()[0]);
        expect(fragmentElement.children().scope().model.css[0]).toBe("fragment");
        expect(fragmentElement.children().scope().model.value).toBeUndefined();
        var visibleFragment = angular.element(dialogueElement.children()[1]);
        expect(visibleFragment.children().scope().model.css[0]).toBe("fragment");
        expect(visibleFragment.children().scope().model.value).toBe(defaultImage);
        expect(element.children().scope().dialogueCtrl.getFragments().length).toBe(1);
        expect(element.children().scope().dialogueCtrl.getFragments()[0].value).toBe(defaultImage);//1st fragment was not included in add fragments
    }));
    it("sokratik fragment dialogue need test", inject(function () {
        scope.presentation = {"templateName": "1Image", keyVals: {text2: "text2init"}};
        element = compile(fragment)(scope);
        try {
            scope.$digest();
            expect(false).toBeTruthy();
        } catch (t) {
            expect(true).toBeTruthy();
        }
    }));
});
describe('minerva play mode image', function () {
    beforeEach(module('sokratik.atelier.minerva.directives'));
    var scope, compile, element;
    var dialogue = "<sokratik-dialogue presentation=\"presentation\"" +
        "increase-images=\"increaseImages\"" +
        "decrease-images=\"decreaseImages\"></sokratik-dialogue>";
    var fragment = "<sokratik-fragment type=\"image\" caption=\"\" model=\"image1\" default=\"http://pureviewclub.com/wp-content/uploads/2013/02/Sunlit-leaves-640-x-360.jpg\"" +
        " caption=\"leaves\">" +
        "</sokratik-fragment>";
    var defaultImage = "http://misguidedchildren.com/wp-content/uploads/2013/10/branded%252Beducate%252B102.jpg";

    beforeEach(inject(function ($compile, $rootScope, $state, $templateCache) {
        scope = $rootScope;
        compile = $compile;
        $state.current.data = {"mode": "play"};
        $templateCache.put("templates/1Image.tpl.html", fragment);
        $templateCache.put("templates/2Image.tpl.html", "<sokratik-fragment type=\"image\" caption=\"\" model=\"image1\" " +
            "default=\"http://blog.latterdaylearning.org/wp-content/uploads/2013/04/importance_of_education_1.jpg\"" +
            " caption=\"leaves\">" +
            "</sokratik-fragment>" +
            "<sokratik-fragment type=\"image\" caption=\"\" model=\"image2\" " +
            "default=\"http://blog.latterdaylearning.org/wp-content/uploads/2013/04/importance_of_education_1.jpg\"" +
            " caption=\"leaves\">" +
            "</sokratik-fragment>");


    }));

    it('Sokratik Dialogue link up Test with 1 fragment', inject(function () {
        scope.presentation = {"templateName": "1Image", keyVals: {image1: defaultImage}};
        element = compile(dialogue)(scope);
        scope.$digest();
        expect(element.children().scope().dialogueCtrl.getProperty("image1")).toBe(defaultImage);
        expect(element.children().scope().dialogueCtrl.getFragments()[0].value).toBe(defaultImage);
        expect(element.children().scope().dialogueCtrl.getFragments().length).toBe(1);
        expect(element.attr("class")).toBe("ng-scope ng-isolate-scope");
        expect(angular.element(element.children()[0]).attr("class")).toBe("full-height");
        var images = element.find("img");
        expect(images.length).toBe(1);
        expect(angular.element(images[0]).attr("ng-src")).toBe(defaultImage);
        expect(_.str.strip(angular.element(angular.element(element.find("div")[0]).find("div")[2]).text())).toBe("");
    }));

    it('Sokratik Dialogue link up Test with 1 fragment and caption', inject(function () {
        scope.presentation = {"templateName": "1Image", keyVals: {image1: defaultImage, image1_Caption: "caption"}};
        element = compile(dialogue)(scope);
        scope.$digest();
        expect(element.children().scope().dialogueCtrl.getProperty("image1")).toBe(defaultImage);
        expect(element.children().scope().dialogueCtrl.getFragments()[0].value).toBe(defaultImage);
        expect(element.children().scope().dialogueCtrl.getFragments().length).toBe(1);
        expect(element.attr("class")).toBe("ng-scope ng-isolate-scope");
        expect(angular.element(element.children()[0]).attr("class")).toBe("full-height");
        var images = element.find("img");
        expect(images.length).toBe(1);
        expect(angular.element(images[0]).attr("ng-click")).toBeUndefined();
        expect(angular.element(images[0]).attr("ng-src")).toBe(defaultImage);
        expect(_.str.strip(angular.element(angular.element(element.find("div")[0]).find("div")[2]).text())).toBe("caption");
    }));

    it('Sokratik image fragment html Test with 1 fragment initialization', inject(function () {
        scope.presentation = {"templateName": "1Image", keyVals: {}};
        element = compile(dialogue)(scope);
        scope.$digest();
        var dialogueElement = angular.element(angular.element(angular.element(element.children()[0]).children()[0]).children()[0]);
        expect(element.children().scope().dialogueCtrl.getProperty("image1")).toBeUndefined();
        var fragmentElement = angular.element(dialogueElement.children()[0]);
        expect(fragmentElement.children().scope().model.css[0]).toBe("fragment");
        expect(fragmentElement.children().scope().model.value).toBeUndefined();
        expect(element.children().scope().dialogueCtrl.getFragments().length).toBe(0);
    }));
    it('Sokratik fragment html Test with 2 fragments skip Fragments test', inject(function () {
        scope.presentation = {"templateName": "2Image", keyVals: {image2: defaultImage,
            image2_Caption: "caption"
        }};
        element = compile(dialogue)(scope);
        scope.$digest();
        var dialogueElement = angular.element(angular.element(angular.element(element.children()[0]).children()[0]).children()[0]);
        expect(element.children().scope().dialogueCtrl.getProperty("image1")).toBeUndefined();
        expect(element.children().scope().dialogueCtrl.getProperty("image2")).toBe(defaultImage);
        var fragmentElement = angular.element(dialogueElement.children()[0]);
        expect(fragmentElement.children().scope().model.css[0]).toBe("fragment");
        expect(fragmentElement.children().scope().model.value).toBeUndefined();
        var visibleFragment = angular.element(dialogueElement.children()[1]);
        expect(visibleFragment.children().scope().model.css[0]).toBe("fragment");
        expect(visibleFragment.children().scope().model.value).toBe(defaultImage);
        expect(element.children().scope().dialogueCtrl.getFragments().length).toBe(1);
        expect(element.children().scope().dialogueCtrl.getFragments()[0].value).toBe(defaultImage);//1st fragment was not included in add fragments
    }));
    it("sokratik fragment dialogue need test", inject(function () {
        scope.presentation = {"templateName": "1Image", keyVals: {text2: "text2init"}};
        element = compile(fragment)(scope);
        try {
            scope.$digest();
            expect(false).toBeTruthy();
        } catch (t) {
            expect(true).toBeTruthy();
        }
    }));
});


