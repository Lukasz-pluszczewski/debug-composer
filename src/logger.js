import debug from 'debug';

const createLogger = (namespace, addToGlobals = false) => {
  const debugInstances = {};
  const logger = new Proxy(() => {}, {
    get(target, name) {
      if (!debugInstances[`${namespace}:${name}`]) {
        debugInstances[`${namespace}:${name}`] = debug(`${namespace}:${name}`);
      }
      return (...args) => debugInstances[`${namespace}:${name}`](...args);
    },
  });
  const globalName = typeof addToGlobals === 'string' ? addToGlobals : 'logger';
  if (addToGlobals) {
    if (typeof window !== 'undefined') {
      window[globalName] = logger;
    } else if (typeof global !== 'undefined') {
      global[globalName] = logger;
    } else {
      console.warn('Could not find neither window nor global object to add logger to');
    }
  }
  return logger;
};

export default createLogger;