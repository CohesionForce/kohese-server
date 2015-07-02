// Karma configuration
// Generated on Mon Jun 29 2015 11:25:46 GMT-0500 (CDT)

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine-jquery', 'jasmine'],


        // list of files / patterns to load in the browser
        files: [
            // Core dependencies
            'client/vendor/angular/angular.js',
            'client/vendor/angular-mocks/angular-mocks.js',
            'client/vendor/angular-resource/angular-resource.js',
            'client/vendor/jquery/dist/jquery.js',
            'node_modules/jasmine-jquery/lib/jasmine-jquery.js',

            // Module Dependencies
            'client/js/common/lb-services.js',
            'client/js/item/itemRepository.js',
            "client/js/directives/resizer.js",
            "client/js/directives/navDirectives.js",
            "client/js/sb-admin-2.js",
            "client/vendor/angular-ui-router/release/angular-ui-router.js",
            "client/vendor/angular-ui-layout/ui-layout.js",
            "client/vendor/angular-bootstrap/ui-bootstrap-tpls.js",
            "client/vendor/socket.io-client/socket.io.js",
            "client/vendor/angular-socket-io/socket.js",

            //Client dependencies
            'client/js/app.js',
            "client/js/item/controllers.js",
            'client/js/item/itemRepository.js',

            //Common dependencies
            //'common/models/item.js',

            //Server dependencies
            //'server/server.js',

            //Test files
            'tests/*.js',
            'tests/controllers/*.js',
            'tests/services/*.js'
        ],


        // list of files to exclude
        exclude: [],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {},


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome', 'PhantomJS'],

        plugins: [

            'karma-phantomjs-launcher',
            'karma-chrome-launcher',
            'karma-jasmine-jquery',
            //'jasmine-node-karma',
            'karma-jasmine'

        ],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false
    })
}
