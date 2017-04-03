import debug from 'debug';

const createTooler = (namespace, debugInstances) => {
  const timestamps = {};
  return {
    time(name, log = false) {
      timestamps[name] = performance.now();
      if (log) {
        if (!debugInstances[`${namespace}:time`]) {
          debugInstances[`${namespace}:time`] = debug(`${namespace}:time`);
        }
        debugInstances[`${namespace}:time`](`${name}: ${timestamps[name]}ms`);
      }
      return performance.now();
    },
    timeEnd(name, log = true) {
      let time = performance.now();
      if (timestamps[name]) {
        time = time - timestamps[name];
      }
      if (log) {
        if (!debugInstances[`${namespace}:time`]) {
          debugInstances[`${namespace}:time`] = debug(`${namespace}:time`);
        }
        debugInstances[`${namespace}:time`](`${name}: ${time}ms`);
      }
      return time;
    },
    testPerformance(cb, times = 1, log = true) {
      let time = 0;
      if (times === 1) {
        time = performance.now();
        cb();
        time = performance.now() - time;
      } else {
        time = performance.now();
        for (let i = 0; i <= times; i++) {
          cb();
        }
        time = performance.now() - time;
      }
      if (log) {
        if (!debugInstances[`${namespace}:performance`]) {
          debugInstances[`${namespace}:performance`] = debug(`${namespace}:performance`);
        }
        debugInstances[`${namespace}:performance`](
          `Function triggered ${times === 1 ? 'once' : `${times} times`}. Measured time: ${time}ms`
        );
      }

      return time;
    },
  };
};

const createLogger = (namespace, addToGlobals = false) => {
  const debugInstances = {};
  const tooler = createTooler(namespace, debugInstances);
  const logger = new Proxy({}, {
    get(target, name) {
      if (tooler[name]) {
        return tooler[name];
      }
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
      console.warn('debug-composer:warn', 'Could not find neither window nor global object to add logger to'); // eslint-disable-line no-console
    }
  }
  return logger;
};

export default createLogger;
