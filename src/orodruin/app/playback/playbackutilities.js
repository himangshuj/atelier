/**
 * This is the utility belt for playback app. This file contains functional code which performs specific tasks
 * for playing back. Overriding concern here is to ensure minimum dom manipulation, angular js will have a lot of watchers
 * which may trigger dom actions. This will be very heavy. hence before changing any value . In future this will become
 * clojurescript or browserify
 */

var classController = function () {
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
        return _.map(presentationDialogues, function (presentationDialog) {
            presentationDialog.css = _.without(presentationDialog.css, classToAdd, classToRemove);
            if (presentationDialog.title == title) {
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
     * @param classToAdd
     * @param classToRemove
     * @returns {*}
     * @private
     */
    var _changeFragmentClass = function (fragment, classToAdd, classToRemove) {
        return _.chain(fragment.css)
            .without(classToRemove)
            .union(classToAdd)
            .value();
    };

    this.$get = [, function () {
        return {
            zoom: function (presentationDialogues, title) {
                return _changeSingleDialogue(presentationDialogues, title, "zoom-in", "ng-grid");
            },
            showAllDialogues: function (presentationDialogues) {
                return _changeAllDialogues(presentationDialogues, "zoom-out", "zoom-in");
            },
            nextFragment: function (fragment) {
                return _changeFragmentClass(fragment, "visible", "");
            },
            prevFragment: function (fragment) {
                return _changeFragmentClass(fragment, "fragment", "visible");

            },
            resetFragments: function (fragments) {
                return _changeAllDialogues(fragments, "fragment", "");
            }
        };
    }
    ]
    ;
};