/**
 * This file contains common directives to control the fragments
 */
var fragmentContainerDirective = function () {
    return {
        restrict: 'E',
        transclude: true,
        scope: {},
        template: '<div class="tab-content" ng-transclude></div>',
        controller: function ($scope, $element, $cookieStore) {
            var fragments = $scope.fragments = {};


            this.putFragments = function (fragmentName, fragmentContent) {
                fragments[fragmentName] = fragmentContent;
                $cookieStore.put('fragments', fragments);
                console.log($cookieStore.get("fragments"));
            };
        }
    };
};
var sokratikFragmentDirective = function () {
    return {
        restrict: "EA",
        require: "^fragmentContainer",
        template: '<span ng-mouseleave="saveThis()"><ng-include src="includeFile"/></span>',
        scope: true,
        replace: true,
        link: function (scope, element, attrs, fragmentContainerCtrl) {
            scope.includeFile = "static/templates/" + attrs.fragment;
            if (attrs.text) {
                new MediumEditor(element);
            }
            scope.saveThis = function () {
                fragmentContainerCtrl.putFragments(attrs.sokratikFragment, element.text());
            };

        }
    };
};

angular.module("orodruin.edit.directives", ['ngCookies'])
    .directive("sokratikFragment", sokratikFragmentDirective)
    .directive("fragmentContainer", fragmentContainerDirective);