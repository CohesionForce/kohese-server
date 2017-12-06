/**
 * Created by josh on 8/28/15.
 */

var BowerWebpackPlugin = require("bower-webpack-plugin");
var webpack = require("webpack");

module.exports = {
    //context: __dirname + '/client',
    entry: './client/bootstrap.ts',
    output: {
        path: __dirname + '/client',
        filename: 'bundle.js'
    },
    resolve: {
        alias: {}, // Use this to more easily resolve common modules
        modules: ['node_modules', 'bower_components'],
        extensions: ['.ts', 'tsx','.js', '.css']
    },
    devtool: 'inline-source-map',
    plugins: [],
    module: {
          rules: [
            {
              test: /\.tsx?$/,
              use: 'ts-loader',
              exclude: /node_modules/
            },
            {
              test: /\.css$/,
              use: 'style-loader!css-loader'
            }
          ]
    }
};
