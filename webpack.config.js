const path = require('path');

module.exports = {
	entry: {
		global: path.resolve(__dirname, 'assets/js/app.js'),
		product: path.resolve(__dirname, 'assets/js/app-product.js'),
		cart: path.resolve(__dirname, 'assets/js/app-cart.js')
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				include: [
					path.resolve(__dirname, 'assets/js'),
					path.resolve(__dirname, 'node_modules/@bigcommerce/stencil-utils'),
				],
				use: {
					loader: 'babel-loader',
					options: {
						compact: true,
						cacheDirectory: true,
						minified: false,
						presets: [
							["@babel/preset-env", { 
								loose: true,
								useBuiltIns: 'usage',
								modules: false,
                                corejs: '^3.6.5'
							}],
							['@babel/preset-react']
						],
						plugins: [
							["@babel/plugin-proposal-object-rest-spread", { "loose": true, "useBuiltIns": true }],
							"@babel/plugin-transform-spread",
							"@babel/plugin-proposal-class-properties"
						]
					}
				}
			}
		]
	},
	output: {
		path: path.resolve(__dirname, 'assets/js'),
		filename: '[name].bundle.js'
	}
}