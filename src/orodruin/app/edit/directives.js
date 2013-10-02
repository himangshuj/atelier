/**
 * This file contains common directives to control the fragments
 */


var sokratikFragmentContainerDirective = function () {
    return {
        restrict: "EA",
        transclude: true,
        replace: false,
        template: "<span ng-transclude/> ",
        scope: false,
        controller: function ($scope) {
            var mediaParams = {};
            this.addVariable = function (variable, value) {
                mediaParams[variable] = value;
            };
            $scope.ok = function () {
                alert("Going ahead");
                console.log(mediaParams);
            };
        }

    };
};


/**
 *
 * @param $http
 * @param $templateCache
 * @param $anchorScroll
 * @param $compile
 * @returns {{restrict: string, require: string, template: string, scope: boolean, replace: boolean, transclude: boolean, link: Function}}
 */
var sokratikFragmentDirective = function ($http, $templateCache, $anchorScroll, $compile) {
    return {
        restrict: "EA",
        require: '^sokratikFragmentContainer',
        template: '<span ng-transclude/>',
        scope: false,
        replace: true,
        transclude: true,
        link: function (scope, element, attrs,  sokratikFragmentContainerCtrl) {
            $http.get("static/templates/" + attrs.fragment, {cache: $templateCache}).success(function (response) {
                element.html(response);
                read();
            });
            $compile(element.contents())(scope);
            if (attrs.type == "text") {
                new MediumEditor(element);
            }

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                sokratikFragmentContainerCtrl.addVariable(attrs.ngModel, html);
            }

        }

    };
};

var mediaMap = {"img": "Image", "YT": "Youtube video"};

/**
 * This function will be used to control modal used to replace image. For now it supports only links later it will take
 * care of uploads
 * @param $scope  angular dependency injection for modals scope
 * @param $modalInstance angular dependency injection
 * @param selectedMedia the current media selected
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


var sokratikMediaDirective = function ($log, $compile, $modal) {
    var imageCompile = function (tAttrs, tElement) {
        var media = mediaMap[tAttrs.type];
        var variableName = tAttrs.model;
        var imgPreFix = tAttrs.type == "YT" ? "//img.youtube.com/vi/" : "";
        var imgPostFix = tAttrs.type == "YT" ? "/0.jpg" : "";
        var html = "<img ng-src= \"" + imgPreFix + "{{" + variableName + "}}" + imgPostFix + "\" tooltip=\"Click to change" + media + "\"/>";
        tElement.html(html);
    };
    /**
     * this function reads the sokratik media directive and creates an editable youtube iframe
     * @param tAttrs
     * @param tElement
     */
    /*   var ytCompile = function (tAttrs, tElement) {
     var variableName = tAttrs.model;
     var html = "<iframe id='player' type='text/html' ng-src= \"{{" + variableName + "}}\" " +
     "tooltip=\"Click to change media\" width=\"" + (tAttrs.width ? tAttrs.width : 640) +
     "\" height=\"" + (tAttrs.height ? tAttrs.height : 390 ) + "\"/>";
     tElement.html(html);
     };*/
    return {
        restrict: "EA",
        template: '',
        require: "^sokratikFragmentContainer",
        scope: true,
        transclude: true,
        compile: function compile(tElement, tAttrs) {
            imageCompile(tAttrs, tElement);

            return function (scope, element, attrs, sokratikFragmentContainerCtrl) {
                var variableName = attrs.model;

                var currentSource = attrs.ngSrc;
                sokratikFragmentContainerCtrl.addVariable(variableName, currentSource);
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
                        sokratikFragmentContainerCtrl.addVariable(variableName, selectedItem);
                        scope[variableName] = selectedItem;
                    }, function () {
                        $log.info('Modal dismissed at: ' + new Date());
                    });
                };


            };
        }
    };
};

angular.module("orodruin.edit.directives", ['ngCookies'])
    .directive("sokratikFragmentContainer", sokratikFragmentContainerDirective)
    .directive("sokratikFragment", sokratikFragmentDirective)
    .directive("sokratikMedia", sokratikMediaDirective);