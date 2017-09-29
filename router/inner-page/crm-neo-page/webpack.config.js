var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
var path = require("path");
// use folder name as page name
var page_name = __dirname.indexOf("\\") > 0 ?
    __dirname.substr(__dirname.lastIndexOf("\\") + 1, __dirname.length) :
    __dirname.substr(__dirname.lastIndexOf("/") + 1, __dirname.length);
// config
module.exports = {
    plugins: [
        new CommonsChunkPlugin({
            name: "common",
            filename: "common.js"
        }),
        new ExtractTextPlugin({
            filename: "../css/style.css",
            allChunks: true,
            disable: false
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    ],
    entry: {
        index: "./src/main.js", //entry js of project
        res: "./res/res.js", //import common-res like image or others, must be included in html file
        style: "./res/style.js", // required css file of main page, css/res file must be required and defined in js file while packing project.
        /* you can specific css of specific page like:
         some: "./src/some.js",
         */
    },
    output: {
        path: __dirname + "/" + page_name + "-dist/js/",
        filename: "[name].js"
    },
    module: {
        loaders: [
            /*babel es2015 loader*/
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            },
            /*style loader*/
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
            },
            /*process image file, save all image to ./img/ */
            {
                test: /\.(png|jpg|gif)$/,
                loader: "url-loader?limit=1&name=../img/[name].[ext]"
            },
            {
                test: /\.(woff|svg|eot|ttf)\??.*$/,
                loader: "url-loader?limit=1024&name=../css/[name].[ext]"
            },
            /*process media file, save all media file to ./res/ */
            {
                test: /\.(mp4|ogg|svg|mp3)$/,
                loader: "file-loader?name=../res/[name].[ext]"
            },
            {
                test: /\.vue$/,
                loader: "vue-loader",
                options: {
                    loaders: {}
                    // other vue-loader options go here
                }
            },
        ]
    },
    resolve: {
        extensions: [".js", ".json", ".scss"],
        alias: {
            "vue$": "vue/dist/vue.js",
        }
    }
};