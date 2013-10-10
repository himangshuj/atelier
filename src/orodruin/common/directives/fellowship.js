/**
 * This file contains common directives to control the fragments
 */



var sokratikFragmentDirective = function ($http, $compile, anduril, $stateParams, $state) {
    var sokratikTextEditor =
        function (scope, element, attrs) {
            if (attrs.type == "text") {
                new MediumEditor(element);
            }

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });

            // Write data to the model
            function read() {
                var html = angular.element(element).children().html();
                anduril.put($stateParams.presentationId, $stateParams.page , attrs.model, html);
            }

        };
    return {
        restrict: "EA",
        template: '<span ng-transclude></span>',
        scope: false,
        replace: false,
        transclude: true,
        compile: function (tElement, tAttr) {
            tElement.html("<span ng-bind-html = \"" + tAttr.model + "\"></span>");
            if ($state.current.data.mode == "edit") {
                return    sokratikTextEditor;
            } else {
                return {};
            }
        },
        controller: function ($scope, $compile, anduril, $element, $attrs) {
            var jsonValue = anduril.getVar($stateParams.presentationId, $stateParams.page , $attrs.model, "Please Edit <i>me</i>... DEFAULT TEXT");
            $scope[$attrs.model] = jsonValue;
            $compile($element.contents())($scope);
            anduril.put($stateParams.presentationId, $stateParams.page , $attrs.model, jsonValue);

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


var sokratikMediaDirective = function ($log, $compile, $modal, anduril, $stateParams, $state, $sce) {
        var editCompile = function (tAttrs, tElement) {
            var media = mediaMap[tAttrs.type];
            var variableName = tAttrs.model;
            var imgPreFix = tAttrs.type == "YT" ? "//img.youtube.com/vi/" : "";
            var imgPostFix = tAttrs.type == "YT" ? "/0.jpg" : "";
            var html = "<img ng-src= \"" + imgPreFix + "{{" + variableName + "}}" + imgPostFix + "\" tooltip=\"Click to change" + media + "\"/>";
            tElement.html(html);
        };

        var playCompile = function (tAttrs, tElement) {
            var html = {"YT": "<iframe id=\"player\" type=\"text/html\" width=\"{{width}}\" height=\"{{height}}\" ng-src=\"{{video}}\"frameborder=\"0\"></iframe>",
                "IMG": "<img ng-src= \"{{image}}\"/>"
            };
            tElement.html(html[angular.uppercase(tAttrs.type)]);
        };

        var editMedia = function (scope, element, attrs) {
            var currentSource = extractSource(attrs);
            scope[attrs.model] = currentSource;
            anduril.put($stateParams.presentationId, $stateParams.page , attrs.model, currentSource);

            scope.open = function () {

                var modalInstance = $modal.open({
                    templateUrl: 'edit/media.tpl.html',
                    controller: ModalInstanceCtrl,
                    resolve: {
                        selectedMedia: function () {
                            return scope[attrs.model];
                        },
                        mediaType: function () {
                            return attrs.type;
                        }
                    }
                });

                modalInstance.result.then(function (selectedItem) {
                    anduril.put($stateParams.presentationId, $stateParams.page , attrs.model, selectedItem);
                    scope[attrs.model] = selectedItem;
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            };


        };
        var extractSource = function (attrs) {
            var variableName = attrs.model;
            var currentSource = anduril.getVar($stateParams.presentationId, $stateParams.page , variableName, defaultMedia[angular.uppercase(attrs.type)]);
            return currentSource;
        };
        var playMedia = function (scope, element, attrs) {
            var currentSource = extractSource(attrs);
            scope[attrs.model] = currentSource;
            if (attrs.type == "YT") {
                scope.video = $sce.trustAsResourceUrl("//www.youtube.com/embed/" + currentSource + "?enablejsapi=1");
            } else {
                scope.image = currentSource;
            }
            scope.width = 640;

            scope.height = 390;
        };

        var defaultMedia = {"IMG": "//static.guim.co.uk/sys-images/Guardian/Pix/pictures/2012/9/12/1347450703368/Socrates-001.jpg",
            "YT": "z9JCpMCQ5qM"};
        return {
            restrict: "EA",
            template: '',
            scope: true,
            transclude: true,
            compile: function compile(tElement, tAttrs) {
                if ($state.current.data.mode == "edit") {
                    editCompile(tAttrs, tElement);
                    return editMedia;
                } else {
                    playCompile(tAttrs, tElement);
                    return playMedia;
                }
            },
            controller: function ($scope, $element) {
                $compile($element.contents())($scope);
            }
        };
    };

var sokratikDialogueContainerDirective = function () {
    return {
        restrict: "E",
        template: '<div ng-class=\"presentation.css\"></div><div ng-include=\"templateName\"/>',
        scope: {
            presentation: "="
        },

        controller: function ($scope,$compile,$element) {
            $scope.templateName="static/templates/"+$scope.presentation.templateName+".html";
            $compile($element.contents())($scope);
        }


    };

};

angular.module("orodruin.directives.glamdring", ['ngCookies', 'orodruin.services.istari'])
    .directive("sokratikFragment", sokratikFragmentDirective)
    .directive("sokratikDialogue", sokratikDialogueContainerDirective)
    .directive("sokratikMedia", sokratikMediaDirective);