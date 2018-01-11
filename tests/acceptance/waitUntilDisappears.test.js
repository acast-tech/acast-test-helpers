import { asyncIt, setupAsync, andThen, waitUntilDisappears } from '../../src';

describe('waitUntilDisappears', () => {
  setupAsync();

  const label = document.createElement('label');
  label.innerHTML = 'foobar';

  asyncIt('resolve when the object disappears after having showed', (done) => {
    let callback = sinon.spy();

    waitUntilDisappears('label:contains("foobar")');

    andThen(callback);

    setTimeout(() => {
      expect(callback).to.not.have.been.called('Called before selector appeared!');
    }, 150);

    setTimeout(() => {
      document.body.appendChild(label);
    }, 250);

    setTimeout(() => {
      expect(callback).to.not.have.been.called('Called before selector disappeared!');
    }, 350);

    setTimeout(() => {
      document.body.removeChild(label);
    }, 450);

    setTimeout(() => {
      expect(callback).to.have.been.calledOnce('Not called when selector disappeared!');
      done();
    }, 550);
  });
});