const path = require('path');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
        playground: './client/application/index.js',
        dev: './client/application/dev.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name]_client.bundle.js'
    },
    plugins: [
        new Dotenv(),
        new HtmlWebpackPlugin({
            chunks: ['playground'],
            template: './client/playground.html',
            filename: 'index.html'
        }),
        new HtmlWebpackPlugin({
            chunks: ['dev'],
            template: './client/dev.html',
            filename: 'dev.html'
        })
    ],
    devServer: {
        contentBase: __dirname,
        compress: true,
        disableHostCheck: true,
        port: 9000
    }
};