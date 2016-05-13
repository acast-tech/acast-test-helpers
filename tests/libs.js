const path = require('path');

const pathToNodeModules = 'node_modules';

function nodeModule(lib) {
  return path.join(pathToNodeModules, lib);
}

module.exports = [
  nodeModule('babel-polyfill/dist/polyfill.js'),
  nodeModule('sinon/pkg/sinon.js'),
  nodeModule('chai/chai.js'),
  nodeModule('dirty-chai/lib/dirty-chai.js'),
  nodeModule('sinon-chai/lib/sinon-chai.js'),
  'tests/bootstrap.js',
];