/**
 * This file contains common directives to control the fragments
 */
var fragmentContainerDirective = function () {
    return {
        restrict: 'E',
        transclude: true,
        scope: {},
        template: '<div class="tab-content" ng-transclude></div>',
        controller: function ($scope, $element) {
            var fragments = $scope.fragments = {};


            this.putFragments = function (fragmentName, fragmentContent) {
                fragments[fragmentName] = fragmentContent;
                console.log(fragments);
            };
        }
    };
};
var sokratikFragmentDirective = function ($log) {
    return {
        restrict: "EA",
        require: "^fragmentContainer",
        template: '<div> {{title}}' +
            '<div class="title" ng-blur="saveThis()" ng-mouseleave="saveThis()" ng-include="includeFile"></div>' +
            '</div>',
        scope: true,
        compile: function compile(tElement, tAttrs) {
            //assumes medium editor is preloaded side effect to do clean up
            $log.log(tAttrs);
            if (tAttrs.text) {
                new MediumEditor(tElement);
            }

            return  function (scope, element, attrs, fragmentContainerCtrl) {
                scope.title = "title";
                scope.includeFile = "static/templates/" + attrs.fragment;
                scope.saveThis = function () {
                    fragmentContainerCtrl.putFragments(attrs.sokratikFragment, element.text());
                };
            };
        }
    };
};

angular.module("orodruin.directives", [])
    .directive("sokratikFragment", sokratikFragmentDirective)
    .directive("fragmentContainer", fragmentContainerDirective);