/**
 * This file/module contains all configuration for the build process.
 */
module.exports = {


    /**
     * The `build_dir` folder is where our projects are compiled during
     * development and the `compile_dir` folder is where our app resides once it's
     * completely built.
     */
    "build_dir": "dist",
    "compile_dir": "bin",

    /**
     * This is a collection of file patterns that refer to our app code (the
     * stuff in `src/`). These file paths are used in the configuration of
     * build tasks. `js` is all project javascript, less tests. `ctpl` contains
     * our reusable components' (`src/common`) template HTML files, while
     * `atpl` contains the same, but for our app's code. `html` is just our
     * main HTML file, `less` is our main stylesheet, and `unit` contains our
     * app's unit tests.
     */
    app_files: {
        js: [ 'src/**/*.js', '!src/**/*.spec.js','!src/**/app.*' ],
        jsunit: [ 'src/**/*.spec.js' ],

        coffee: [ 'src/**/*.coffee', '!src/**/*.spec.coffee' ],
        coffeeunit: [ 'src/**/*.spec.coffee' ],

        atpl: [ 'src/app/**/*.tpl.html' ],
        ctpl: [ 'src/common/**/*.tpl.html' ],

        html: [ 'src/index.html' ],
        less: 'src/less/main.less'
    },

    /**
     * This is the same as `app_files`, except it contains patterns that
     * reference vendor code (`vendor/`) that we need to place into the build
     * process somewhere. While the `app_files` property ensures all
     * standardized files are collected for compilation, it is the user's job
     * to ensure non-standardized (i.e. vendor-related) files are handled
     * appropriately in `vendor_files.js`.
     *
     * The `vendor_files.js` property holds files to be automatically
     * concatenated and minified with our project source files.
     *
     * The `vendor_files.css` property holds any CSS files to be automatically
     * included in our app.
     */
    vendor_files: {
        "js": [
            "vendor/kinetic-v4.7.4.min.js",
            "vendor/angular/angular.js",
            "vendor/angular-sanitize/angular-sanitize.min.js",
            "vendor/angular-cookies/angular-cookies.min.js",
            "vendor/angular-resource/angular-resource.min.js",
            "vendor/angular-bootstrap/ui-bootstrap-tpls.min.js",
            "vendor/angular-ui-router/release/angular-ui-router.js",
            "vendor/angular-ui-utils/modules/route/route.js",
            "vendor/angular-ui-utils/modules/validate/validate.js",
            "vendor/underscore/underscore-min.js",
            "vendor/underscore.string/dist/underscore.string.min.js",
            "vendor/angular-animate/angular-animate.min.js"
        ],
        "css": [
            "vendor/medium-editor/dist/css/medium.editor.css",
            "vendor/bootstrap/dist/css/bootstrap.min.css"
        ]
    }
};
