const path = require('path');

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
      }
    ]
  },
  // devtool : 'inline-source-map',
  resolve: {
    extensions: ['.ts', '.js' ]
  },
  output: {
    filename: 'cache-bundle.js',
    path: path.resolve(__dirname, 'build/client/cache-worker')
  }
};
