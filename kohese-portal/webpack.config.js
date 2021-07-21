/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
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


const path = require('path');
const { flattenDiagnosticMessageText } = require('typescript');

module.exports = {
  mode: 'development',
  entry: {
    "cache-worker" : ['./client/cache-worker/cache-worker.ts']
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: [/node_modules/, /.+spec.ts$/ ]
      },
      { // sass / scss loader for webpack
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Resolves relative references for all linked assets to provide url rewriting
          'resolve-url-loader',
          {
            // Compiles Sass to CSS
            loader: 'sass-loader',
            options: {
              // Prefer `dart-sass`
              implementation: require("sass"),
              sassOptions: {
                fiber: false
              }
            }
          }
        ],
      },
    ]
  },
  resolve: {
    extensions: ['.ts', '.js' ],
    fallback: {
      "buffer": false,
      "util": false,
      "assert": false
    }
  },
  output: {
    filename: 'cache-bundle.js',
    path: path.resolve(__dirname, 'build/client/cache-worker')
  }
};
