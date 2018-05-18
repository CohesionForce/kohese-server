module.exports = function (config) {
  const Path = require('path');
  const ALIASES = require('rxjs/_esm5/path-mapping')();
  const EMPTY_WEBPACK_SHIM_PATH = Path.join(process.cwd(),
    'empty-webpack-shim.js');
  ALIASES['fs'] = EMPTY_WEBPACK_SHIM_PATH;
  ALIASES['mv'] = EMPTY_WEBPACK_SHIM_PATH;
  ALIASES['source-map-support'] = EMPTY_WEBPACK_SHIM_PATH;
  ALIASES['safe-json-stringify'] = EMPTY_WEBPACK_SHIM_PATH;
  ALIASES['dtrace-provider'] = EMPTY_WEBPACK_SHIM_PATH;
  
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular/cli'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular/cli/plugins/karma')
    ],
    client:{
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      reports: [ 'html', 'lcovonly' ],
      fixWebpackSourcePaths: true
    },
    angularCli: {
      environment: 'dev'
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    webpack: {
      resolve: {
        alias: ALIASES
      }
    }
  });
};