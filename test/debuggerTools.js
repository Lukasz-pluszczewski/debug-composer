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
  beforeEach(() => {
    global.localStorage.setItem.reset();
    global.localStorage.getItem.reset();
    global.localStorage.removeItem.reset();
  });
  it('resetDebugger should remove debug options from localStorage', () => {
    debugTools.clearLocalStorage();
    expect(localStorage.removeItem).to.have.been.calledOnce;
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
    expect(localStorage.setItem).to.be.calledOnce;
    expect(localStorage.setItem).to.be.calledWith('debug', 'enabledLib:*,partialLib:enabledNamespace,-paritalLib:disabledNamespace,otherLib,otherLib:*');
  });
  it('configureDebugger should set default options when provided with indefined environment', () => {
    const settings = {
      default: {
        'enabledLib:*': true,
        'partialLib:enabledNamespace': true,
        'paritalLib:disabledNamespace': false,
        'otherLib': true,
      },
      production: {
        lib: false,
      }
    };
    const key = undefined;

    debugTools.configureDebugger(settings, key);
    expect(localStorage.setItem).to.be.calledOnce;
    expect(localStorage.setItem).to.be.calledWith('debug', 'enabledLib:*,partialLib:enabledNamespace,-paritalLib:disabledNamespace,otherLib,otherLib:*');
  });
  it('configureDebugger should set options when environment is not provided', () => {
    const settings = {
      'enabledLib:*': true,
      'partialLib:enabledNamespace': true,
      'paritalLib:disabledNamespace': false,
      'otherLib': true,
    };

    debugTools.configureDebugger(settings);
    expect(localStorage.setItem).to.be.calledOnce;
    expect(localStorage.setItem).to.be.calledWith('debug', 'enabledLib:*,partialLib:enabledNamespace,-paritalLib:disabledNamespace,otherLib,otherLib:*');
  });
});
