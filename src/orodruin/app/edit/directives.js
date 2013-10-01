/**
 * This file contains common directives to control the fragments
 */
var sokratikFragmentDirective = function ($http, $templateCache, $anchorScroll, $compile) {
    return {
        restrict: "EA",
        require: "?ngModel",
        template: '<span ng-transclude/>',
        scope: false,
        replace: true,
        transclude: true,
        compile: function compile(tElement, tAttrs, transclude) {
            return{
                post: function (scope, element, attrs, ngModel) {
                    $http.get("static/templates/" + attrs.fragment, {cache: $templateCache}).success(function (response) {
                        element.html(response);
                        read();
                    });
                    $compile(element.contents())(scope);
                    if (attrs.type == "text") {
                        new MediumEditor(element);
                    }
                    if (!ngModel) {
                        return;
                    } // do nothing if no ng-model

                    // Specify how UI should be updated
                    ngModel.$render = function () {
                        element.html(ngModel.$viewValue || '');
                    };

                    // Listen for change events to enable binding
                    element.on('blur keyup change', function () {
                        scope.$apply(read);
                    });
                    read(); // initialize

                    // Write data to the model
                    function read() {
                        var html = element.html();
                        ngModel.$setViewValue(html);
                    }

                }

            };
        }
    };
};

var mediaMap = {"img": "Image", "video": "Video"};

/**
 * This function will be used to control modal used to replace image. For now it supports only links later it will take
 * care of uploads
 * @param $scope  angular dependency injection for modals scope
 * @param $modalInstance angular dependency injection
 * @param selectedMedia the current media selected
 * @constructor
 */
var ModalInstanceCtrl = function ($scope, $modalInstance, selectedMedia, mediaType) {

    $scope.selectedMedia = selectedMedia;

    $scope.modalMedia = {"url": selectedMedia};

    $scope.mediaType = mediaMap[mediaType];
    $scope.ok = function () {
        $modalInstance.close($scope.modalMedia.url);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss($scope.modalMedia.url);
    };


};


var sokratikMediaDirective = function () {
    return {
        restrict: "EA",
        template: '',
        scope: false,
        replace: true,
        transclude: true,
        controller: function ($scope, $element, $attrs, $compile, $log, $modal) {
            console.log($element);
            console.log($attrs);
            var variableName = $attrs.model;

            var currentSource = $attrs.ngSrc;
            $scope[variableName] = currentSource;

            $compile($element.contents())($scope);
            $scope.open = function () {

                var modalInstance = $modal.open({
                    templateUrl: 'edit/media.tpl.html',
                    controller: ModalInstanceCtrl,
                    resolve: {
                        selectedMedia: function () {
                            return $scope[variableName];
                        },
                        mediaType: function () {
                            return $attrs.type;
                        }
                    }
                });

                modalInstance.result.then(function (selectedItem) {
                    console.log(selectedItem);
                    $scope[variableName] = selectedItem;
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            };


        },
        compile: function compile(tElement, tAttrs) {

            var media = tAttrs.type;
            var variableName = tAttrs.model;
            var html = "<" + media + " ng-src= \"{{" + variableName + "}}\" tooltip=\"Click to change media\"/>";
            tElement.html(html);

        }
        /*
         compile: f
         return {
         post: function (scope, element, attrs) {
         var currentSource = attrs.ngSrc;
         scope[variableName] = currentSource;
         scope.open = function () {
         modalInstanceFn($modal,currentSource,media,scope,variableName);
         };
         $compile(element.contents())(scope);
         }

         };
         }
         */
    };
};

angular.module("orodruin.edit.directives", ['ngCookies'])
    .directive("sokratikFragment", sokratikFragmentDirective)
    .directive("sokratikMedia", sokratikMediaDirective);