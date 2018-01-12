import {
  asyncIt as it,
  click,
  mouseDown,
  mouseUp,
  mouseMove,
  setupAsync,
  andThen,
  jQuery as $
} from '../../src';

describe('Mouse Events', () => {
  describeMouseEventHelper(click, 'click', (attachElementToBody) => {
    it('triggers mousedown and mouseup before click', () => {
      const $element = $(attachElementToBody());
      const mouseDownListener = sinon.spy();
      const mouseUpListener = sinon.spy();
      const clickListener = sinon.spy();

      $element.on('mousedown', mouseDownListener);
      $element.on('mouseup', mouseUpListener);
      $element.on('click', clickListener);

      click($element);

      andThen(() => {
        sinon.assert.callOrder(mouseDownListener, mouseUpListener, clickListener);
      });
    });
  });
  describeMouseEventHelper(mouseDown, 'mousedown');
  describeMouseEventHelper(mouseUp, 'mouseup');
  describeMouseEventHelper(mouseMove, 'mousemove');

  function describeMouseEventHelper(helperToTest, eventName, extraTests = ()=> {
  }) {
    describe(helperToTest.name, () => {
      setupAsync();

      let elementToInteractWith;

      function attachElementToBody() {
        document.body.appendChild(elementToInteractWith);
        return elementToInteractWith;
      }

      beforeEach(() => {
        elementToInteractWith = document.createElement('div');
        elementToInteractWith.className = 'element-to-interact-with';
      });

      afterEach(() => {
        document.body.removeChild(elementToInteractWith);
      });

      it(`triggers ${eventName} event on selected element`, () => {
        attachElementToBody();
        const spy = sinon.spy();
        $(elementToInteractWith).on(eventName, spy);
        helperToTest('.element-to-interact-with');
        andThen(() => {
          expect(spy).to.have.been.calledOnce();
        });
      });

      it('triggers event that bubbles', (done) => {
        const element = attachElementToBody();
        const spy = sinon.spy();
        $(element).on(eventName, e => {
          expect(e.bubbles).to.equal(true);
          done();
        });
        helperToTest(element);
      });

      it('waits until element shows up before trying to interact with it', () => {
        const spy = sinon.spy();
        $(elementToInteractWith).on(eventName, spy);
        helperToTest('.element-to-interact-with');
        andThen(() => {
          expect(spy).to.have.been.calledOnce();
        });

        setTimeout(attachElementToBody, 500);
      });

      it('takes extra options as parameters', (done) => {
        const element = attachElementToBody();
        $(element).on(eventName, e => {
          expect(e.clientX).to.equal(1337);
          expect(e.clientY).to.equal(1338);
          done();
        });
        helperToTest('.element-to-interact-with', { clientX: 1337, clientY: 1338 });
      });

      it('evaluates options lazily if passed as function', (done) => {
        let screenX = 42;

        andThen(() => {
          screenX = 1337;
        });

        helperToTest('.element-to-interact-with', () => ({ screenX }));

        const element = attachElementToBody();
        $(element).on(eventName, e => {
          expect(e.screenX).to.equal(1337);
          done();
        });
      });

      extraTests(attachElementToBody);
    });
  }
});
