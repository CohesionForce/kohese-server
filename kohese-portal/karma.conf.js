// Karma configuration
// Generated on Mon Jun 29 2015 11:25:46 GMT-0500 (CDT)

module.exports = function(config) {
	config.set({

		// base path that will be used to resolve all patterns (eg. files,
		// exclude)
		basePath : '',

		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks : [ 'jasmine' ],

		files : [ 'node_modules/angular/angular.js',
				'bower_components/angular-mocks/angular-mocks.js',
				'bower_components/angular-resource/angular-resource.js',
				'bower_components/jquery/dist/jquery.js',
				'client/bundle.js',
				'tests/unit/components/login-spec.js'],

		// list of files to exclude
		exclude : [],

		// preprocess matching files before serving them to the browser
		// available preprocessors:
		// https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors : {},

		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters : ['dots', 'junit'],
		
		junitReporter : {
			outputDir: '',
			outputFile: 'test-results.xml',
			suite: '' // suite will become the package name attribute in xml testsuite element
		},

		// web server port
		port : 9876,

		// enable / disable colors in the output (reporters and logs)
		colors : true,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR ||
		// config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel : config.LOG_DEBUG,

		// enable / disable watching file and executing tests whenever any file
		// changes
		autoWatch : true,

		// start these browsers
		// available browser launchers:
		// https://npmjs.org/browse/keyword/karma-launcher
		browsers : [ 'PhantomJS' ],

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun : true
	})
}
