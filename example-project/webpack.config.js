const { join } = require('path');
const BabylonWebpackPlugin = require('../BabylonWebpackPlugin');

module.exports = {
    context: __dirname,
    entry: join(__dirname, 'src/index.js'),
    output: {
        path: join(__dirname, 'dist'),
        filename: '[name].js'
    },
    plugins: [new BabylonWebpackPlugin(require.resolve('webpack'))]
};
