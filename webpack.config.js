const path = require('path')
const webpack = require('webpack')

const DEBUG = !(process.env.NODE_ENV === 'production')
const env = {
  NODE_ENV: process.env.NODE_ENV,
  API_BASE_URL: process.env.API_BASE_URL
}

var config = {
  devtool: DEBUG ? 'cheap-module-eval-source-map' : false,
  entry: {
    client: './client/index',
  },
  resolve: {
    root: [path.join(__dirname, 'client') ]
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: '[name].js',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(env)
    })
  ],
  module: {
    preLoaders: [
      {
        test: /\.jsx$|\.js$/,
        loader: 'eslint-loader',
        includes:[
          path.join(__dirname, "client"),
          path.join(__dirname, "common"),
        ],
        exclude: /bundle\.js$/
      }
    ],
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015', 'react'],
      },
    }],
  },
};

if (DEBUG) {
  config.entry.dev = [
    'webpack-dev-server/client?http://localhost:3001',
    'webpack/hot/only-dev-server',
  ]

  config.plugins = config.plugins.concat([
    new webpack.HotModuleReplacementPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filname: 'vendor.js'
    })
  ])
  config.output.publicPath = 'http://localhost:3001/static/'
  config.module.loaders[0].query = {
    "env": {
      "development": {
        "presets": ["react-hmre"]
      }
    }
  }
} else {
  config.plugins = config.plugins.concat([
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filname: '[name].[chunkhash].js'
    }),
    new webpack.optimize.UglifyJsPlugin(),
  ])
}

module.exports = config;
