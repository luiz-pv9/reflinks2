let webpack = require('webpack');
let path = require('path');

module.exports = {
  entry: {
    reflinks: path.resolve('./index.js'),
  },
  output: {
    path: path.resolve('./build'),
    filename: '[name].js',
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  }
};