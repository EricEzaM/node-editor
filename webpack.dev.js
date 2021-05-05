const path = require("path");
const common = require("./webpack.common");
const { merge } = require("webpack-merge");
var HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = merge(common, {
	mode: "development",
	devtool: "eval-cheap-module-source-map",
	devServer: {
		hot: true,
		contentBase: ["./src", "./public"],
		inline: true,
	},
	output: {
		filename: "[name].bundle.js",
		path: path.resolve(__dirname, "dist"),
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./src/template.html",
		}),
	],
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: [
					"style-loader", // 3. inject into DOM
					"css-loader", // 2. css to commonjs
					"sass-loader", // 1. sass to css
				],
			},
		],
	},
});
