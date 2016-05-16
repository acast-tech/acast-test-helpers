import * as acceptance from './acceptance';
import * as async from './async';
import * as fetch from './fetch';
import * as smoke from './smoke';

window.fetch = window.fetch; // For some unexplainable reason, PhantomJS doesn't pass the tests in projects installing this package, without this.

module.exports = {
  ...acceptance,
  ...async,
  ...fetch,
  ...smoke,
};
