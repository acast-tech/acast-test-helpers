const testLibs = require('../tests/libs.js');

module.exports = {
  src_files: testLibs.concat([
    'tmp/tests-bundle.js'
  ]),
  framework: 'mocha',
  launch_in_ci: ['Chrome'],
  browser_args: {
    'Chrome': [ '--headless', '--disable-gpu', '--remote-debugging-port=9222' ],
  },
};
