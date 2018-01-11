import {touchStart, andThen, setupAsync, jQuery as $} from '../../src'

describe('Touch Events', () => {
    describeMouseEventHelper(touchStart, 'touchstart');

    function describeMouseEventHelper(func, eventName, extraTests = ()=> {}) {
      describe(func.name, () => {
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
          func('.element-to-interact-with');
          andThen(() => {
            expect(spy).to.have.been.calledOnce();
          });
        });
    
        it('waits until element shows up before trying to interact with it', () => {
          const spy = sinon.spy();
          $(elementToInteractWith).on(eventName, spy);
          func('.element-to-interact-with');
          andThen(() => {
            expect(spy).to.have.been.calledOnce();
          });
    
          setTimeout(attachElementToBody, 500);
        });
    
        it('takes extra options as parameters', (done) => {
          const element = attachElementToBody();
          $(element).on(eventName, e => {
            expect(e.touches[0].clientX).to.equal(1337);
            expect(e.touches[0].clientY).to.equal(1338);
            done();
          });
          func('.element-to-interact-with', {touches: [{ clientX: 1337, clientY: 1338 }]});
        });
    
        it('evaluates options lazily if passed as function', (done) => {
          let screenX = 42;
    
          andThen(() => {
            screenX = 1337;
          });
    
          func('.element-to-interact-with', () => ({ screenX }));
    
          const element = attachElementToBody();
          $(element).on(eventName, e => {
            expect(e.screenX).to.equal(1337);
            done();
          });
        });
    
        extraTests(attachElementToBody);
      });
    }    
})
