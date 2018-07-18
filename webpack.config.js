const path = require('path')
const {HotModuleReplacementPlugin} = require('webpack')


module.exports = {
    entry: path.resolve(__dirname, 'src', 'index.js'),

    output: {
        path: path.resolve(__dirname, 'dist'),
        
        filename: 'index.js',

        publicPath: '/dist/'
    },

    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            }
        ]
    },

    resolve: {
        extensions: ['.wasm', '.mjs', '.js', '.json', '.jsx']
    },

    plugins: [
        new HotModuleReplacementPlugin()
    ],

    devServer: {
        hot: true,
        historyApiFallback: {
            rewrites: [
                {
                    from: /^\/index.html$/,
                    to: '/index.html'
                }
            ]
        }
    }
}