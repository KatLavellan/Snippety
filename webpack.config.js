const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack');
const fs = require("fs");
let htmlPageNames = [];
//const pages = fs.readdirSync('./src/Content', { withFileTypes : true, recursive: true }); //fs.readdirSync('./src/Content/', {withFileTypes : true, recursive: true})
//console.log(pages);
var walk = function(dir, added = "") {
    var results = [];
    var list = fs.readdirSync(dir + added);
    list.forEach(function(file) {
        let curFile = dir + added + file;
        var stat = fs.statSync(curFile);
		let elem = {
			Type: stat.isDirectory() ? "dir" : "file",
			Path : added+file
		}
        if (stat && stat.isDirectory()) { 
			elem.Children = walk(dir, added+file+'/');
            /* Recurse into a subdirectory */
        } else { 
            /* Is a file */
            //results.push(added+file);
        }
		results.push(elem);
    });
    return results;
}
let pages = walk("./src/Content/");
//console.log(pages);
let func = (page) => {
	console.log(page);
    if (page.Path.endsWith('.html')) {
        htmlPageNames.push(page.Path.split('.html')[0])
    }
	if (page.Type == "dir"){
		
		page.Children.forEach(func);
	}
}
pages.forEach(func)

module.exports = (env)=>{
	env.sourceDirectory = __dirname;

	return {
		entry: {
			page: './src/index.ts',
			blank: './src/Snippet/Blank/blank.ts'
		},
		devtool: 'inline-source-map',
		devServer:{
			static: ['Data'],

			allowedHosts: [
				'http://localhost:3000',
			],
			watchFiles: ['src/Content/**/*.html']
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
				{
					test: /\.(svg|png|jpg)/,
					type: 'asset/resource'
				}
			],
		},

		mode: "development",
		resolve: {
			extensions: ['.tsx', '.ts', '.js']
		},
		output: {
			filename: '[name].js',
			path: path.resolve(__dirname, 'dist')
		},
		plugins: [
			new webpack.DefinePlugin({
				__WEBPACK_DIRECTORY: JSON.stringify(path.resolve(__dirname)),
				__WORKING_DIRECTORY: JSON.stringify(path.resolve(__dirname)) ,
				__FILES : JSON.stringify(pages),
				env : JSON.stringify(env)
			}),
			new webpack.SourceMapDevToolPlugin({
				moduleFilenameTemplate : "[absolute-resource-path]"
			}),
			...htmlPageNames.map((name)=>{

				return new HtmlWebpackPlugin({   
					filename: name+".html",
					chunks:["page"],
					template: 'src/Content/'+name+".html"
				})
			}),
			new HtmlWebpackPlugin({   
				filename: "blank.html",
				chunks:["blank"],
				
				template: 'src/Snippet/Blank/blank.html'
			})
		]
	}
};
