/**
 * Created by josh on 8/28/15.
 */

var BowerWebpackPlugin = require("bower-webpack-plugin");
var webpack = require("webpack");

module.exports = {
    context: __dirname + '/../client-ng1',
    entry: './app.js',
    output: {
        path: __dirname + '/../client-ng1',
        filename: 'bundle.js'
    },
    resolve: {
        modulesDirectories: ['node_modules', 'bower_components']
    },
    devtool: 'source-map',
    plugins: [new BowerWebpackPlugin({
        modulesDirectories: ['bower_components'],
        manifestFiles: 'bower.json',
        includes: /.*/,
        excludes: [],
        searchResolveModulesDirectories: true
    })],
    module: {
        loaders: [
            {test: /\.js$/, loader: 'babel'},
            {test: /\.json$/, loader: 'json-loader'},
            {test: /\.css$/, loader: "style-loader!css-loader"},
            {test: /\.less$/, loader: "style!css!less"}
        ]
    }
};
