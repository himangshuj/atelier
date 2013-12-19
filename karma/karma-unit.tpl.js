module.exports = function (config) {
    config.set({
        /**
         * From where to look for files, starting with the location of this file.
         */
        basePath: '../',

        /**
         * This is the list of file patterns to load into the browser during testing.
         */
        files: [
            <% scripts.forEach( function ( file ) { %>'<%= file %>',
                <% }); %>
            'src/testingmocks/acoustics.spec.js',
            'src/**/*.js',
      'src/**/*.coffee',
    ],

    frameworks: [ 'jasmine' ],
    preprocessors: {
      '**/*.coffee': 'coffee',
    },

    /**
     * How to report, by default.
     */
        reporters: ['progress'],

    /**
     * On which port should the browser connect, on which port is the test runner
     * operating, and what is the URL path for the browser to use.
     */
    port: 9018,
    runnerPort: 9100,
    urlRoot: '/',


            autoWatch: true,


            browsers: ['Chrome', 'Firefox'],

            colors: true,
                    logLevel: config.LOG_INFO,

                            singleRun: true



  });
};
