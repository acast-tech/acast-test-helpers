import * as acceptance from './acceptance';
import * as async from './async';
import * as fetch from './fetch';
import * as fetchAsync from './fetch-async';
import * as xhr from './xhr';

module.exports = {
  ...acceptance,
  ...async,
  ...fetch,
  ...fetchAsync,
  ...xhr,
};
