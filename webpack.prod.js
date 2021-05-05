const path = require("path");
const common = require("./webpack.common");
const { merge } = require("webpack-merge");
var HtmlWebpackPlugin = require("html-webpack-plugin");
// const CleanWebpackPlugin = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = merge(common, {
	mode: "production",
	output: {
		filename: "[name].[contenthash].bundle.js",
		path: path.resolve(__dirname, "dist"),
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./src/template.html",
		}),
		new MiniCssExtractPlugin({ filename: "[name].[contenthash].css" }),
		// new CleanWebpackPlugin(),
	],
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
			},
		],
	},
});
