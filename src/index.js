import * as acceptance from './acceptance';
import * as async from './async';
import * as fetch from './fetch';
import xhrStubber from './xhr-stubber';

module.exports = {
  ...acceptance,
  ...async,
  ...fetch,
  xhrStubber,
};
