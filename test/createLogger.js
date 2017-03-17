import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

import createLogger from '../src/logger';

describe('createLogger function', () => {
  const logger = sinon.spy();
  const debug = sinon.stub().returns(logger);

  before(() => {
    createLogger.__Rewire__('debug', debug);
  });
  after(() => {
    createLogger.__ResetDependency__('debug');
  });
  it('should create logger object on which it\'s possible to trigger any method', () => {
    const createdLogger = createLogger('testNamespace');
    createdLogger.myStrangeMethodForTesting('test message');
    createdLogger.myDifferentStrangeMethodForTesting('another test message');

    expect(debug).to.be.calledWith('testNamespace:myStrangeMethodForTesting');
    expect(debug).to.be.calledWith('testNamespace:myDifferentStrangeMethodForTesting');
    expect(logger).to.be.calledWith('test message');
    expect(logger).to.be.calledWith('another test message');
  });
});