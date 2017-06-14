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
  it('should create logger object on which it\'s possible to trigger added methods', () => {
    const createdLogger = createLogger('testNamespace');

    createdLogger.add('myStrangeMethodForTesting')('test message');
    createdLogger.add('myDifferentStrangeMethodForTesting');

    createdLogger.myDifferentStrangeMethodForTesting('another test message');

    expect(debug).to.be.calledWith('testNamespace:myStrangeMethodForTesting');
    expect(debug).to.be.calledWith('testNamespace:myDifferentStrangeMethodForTesting');
    expect(logger).to.be.calledWith('test message');
    expect(logger).to.be.calledWith('another test message');
  });
  it('should throw an arror when calling non-existing method', () => {
    const createdLogger = createLogger('testNamespace');
    expect(() => createdLogger.noneExistingMethod('test message')).to.throw(Error);
  })
});