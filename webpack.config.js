const path = require('path');
//const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack   = require("webpack");

module.exports = [{
    entry   : {
        bundle: "./src/main.js",
        style:  "./src/styles/style.js",
    },
    output  : {
        path        : path.join(__dirname, "dist"),
        filename    : "[name].js",
        publicPath  : "/",
    },
    resolve : {
        moduleDirectories: ["node_modules", "bower_components"]
    },
    module  : {
        loaders : [
            {
                // Webpack に CreateJS のライブラリでは `this` に `window` を参照させ、`window.createjs` を export するように設定
                test: /node_modules(\/|\\)createjs-(easeljs|tweenjs|preloadjs)(\/|\\).*\.js$/,
                loader: 'imports?this=>window!exports?window.createjs'
            },
            {
                test    : /\.js$/,
                exclude : [
                    /node_modules/,
                    /hls.js/
                ],
                loader  : "babel-loader",
                query   : {
                    presets: ['es2015']
                },
            },
            {
                test: /\.css$/,
                //loader: ExtractTextPlugin.extract("style-loader", "css-loader")
                loader: "style-loader!css-loader",
            },
            {
                test: /\.scss$/,
                //loader: ExtractTextPlugin.extract("style-loader", "css-loader!sass-loader")
                loader: "style-loader!css-loader!sass-loader",
            },
        ]
    },
    plugins : [
        new webpack.ResolverPlugin(
            new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])
        )
    ],
    externals: [
        {
        //    "moment"    : true
        }
    ]
}
]

