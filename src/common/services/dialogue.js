/**
 * This is the utility belt for record app. This file contains functional code which performs specific tasks
 * for playing back. Overriding concern here is to ensure minimum dom manipulation, angular js will have a lot of watchers
 * which may trigger dom actions. This will be very heavy. hence before changing any value . In future this will become
 * clojurescript or browserify
 */

(function (ng, app) {
    var dialogueService = function () {
        /**
         * This function adds a class to a targeted presentationDialogue and removes the same from all other dialogues
         * @param presentationDialogues the set of all presentation dialogues
         * @param classToAdd the class to add
         * @param classToRemove the class to remove from all other elements
         * @private
         * @return {Array} the modified presentation
         * @param index the index of the dialogue to update
         */
        var _changeSingleDialogue = function (presentationDialogues, index, classToAdd, classToRemove) {
            _.each(presentationDialogues, function (presentationDialog) {
                presentationDialog.css = _.without(presentationDialog.css, classToAdd);

            });
            presentationDialogues[index].css = _.chain(presentationDialogues[index].css)
                .union([classToAdd])
                .without(classToRemove)
                .value();
            return presentationDialogues;

        };
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
                .without(classToRemove)
                .union(classToAdd)
                .value();
            return fragment;
        };

        this.$get = function () {
            return {
                zoom: function (context, deferred) {
                    var actionInitiated = new Date().getTime();
                    _changeSingleDialogue(context.dialogues, context.page, "zoom-in", "zoom-out");
                    _.delay(function () {
                        deferred.resolve({"fnName": "zoom", "args": [
                            {"page": context.page}
                        ], delay: actionInitiated, presentationIndex: context.page });
                    });
                    return deferred.promise;

                },
                showAllDialogues: function (context, deferred) {
                    var actionInitiated = new Date().getTime();
                    _changeAllDialogues(context.dialogues, "zoom-out", "zoom-in");

                    _.delay(function () {
                        deferred.resolve({"fnName": "showAllDialogues", "args": [], delay: actionInitiated, presentationIndex: context.presentationIndex });

                    });
                    return deferred.promise;

                },
                nextFragment: function (context, deferred) {
                    var actionInitiated = new Date().getTime();
                    _changeFragmentClass(context.fragments[context.index], "visible", "");
                    _.delay(function () {
                        deferred.resolve({"fnName": "nextFragment", "args": [
                            {"index": context.index}
                        ], delay: actionInitiated, presentationIndex: context.presentationIndex});
                    });
                    return deferred.promise;
                },
                prevFragment: function (context, deferred) {
                    var actionInitiated = new Date().getTime();
                    _changeFragmentClass(context.fragments[context.index], "fragment", "visible");
                    _.delay(function () {
                        deferred.resolve({"fnName": "prevFragment", "args": [
                            {"index": context.index}
                        ], delay: actionInitiated, presentationIndex: context.presentationIndex});
                    });
                    return deferred.promise;

                },
                resetFragments: function (context, deferred) {
                    var actionInitiated = new Date().getTime();
                    _changeAllDialogues(context.fragments, "fragment", "visible");
                    _.delay(function () {
                        deferred.resolve({"fnName": "resetFragments", "args": [], delay: actionInitiated, presentationIndex: context.presentationIndex });
                    });
                    return deferred.promise;

                }
            };

        };

    };

    ng.module(app, [], ["$provide", function ($provide) {
        $provide.provider("dialogue", dialogueService);

    }]);
})(angular, "sokratik.atelier.services.dialogue");