const baseConfig = require('./testem');

module.exports = Object.assign({}, baseConfig, {
  launch_in_dev: ['Chrome'],
  on_start: './node_modules/.bin/webpack --watch'
});
