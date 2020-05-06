const path = require('path');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
        playground: './src/application/index.js',
        dev: './src/application/dev.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name]_client.bundle.js'
    },
    plugins: [
        new Dotenv(),
        new HtmlWebpackPlugin({
            chunks: ['playground'],
            template: 'playground.html',
            filename: 'index.html'
        }),
        new HtmlWebpackPlugin({
            chunks: ['dev'],
            template: 'dev.html',
            filename: 'dev.html'
        })
    ],
    devServer: {
        contentBase: __dirname,
        compress: true,
        port: 9000
    }
};