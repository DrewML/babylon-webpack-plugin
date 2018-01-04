const { join } = require('path');
const BabylonWebpackPlugin = require('../BabylonWebpackPlugin');

module.exports = {
    mode: 'development',
    context: __dirname,
    devtool: 'none',
    entry: join(__dirname, 'src/index.js'),
    output: {
        path: join(__dirname, 'dist'),
        filename: '[name].js'
    },
    plugins: [new BabylonWebpackPlugin(require.resolve('webpack'))]
};
