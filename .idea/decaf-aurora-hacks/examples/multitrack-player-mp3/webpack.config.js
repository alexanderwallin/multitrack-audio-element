var path = require('path')
var webpack = require('webpack')

module.exports = {
  devtool: 'source-map',
  entry: [
    'babel-polyfill',
    './index'
  ],
  node: {
    fs: 'empty'
  },
  resolve : {
    alias : {
      av : path.join(__dirname, '../../src/aurora')
    }
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/js/'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: [ 'babel' ],
        exclude: /node_modules/
      }
    ]
  }
}
