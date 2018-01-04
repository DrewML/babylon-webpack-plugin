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
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: BabylonWebpackPlugin.transformBabelOpts({
                        parserOpts: {
                            plugins: ['dynamicImport']
                        }
                    })
                }
            }
        ]
    },
    plugins: [new BabylonWebpackPlugin(require.resolve('webpack'))]
};
