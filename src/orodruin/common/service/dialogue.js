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
         * @param title the title of the target presentation dialogue
         * @param classToAdd the class to add
         * @param classToRemove the class to remove from all other elements
         * @private
         * @return {Array} the modified presentation
         */
        var _changeSingleDialogue = function (presentationDialogues, title, classToAdd, classToRemove) {
            console.log("Title is" + title);
            console.log(presentationDialogues);
            return _.map(presentationDialogues, function (presentationDialog) {
                presentationDialog.css = _.without(presentationDialog.css, classToAdd, classToRemove);
                console.log(presentationDialog.title) ;
                if (presentationDialog.title == title) {
                    console.log("here");
                    presentationDialog.css = _.union(presentationDialog.css, [classToAdd]);
                }

            });
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
            return _.chain(fragment.css)
                .without(classToRemove)
                .union(classToAdd)
                .value();
        };

        this.$get = function () {
            return {
                zoom: function (context) {
                    console.log("zoom");
                    return _changeSingleDialogue(context.dialogues, context.title, "zoom-in", "zoom-out");
                },
                showAllDialogues: function (context) {
                    console.log("context.dialogues");
                    return _changeAllDialogues(context.dialogues, "zoom-out", "zoom-in");
                },
                nextFragment: function (context) {
                    console.log("nextFragment");
                    console.log(context);
                    console.log(context.index);
                    return _changeFragmentClass(context.fragments[context.index], "visible", "");
                },
                prevFragment: function (context) {
                    console.log("prevFragment");

                    return _changeFragmentClass(context.fragments[context.index], "fragment", "visible");

                },
                resetFragments: function (context) {
                    console.log("resetFragments");
                    return _changeAllDialogues(context.fragments, "fragment", "");
                }
            };
        };
    };

    ng.module(app, [], function ($provide) {
        $provide.provider("dialogue", dialogueService);

    });
})(angular, "orodruin.services.dialogue");