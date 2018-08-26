var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        'polyfills': './src/polyfills.ts',
        'vendor': './src/vendor.ts',
        'app': './src/main.ts'
    },

    node: {
        __dirname: false,
        __filename: false
    },

    resolve: {
        extensions: ['.ts', '.js']
    },

    externals: {
        sqlite3: 'commonjs sqlite3',
    },

    module: {
     /*   noParse: /fsevents/,
  /*      
            // Disable handling of requires with a single expression
  exprContextRegExp: /$^/,
  exprContextCritical: false,
  // Disable handling of requires with expression wrapped by string,
  wrappedContextRegExp: /$^/,
  wrappedContextCritical: false,*/
        rules: [
            {
                test: /\.ts$/,
                exclude: /\.spec\.ts$/,
                use: ['awesome-typescript-loader', 'angular2-template-loader']
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader'
                    },
                ]
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                use: 'file-loader?name=assets/images/[name].[ext]'
            },
			{
				test: /\.scss$/,
                use: [
                    {
                        loader: "style-loader"
                    },
                    {
                        loader: 'postcss-loader', // Run post css actions
                        options: {
                            plugins: function () { // post css plugins, can be exported to postcss.config.js
                                return [
                                    require('precss'),
                                    require('autoprefixer')
                                ];
                            }
                        }
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            includePaths: [
                                path.resolve(__dirname, '../src/assets/sass'),
                                path.resolve(__dirname, '../node_modules/bootstrap/scss'),
                            ]
                        }
                    }
                ]
			},
        ]
    },

    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            Popper: ['popper.js', 'default'],
        }),
        new HtmlWebpackPlugin({template: 'src/index.html'}),
		new CopyWebpackPlugin([
            { from: 'src/assets/data/database\.*', to: 'assets/data/[name].[ext]' },
        ]),
        new webpack.ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)(@angular|esm5)/,
            path.resolve(__dirname, '../src')
        ),
    ],

    target:'electron-renderer'
};
