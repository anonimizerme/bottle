const path = require('path');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/application/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'client.bundle.js'
    },
    plugins: [
        new Dotenv(),
        new HtmlWebpackPlugin({
            template: 'playground.html'
        })
    ],
    devServer: {
        contentBase: __dirname,
        compress: true,
        port: 9000
    }
};