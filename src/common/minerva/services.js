/**
 * This is the utility belt for record app. This file contains functional code which performs specific tasks
 * for playing back. Overriding concern here is to ensure minimum dom manipulation, angular js will have a lot of watchers
 * which may trigger dom actions. This will be very heavy. hence before changing any value . In future this will become
 * clojurescript or browserify
 */

(function (ng, app) {
    var dialogueService = function () {

        /**
         * This function adds one class and removes one class from a set of presentationObjects
         * @param presentationDialogues
         * @param classToAdd
         * @param classToRemove
         * @returns {Array}
         */
        var _changeAllDialogues = function (presentationDialogues, classToAdd, classToRemove) {
            return _.map(presentationDialogues, function (presentationDialog) {
                presentationDialog.css = _.chain(presentationDialog.css)
                    .without(classToRemove)
                    .union([classToAdd])
                    .value();
            });
        };

        /**
         * this function defines ways to alter the css of one single element
         * @param fragment the fragment to be operated upon
         * @param classToAdd    the class to be added to the element
         * @param classToRemove  the class to be removed from the element
         * @returns {*} the modified class variable
         * @private
         */
        var _changeFragmentClass = function (fragment, classToAdd, classToRemove) {
            fragment.css = _.chain(fragment.css)
                .difference(classToRemove)
                .union(classToAdd)
                .value();
            return fragment;
        };

        this.$get = ["$state", function ($state) {
            return {
                resetFragments: function (context, deferred) {
                    var actionInitiated = new Date().getTime();
                    _.delay(function () {
                        _changeAllDialogues(context.fragments, "fragment", ["animated", "fadeIn"]);
                        deferred.resolve({"fnName": "resetFragments", "args": {}, actionInitiated: actionInitiated, module: "dialogue" });
                    });

                    return deferred.promise;
                },
                makeVisible: function (context, deferred) {
                    var actionInitiated = new Date().getTime();
                    _.delay(function () {
                        _changeFragmentClass(context.fragments[context.index], ["animated", "fadeIn"], ["fragment"]);
                        deferred.resolve({"fnName": "makeVisible", "args": {index: context.index},
                            actionInitiated: actionInitiated, module: "dialogue" });
                    });
                    return deferred.promise;
                },
                hide: function (context, deferred) {
                    var actionInitiated = new Date().getTime();
                    _.delay(function () {

                        _changeFragmentClass(context.fragments[context.index], "fragment", ["animated" , "fadeIn"]);
                        deferred.resolve({"fnName": "hide", "args": {index: context.index},
                            actionInitiated: actionInitiated, module: "dialogue"});
                    });
                    return deferred.promise;
                },
                changeState: function (context) {
                    "use strict";

                    var result = {fnName: "changeState",
                        args: {subState: context.subState, params: context.params},
                        actionInitiated: new Date().getTime(), module: "dialogue"};
                    _.defer(function () {
                        $state.go($state.current.data.mode + context.subState, context.params,{location:!!context.play});
                    });
                    return  result;
                }

            };
        }];
    };
    ng.module(app,
        ['ui.router'],
        ["$provide", function ($provide) {
        $provide.provider("dialogue", dialogueService);

    }]);
})(angular, "sokratik.atelier.minerva.services");