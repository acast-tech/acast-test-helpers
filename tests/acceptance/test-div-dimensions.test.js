import {
  setupAndTeardownApp,
  scaleWindowWidth,
  andThen,
  jQuery as $,
} from '../../src';

describe('test div dimensions', () => {
  const createHistory = () => ({
    push: () => {
    }
  });
  const renderAppWithHistoryIntoElement = (history, element) => {
  };
  setupAndTeardownApp(createHistory, renderAppWithHistoryIntoElement);

  it('starts at 1024 x 1024', () => {
    assertTestRootWidthAndHeight(1024, 1024);
  });

  it('width can be scaled down with scaleWindowWidth', () => {
    scaleWindowWidth(0.5);

    assertTestRootWidthAndHeight(512, 1024);
  });

  it('width can be scaled up with scaleWindowWidth', () => {
    scaleWindowWidth(2);

    assertTestRootWidthAndHeight(2048, 1024);
  });

  it('width can be scaled multiple times with scaleWindowWidth', () => {
    scaleWindowWidth(0.5);
    scaleWindowWidth(2);

    assertTestRootWidthAndHeight(1024, 1024);
  });

  it('triggers window resize event when calling scaleWindowWidth', () => {
    var eventListener = sinon.spy();
    $(window).resize(eventListener);

    scaleWindowWidth(2);

    andThen(() => {
      expect(eventListener).to.have.been.calledOnce();
    })
  });

  function assertTestRootWidthAndHeight(expectedWidth, expectedHeight) {
    andThen(() => {
      var testRoot = $('#test-root');
      expect(testRoot.width()).to.equal(expectedWidth);
      expect(testRoot.height()).to.equal(expectedHeight);
    });
  }
});
