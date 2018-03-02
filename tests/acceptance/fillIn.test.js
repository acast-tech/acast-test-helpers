import { jQuery as $, fillIn, asyncIt as it, setupAsync, andThen, waitUntilExists } from '../../src';

describe('fillIn', () => {
  setupAsync();

  let input;
  let changeSpy;

  beforeEach(() => {
    input = null;
    changeSpy = sinon.spy();
  });

  afterEach(() => {
    if (input) {
      input.remove();
    }
  });

  ['input', 'textarea'].forEach(textInputType => {
    it(`waits for input of type ${textInputType} and sets value of it`, () => {
      givenInput($(document.createElement(textInputType)));

      fillIn('[data-test-id="input"]', 'foobar');

      andThen(() => {
        expect(input.val()).to.equal('foobar');
        expect(changeSpy).to.have.been.calledOnce();
      });
    });
  });

  it('can set value of select', () => {
    givenSelectWithValues([1, 2, 3]);

    fillIn('[data-test-id="input"]', 2);

    andThen(() => {
      expect(input.val()).to.equal('2');
      expect(changeSpy).to.have.been.calledOnce();
    });
  });

  it.skip('throws if passed invalid value for select', () => {
    givenSelectWithValues([1, 2, 3]);

    fillIn('[data-test-id="input"]', 'invalid-value');

    // Should throw with an error stating that value could not be set. 
  });

  it.skip('throws if applied to non-input', () => {
    givenInput($('<div>'));

    fillIn('[data-test-id="input"]', 'some-text');

    // Should throw with an error stating that selector has to match an input element.
  });

  function givenSelectWithValues(values) {
    const select = $('<select>');
    values.forEach((value) => {
      select.append($('<option>').attr('value', value).text(`label for ${value}`));
    });

    givenInput(select);
  }

  function givenInput(inputToTest) {
    input = inputToTest;
    input.attr('data-test-id', 'input');
    input.on('change', changeSpy);
    setTimeout(() => {
      input.appendTo('body');
    }, 10);
  }
});