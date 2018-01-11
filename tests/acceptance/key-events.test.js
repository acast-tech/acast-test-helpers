import {
  asyncIt,
  click,
  mouseDown,
  mouseUp,
  mouseMove,
  setupAsync,
  andThen,
  keyEventIn,
} from '../../src';

describe('keyEventIn', () => {
  setupAsync();

  let element;

  beforeEach(() => {
    element = document.createElement('input');
    element.className = 'input-for-key-event-test'
  });

  afterEach(() => {
    document.body.removeChild(element);
    element = null;
  });

  asyncIt('waits for selector to show up and then triggers a key event in it', (done) => {
    function callback(event) {
      expect(event.bubbles).to.be.true();
      expect(event.keyCode).to.equal(39);
      done();
    }

    element.addEventListener('keydown', callback);

    keyEventIn('.input-for-key-event-test', 'keydown', 39);

    document.body.appendChild(element);
  });
});
