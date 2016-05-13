const testLibs = require('./tests/libs.js');

module.exports = {
  src_files: testLibs.concat([
    'tmp/tests-bundle.js'
  ]),
  framework: 'mocha',
  launch_in_ci: ['PhantomJS'],
  launch_in_dev: ['Chrome'],
};
