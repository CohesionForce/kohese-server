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
				'bower_components/',
				'client/bundle.js',
				'client/tests/unit/mock/Mock*.js',
				'client/tests/unit/components/*-spec.js',
				'client/tests/unit/services/*-spec.js',
				'client/tests/unit/mock/third-party/Mock*.js',
				"bower_components/angular-bootstrap/ui-bootstrap-tpls.js",
				"bower_components/angular-animate/angular-animate.js",
				"bower_components/socket.io-client/socket.io.js",
				"bower_components/angular-socket-io/socket.js",
				"bower_components/angular-jwt/dist/angular-jwt.js",
				"bower_components/angular-recursion/angular-recursion.js",
				"bower_components/angucomplete-alt/angucomplete-alt.js",
				"bower_components/angular-toastr/dist/angular-toastr.tpls.js",
				"bower_components/ng-context-menu/dist/ng-context-menu.js",
				"bower_components/angular-elastic/elastic.js",
				"bower_components/commonmark/dist/commonmark.js",
				"bower_components/angular-ui-tree/dist/angular-ui-tree.js",
				"bower_components/simplemde/dist/simplemde.min.js",
				"bower_components/simplemde-angular/dist/simplemde-angular.min.js",
				"bower_components/split-pane/split-pane.js",
				"bower_components/angular-split-pane/angular-split-pane.js",
				"bower_components/ng-file-upload/ng-file-upload.js"],

		// list of files to exclude
		exclude : [],

		// preprocess matching files before serving them to the browser
		// available preprocessors:
		// https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
		      // source files, that you wanna generate coverage for
		      // do not include tests or libraries
		      // (these files will be instrumented by Istanbul)
	          'client/tests/unit/components/*.js': ['browserify'],
			  'client/tests/unit/mock/*.js': ['browserify'],
			  'client/tests/unit/mock/third-party/*.js' : ['browserify'],
			  'client/tests/unit/services/*.js' : ['browserify']
			},
		
		plugins: [	'karma-browserify', 
					'karma-jasmine', 
					'karma-coverage',
					'karma-super-dots-reporter',
					'karma-junit-reporter',
					'karma-chrome-launcher',
					'karma-html-reporter'],

		    // test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters : ['super-dots', 'junit', 'coverage', 'html'],

		htmlReporter: {
			outputDir: 'karma_html', // where to put the reports  
			templatePath: null, // set if you moved jasmine_template.html 
			focusOnFailures: true, // reports show failures on start 
			namedFiles: true, // name files instead of creating sub-directories 
			pageTitle: null, // page title for reports; browser info by default 
			urlFriendlyName: true, // simply replaces spaces with _ for files/dirs 
			reportName: 'report-summary-filename', // report summary filename; browser info by default
		},
		
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
		browsers : [ 'Chrome' ],

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun : false
	})
}
