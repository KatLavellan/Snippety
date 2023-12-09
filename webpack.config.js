const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack');

module.exports = (env)=>{
	env.sourceDirectory = __dirname;

	return {
		entry: './src/index.ts',
		devtool: 'inline-source-map',
		devServer:{
			static: ['Data'],

			allowedHosts: [
				'http://localhost:3000',
			]
		},
		context: path.resolve(__dirname),
		node: {
			__dirname : true,
			__filename: true
		},
		devtool: 'inline-source-map',
		module: {
			rules: [
				{
					test: /\.snippet.(js|css|ts|html)/,
					type: 'asset/source'
				},
				{
					test: /\.tsx?$/,
					use: 'ts-loader',
					exclude: /(node_modules|Snippets)/,
				},
				{
					test: /\.s[ac]ss$/i,
					use: [
						"style-loader",
						"css-loader",
						"sass-loader",
					],
				},
			],
		},
			mode: "development",
			resolve: {
			extensions: ['.tsx', '.ts', '.js'],
		},
		output: {
			filename: 'bundle.js',
			path: path.resolve(__dirname, 'dist')
		},
		plugins: [
			new HtmlWebpackPlugin({   
				filename: 'index.html',
				template: 'src/index.html'
			}),
			new webpack.DefinePlugin({
				__WEBPACK_DIRECTORY: JSON.stringify(path.resolve(__dirname)),
				__WORKING_DIRECTORY: JSON.stringify(path.resolve(__dirname)) 
			}),
			new webpack.SourceMapDevToolPlugin({
				moduleFilenameTemplate : "[absolute-resource-path]"
			})
		]
	}
};
