// Karma configuration
// Generated on Mon Jun 29 2015 11:25:46 GMT-0500 (CDT)

module.exports = function(config) {
	config.set({

		// base path that will be used to resolve all patterns (eg. files,
		// exclude)
		basePath : '',

		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks : [ 'jasmine', 'browserify' ],

		files : [ 'node_modules/angular/angular.js',
				'bower_components/angular-mocks/angular-mocks.js',
				'bower_components/angular-resource/angular-resource.js',
				'bower_components/jquery/dist/jquery.js',
				'client/bundle.js',
				'tests/unit/mock/Mock*.js',
				'tests/unit/components/*-spec.js'],

		// list of files to exclude
		exclude : [],

		// preprocess matching files before serving them to the browser
		// available preprocessors:
		// https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
		      // source files, that you wanna generate coverage for
		      // do not include tests or libraries
		      // (these files will be instrumented by Istanbul)
		      'client/bundle.js': ['coverage'],
	          'tests/unit/components/*.js': ['browserify'],
	          'tests/unit/mock/*.js': ['browserify']
		    },

		    // test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters : ['dots', 'junit', 'coverage'],
		
		junitReporter : {
			outputDir: '',
			outputFile: 'test-results.xml',
			suite: '' // suite will become the package name attribute in xml testsuite element
		},

		coverageReporter: {
		      // specify a common output directory
		      dir: 'coverage/',
		      reporters: [
		        // reporters not supporting the `file` property
		        { type: 'html', subdir: 'report-html' },
		        { type: 'lcov', subdir: 'report-lcov' },
		        // reporters supporting the `file` property, use `subdir` to directly
		        // output them in the `dir` directory
		        { type: 'cobertura', subdir: '.', file: 'cobertura.txt' },
		        { type: 'lcovonly', subdir: '.', file: 'report-lcovonly.txt' },
		        { type: 'teamcity', subdir: '.', file: 'teamcity.txt' },
		        { type: 'text', subdir: '.', file: 'text.txt' },
		        { type: 'text-summary', subdir: '.', file: 'text-summary.txt' },
		      ]
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
