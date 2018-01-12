import {
  touchStart,
  touchMove,
  touchCancel,
  touchEnd,
  andThen,
  setupAsync,
  jQuery as $
} from '../../src'

describe('Touch Events', () => {
    describeTouchEventHelper(touchStart, 'touchstart');
    describeTouchEventHelper(touchMove, 'touchmove');
    describeTouchEventHelper(touchCancel, 'touchcancel');
    describeTouchEventHelper(touchEnd, 'touchend');

    function describeTouchEventHelper(helperToTest, eventName) {
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
          elementToInteractWith.addEventListener(eventName, spy);
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
          const handleEvent = e => {
            expect(e.touches[0].clientX).to.equal(1337);
            expect(e.touches[0].clientY).to.equal(1338);
            expect(e.touches[0].target).to.equal(element);
            expect(e.touches[0].identifier).to.equal(0);

            expect(e.changedTouches[0].clientX).to.equal(1337);
            expect(e.changedTouches[0].clientY).to.equal(1338);
            expect(e.changedTouches[0].target).to.equal(element);
            expect(e.changedTouches[0].identifier).to.equal(42);

            expect(e.targetTouches[0].clientX).to.equal(1337);
            expect(e.targetTouches[0].clientY).to.equal(1338);
            expect(e.targetTouches[0].target).to.equal(element);
            expect(e.targetTouches[0].identifier).to.equal(0);

            element.removeEventListener(eventName, handleEvent);
            done();
          };

          element.addEventListener(eventName, handleEvent);
          helperToTest('.element-to-interact-with', {
            touches: [{ clientX: 1337, clientY: 1338 }],
            changedTouches: [{ target: element, clientX: 1337, clientY: 1338, identifier: 42 }],
            targetTouches: [{ target: element, clientX: 1337, clientY: 1338 }],
          });
        });
    
        it('evaluates options lazily if passed as function', (done) => {
          let screenX = 42;
    
          andThen(() => {
            screenX = 1337;
          });

          helperToTest('.element-to-interact-with', () => ({ touches: [{ screenX }] }));
    
          const element = attachElementToBody();
          const handleEvent = e => {
            expect(e.touches[0].screenX).to.equal(1337);
            element.removeEventListener(eventName, handleEvent);
            done();
          };
          element.addEventListener(eventName, handleEvent);
        });
      });
    }    
})
