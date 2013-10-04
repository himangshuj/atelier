/**
 * This file contains common directives to control the fragments
 */



var sokratikFragmentDirective = function ($http, $compile, anduril, $stateParams, $sce) {
    return {
        restrict: "EA",
        template: '<span ng-transclude></span>',
        scope: false,
        replace: false,
        transclude: true,
        compile: function (tElement, tAttr) {
            tElement.html("<span ng-bind-html = \"" + tAttr.model + "\"></span>");
            var jsonValue = anduril.getVar($stateParams.templateId, tAttr.model, "Please <u>Edit</u> <i>me</i>... DEFAULT TEXT") ;
            return  function (scope, element, attrs) {
                $compile(element.contents())(scope);
                if (attrs.type == "text") {
                    new MediumEditor(element);
                }
                scope[attrs.model] = jsonValue;

                // Listen for change events to enable binding
                element.on('blur keyup change', function () {
                    scope.$apply(read);
                });
                read(); // initialize

                // Write data to the model
                function read() {
                    var html = element.html();

                    anduril.put($stateParams.templateId, attrs.model, html);
                }

            };
        }

    };
};

var mediaMap = {"img": "Image", "YT": "Youtube video"};

/**
 *
 * @param $scope
 * @param $modalInstance
 * @param selectedMedia
 * @param mediaType
 * @param $sce
 * @constructor
 */
var ModalInstanceCtrl = function ($scope, $modalInstance, selectedMedia, mediaType, $sce) {

    $scope.selectedMedia = selectedMedia;

    $scope.modalMedia = {"url": selectedMedia};

    $scope.width = 640;

    $scope.height = 390;

    $scope.YT = mediaType == "YT";
    if ($scope.YT) {
        $scope.ytURL = $sce.trustAsResourceUrl("//www.youtube.com/embed/" + selectedMedia + "?enablejsapi=1");
    }


    $scope.mediaType = mediaMap[mediaType];
    $scope.ok = function () {
        $modalInstance.close($scope.modalMedia.url);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss($scope.modalMedia.url);
    };
    $scope.blur = function (selectedMedia) {
        $scope.modalMedia.url = selectedMedia;
        $scope.ytURL = $sce.trustAsResourceUrl("//www.youtube.com/embed/" + selectedMedia + "?enablejsapi=1");
    };


};


var sokratikMediaDirective = function ($log, $compile, $modal, anduril, $stateParams) {
    var imageCompile = function (tAttrs, tElement) {
        var media = mediaMap[tAttrs.type];
        var variableName = tAttrs.model;
        var imgPreFix = tAttrs.type == "YT" ? "//img.youtube.com/vi/" : "";
        var imgPostFix = tAttrs.type == "YT" ? "/0.jpg" : "";
        var html = "<img ng-src= \"" + imgPreFix + "{{" + variableName + "}}" + imgPostFix + "\" tooltip=\"Click to change" + media + "\"/>";
        tElement.html(html);
    };
    var defaultMedia = {"IMG":"//static.guim.co.uk/sys-images/Guardian/Pix/pictures/2012/9/12/1347450703368/Socrates-001.jpg",
        "YT":"z9JCpMCQ5qM"} ;
    return {
        restrict: "EA",
        template: '',
        scope: true,
        transclude: true,
        compile: function compile(tElement, tAttrs) {
            imageCompile(tAttrs, tElement);
            var variableName = tAttrs.model;
            var currentSource = anduril.getVar($stateParams.templateId, variableName,
                defaultMedia[angular.uppercase(tAttrs.type)]) ;


            return function (scope, element, attrs) {
                //noinspection JSUnresolvedVariable
                scope[variableName] = currentSource;
                $compile(element.contents())(scope);
                scope.open = function () {

                    var modalInstance = $modal.open({
                        templateUrl: 'edit/media.tpl.html',
                        controller: ModalInstanceCtrl,
                        resolve: {
                            selectedMedia: function () {
                                return scope[variableName];
                            },
                            mediaType: function () {
                                return attrs.type;
                            }
                        }
                    });

                    modalInstance.result.then(function (selectedItem) {
                        anduril.put($stateParams.templateId, variableName, selectedItem);
                        scope[variableName] = selectedItem;
                    }, function () {
                        $log.info('Modal dismissed at: ' + new Date());
                    });
                };


            };
        }
    };
};

angular.module("orodruin.edit.directives", ['ngCookies', 'orodruin.services.istari'])
    .directive("sokratikFragment", sokratikFragmentDirective)
    .directive("sokratikMedia", sokratikMediaDirective);