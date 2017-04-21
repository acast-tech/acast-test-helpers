const glob = require('glob');

module.exports = {
  entry: {
    tests : glob.sync('./tests/**/*test.js')
  },

  output: {
    filename: './tmp/[name]-bundle.js'
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel'
      }
    ]
  },
};
