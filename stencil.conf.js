const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


const webpackConfig = {
	bail: false,
	context: __dirname,
	devtool: 'none',
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
	},
	plugins: [],
	watch: true
};

/**
 * Watch any custom files and trigger a rebuild
 */
function development() {
	// Rebuild the bundle once at boot-up
	webpack(webpackConfig).watch({}, err => {
		if (err) {
			console.error(err.message, err.details);
		}

		// Interface with stencil-cli
		// process.send('reload');
	});
}

/**
 * Hook into the `stencil bundle` command and build your files before they are packaged as a .zip
 */
function production() {
	webpack(webpackConfig).run(err => {
		if (err) {
			console.error(err.message, err.details);
			throw err;
		}

		// Interface with stencil-cli
		process.send('done');
	});
}


if (process.send) {
	// running as a forked worker
	process.on('message', message => {
		if (message === 'development') {
			development();
		}

		if (message === 'production') {
			production();
		}
	});

	// Interface with stencil-cli
	process.send('ready');
}


/**
 * Watch options for the core watcher
 * @type {{files: string[], ignored: string[]}}
 */
module.exports = {

	files: [
		'/templates',
		'/lang',
	],

	ignored: [
		'/assets/scss',
		'/assets/css',
	]
};