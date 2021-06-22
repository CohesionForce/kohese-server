/*
 * Copyright (c) 2021 CohesionForce inc. | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


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
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client:{
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, 'coverage'), reports: [ 'html', 'lcovonly' ],
      fixWebpackSourcePaths: true
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
