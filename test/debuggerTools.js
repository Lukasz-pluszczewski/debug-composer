import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

import debugTools from '../src/debugTools';

describe('debugTools', () => {
  let temp;
  before(() => {
    temp = global.localStorage;
    global.localStorage = {
      setItem: sinon.spy(),
      getItem: sinon.spy(),
      removeItem: sinon.spy(),
    };
  });
  after(() => {
    global.localStorage = temp;
  });
  it('resetDebugger should remove debug options from localStorage', () => {
    debugTools.clearLocalStorage();
    expect(localStorage.removeItem).to.have.been.called.once;
  });
  it('configureDebugger should set options for given environment', () => {
    const settings = {
      test: {
        'enabledLib:*': true,
        'partialLib:enabledNamespace': true,
        'paritalLib:disabledNamespace': false,
        'otherLib': true,
      },
      production: {
        lib: false,
      }
    };
    const key = 'test';

    debugTools.configureDebugger(settings, key);
    expect(localStorage.setItem).to.be.called.once;
    expect(localStorage.setItem).to.be.calledWith('debug', 'enabledLib:*,partialLib:enabledNamespace,-paritalLib:disabledNamespace,otherLib,otherLib:*');
  });
});
