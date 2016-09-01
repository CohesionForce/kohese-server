var fs = require('fs');
var BowerWebpackPlugin = require("bower-webpack-plugin");
var webpack = require("webpack");

module.exports = function(grunt) {

	grunt.initConfig({

		// TODO: Expand this to speed up grunts.
		// For example, watch the clients and only do webpack if needed
		watch: {
			scripts: {
				files: [ 'common/**.js', 
				         'server/**.js',],
				         tasks: ['uglify','babel',],
			},
		},

		jshint: {
			server: {
				files: [{ src: ['server/**/*.js', 'common/**/*.js'] }],
				options: {
					esversion: 6,
					strict: 'implied',
					sub: true, // Allows for object['key'] rather than object.key
					laxbreak: true, // Allows for string + to span multiple lines
					shadow: true, // This really shouldn't be used, but variable shadowing is fairly common in the code
					'-W010': true, //This ignores the preference for object = {} instead of object = new Object()
					'-W034': true, //Removes complaints about use strict in item-proxy.js
					node: true, // Sets the node globals such as require and module
				},
			},
			web: {
				files: ['client/**/*.js'],
			},
		},

		babel: {

			dist: {
				options: {
					sourceMap: false,
					presets: ['es2015'],
				},
				files: [{
					expand: true,
					src: ['common/**/*.js', 
					      'server/**/*.js'],
					      dest: 'tmp/babel/',
					      ext: '.babel.js',
				}],
			},
		},

		uglify: {
			options: {
				mangle: true,
				compress: true, // This has more options, should check
				banner: '/* Kohese Server */',
			},
			dist: {
				files: [{ 
					cwd: 'tmp/babel/',
					expand: true,
					src: ['**/*.js'],  // source files mask
					dest: 'dist/',    // destination folder
					flatten: false,   // flatten directory structure
					ext: '.js',   // replace extension
				}],
			},
		},

		copy: {
			server: { // Copy server config json files
				files: [{expand: true, src: ['common/**/*.json', 'server/**/*.json', '*.json'], dest: 'dist/'},],
			},
			web: { // Copy files required for web site
				files: [{expand: true,
					src: ['client/index.html',
					      'client/css/**/*.css', 
					      'client/components/**/*.html',
					      'bower_components/**/*',
					      ],
					      // Should be a better solution to copying bower cmpns.
					      dest: 'dist/',
				}],
			},
		},

		webpack: { 
			dist: {
				context: 'client/',
				entry: './app.js',
				output: {
					path: 'dist/client/',
					filename: 'bundle.js',
				},
				resolve: {
					modulesDirectories: ['node_modules', 'bower_components'],
				},
				//devtool: 'source-map',
				plugins: [new BowerWebpackPlugin({
					modulesDirectories: ['bower_components'],
					manifestFiles: 'bower.json',
					includes: /.*/,
					excludes: [],
					searchResolveModulesDirectories: true
				})],
				module: {
					loaders: [
					          {test: /\.js$/, loader: 'babel', query: {compact: true}},
					          {test: /\.css$/, loader: "style-loader!css-loader"},
					          {test: /\.less$/, loader: "style!css!less"}
					          ]
				}
			}
		},
		
		// Used to preprocess the files for the PhantomJS jasmine tests
		browserify: {
			'tmp/browserify/test-spec.js' : ['tests/unit/components/*.js', 'tests/unit/mock/*.js']
		},
		
		jasmine: {
			 src: ['node_modules/angular/angular.js',
				   'bower_components/angular-mocks/angular-mocks.js',
				   'bower_components/angular-resource/angular-resource.js',
				   'bower_components/jquery/dist/jquery.js',
				   'client/bundle.js',
				   //'tests/unit/mock/Mock*.js'
				   'tmp/browserify/test-spec.js'],
		      options: {
		        specs: ['tmp/browserify/test-spec.js'],
		      }
		},
		
		run: {
			server: {
				options: {
					// Suppress showing stdout
					quiet: true,
					// Don't wait for node to exit, which it will never do
					wait: false,
					// Continue to next task when this is on stdout
					ready: /::: KoheseIO Started/
				},
				cmd: 'node',
				args: ['.']
			},
			
			jasmineServer: {
				options: {
					// This test logs a bunch of garbage
					quiet: true
				},
				cmd: 'jasmine',
				args: ['JASMINE_CONFIG_PATH=tests/jasmine.json']
			},
			
			jasmineRest: {
				cmd: 'jasmine',
				args: ['JASMINE_CONFIG_PATH=tests/jasmineRest.json']
			}
		}
		

	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-webpack');
	grunt.loadNpmTasks('grunt-babel');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-run');
	
	// Run node server related testing
	var testServer = ['jshint:server', 'run:jasmineServer', 'run:server', 'run:jasmineRest'];
	// Run client based tests
	var testClient = ['webpack', 'browserify', 'jasmine'];

	grunt.registerTask('default', ['jshint:server','babel','uglify', 'webpack', 'copy']);
	grunt.registerTask('server', ['babel', 'uglify','copy:server']);
	grunt.registerTask('test:server', testServer);
	grunt.registerTask('test:client', testClient);
	grunt.registerTask('test', testServer.concat(testClient));
	
	

};
