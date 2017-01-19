var webpack = require('webpack')
var WebpackDevServer = require('webpack-dev-server')
var config = require('./webpack.config')
var express = require('express')
const PORT = 3002

var app = new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true,
  contentBase: __dirname + '/',
})

app.use('/audio', express.static(__dirname + '/node_modules/pool-sample-audio/PulseAndTone/'))

app.listen(PORT, 'localhost', function (err, result) {
  if (err) {
    console.log(err)
  }
  console.log('Listening at localhost:' + PORT)
})