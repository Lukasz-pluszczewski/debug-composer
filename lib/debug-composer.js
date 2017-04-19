(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('lodash'), require('debug')) :
	typeof define === 'function' && define.amd ? define(['exports', 'lodash', 'debug'], factory) :
	(factory((global.mi18n = global.mi18n || {}),global._,global.debug));
}(this, (function (exports,_,debug) { 'use strict';

_ = 'default' in _ ? _['default'] : _;
debug = 'default' in debug ? debug['default'] : debug;

var createTooler = function createTooler(namespace, debugInstances) {
  var timestamps = {};
  return {
    time: function time(name) {
      var log = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      timestamps[name] = performance.now();
      if (log) {
        if (!debugInstances[namespace + ':time']) {
          debugInstances[namespace + ':time'] = debug(namespace + ':time');
        }
        debugInstances[namespace + ':time'](name + ': ' + timestamps[name] + 'ms');
      }
      return performance.now();
    },
    timeEnd: function timeEnd(name) {
      var log = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      var time = performance.now();
      if (timestamps[name]) {
        time = time - timestamps[name];
      }
      if (log) {
        if (!debugInstances[namespace + ':time']) {
          debugInstances[namespace + ':time'] = debug(namespace + ':time');
        }
        debugInstances[namespace + ':time'](name + ': ' + time + 'ms');
      }
      return time;
    },
    testPerformance: function testPerformance(cb) {
      var times = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      var log = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

      var time = 0;
      if (times === 1) {
        time = performance.now();
        cb();
        time = performance.now() - time;
      } else {
        time = performance.now();
        for (var i = 0; i <= times; i++) {
          cb();
        }
        time = performance.now() - time;
      }
      if (log) {
        if (!debugInstances[namespace + ':performance']) {
          debugInstances[namespace + ':performance'] = debug(namespace + ':performance');
        }
        debugInstances[namespace + ':performance']('Function triggered ' + (times === 1 ? 'once' : times + ' times') + '. Measured time: ' + time + 'ms');
      }

      return time;
    },
    stacktrace: function stacktrace() {
      var asObject = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      var trace = new Error().stack.split('\n').reverse().slice(0, -2).reverse();
      var regexp = new RegExp(/at ([\w.]*) \((.*)\?:(\d*):(\d*)\)/);
      trace = trace.map(function (el) {
        var matched = regexp.exec(el);
        if (matched) {
          if (asObject) {
            return {
              method: matched[1],
              file: matched[2].split('/').pop(),
              line: parseInt(matched[3]),
              column: parseInt(matched[4]),
              filePath: matched[2],
              trace: el
            };
          }
          return matched[1] + ' in \'' + matched[2].split('/').pop() + '\' at ' + matched[3] + ':' + matched[4];
        }
        if (asObject) {
          return {
            traceEl: el
          };
        }
        return el;
      });
      return trace;
    }
  };
};

var createLogger$1 = function createLogger(namespace) {
  var addToGlobals = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var debugInstances = {};
  var tooler = createTooler(namespace, debugInstances);
  var logger = new Proxy({}, {
    get: function get(target, name) {
      if (tooler[name]) {
        return tooler[name];
      }
      if (!debugInstances[namespace + ':' + name]) {
        debugInstances[namespace + ':' + name] = debug(namespace + ':' + name);
      }
      return function () {
        return debugInstances[namespace + ':' + name].apply(debugInstances, arguments);
      };
    }
  });
  var globalName = typeof addToGlobals === 'string' ? addToGlobals : 'logger';
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

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};



















var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var logger = createLogger$1('debug-composer');

var debugTools$1 = {
  /**
   * Gets debug settings from localStorage
   * @return {string} debug settings
   */
  getFromLocalStorage: function getFromLocalStorage() {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('debug');
    }
    return '';
  },


  /**
   * Sets debug settings to localStorage
   * @param {string} value debug settings as string
   */
  setToLocalStorage: function setToLocalStorage(value) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('debug', value);
    }
  },


  /**
   * Clear debug options in localStorage
   */
  clearLocalStorage: function clearLocalStorage() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('debug');
    }
  },


  /**
   * Sets provided settings as string to localStorage
   * @param {object} settings - debug settings as js object
   * @param {string|number} env - debug settings level to env (the same as index in settings object to be set)
   */
  configureDebugger: function configureDebugger(settings) {
    var env = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'default';

    var envProvided = arguments.length > 1;
    var settingsToApply = settings;

    if ((typeof settings === 'undefined' ? 'undefined' : _typeof(settings)) !== 'object') {
      throw new Error('Expected an object provided as the first argument to configureDebugger function. ' + (typeof settings === 'undefined' ? 'undefined' : _typeof(settings)) + ' found instead.');
    }

    // checking if we got env = undefined or we did not get env at all
    if (envProvided) {
      if (!settings[env]) {
        throw new Error('Key ' + env + ' not found in settings file provided to configureDebugger method. As a second argument you must provide index from settings object');
      }
      if (_typeof(settings[env]) !== 'object') {
        throw new Error('Expected settings.' + env + ' to be an object. ' + _typeof(settings[env]) + ' found instead');
      }
      settingsToApply = settings[env];
    }

    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      logger.warning('It seems that you are using configureDebugger method in node.js or in outdated browser. It will not work as it needs browser environment with localStorage available.');
    }

    logger.info(envProvided ? 'Setting debug for ' + env : 'Setting debug');

    var options = debugTools$1.getDebugOptionsObject(debugTools$1.getFromLocalStorage());
    _.forEach(settingsToApply, function (level, namespace) {
      options = debugTools$1.changeDebugOption(level)(options, namespace);
    });
    debugTools$1.setToLocalStorage(debugTools$1.getDebugOptionsString(options));
  },


  /**
   * Converts debugString (as saved in localStorage) to object
   * @param {object} debugString - debug settings string
   * @return {object} debug setting object
   */
  getDebugOptionsObject: function getDebugOptionsObject(debugString) {
    if (!debugString) {
      return {};
    }
    var options = debugString;
    options = _.map(options.split(','), function (el) {
      return el.split(';');
    });
    options = _.flatten(options);
    options = _.reduce(options, function (accu, val) {
      var enabled = val.indexOf('-') !== 0;
      var split = val.replace(/^-/, '').split(':');
      if (!accu[split[0]]) {
        accu[split[0]] = {};
      }
      if (split.length === 2) {
        accu[split[0]][split[1]] = enabled;
      } else {
        accu[split[0]]._default = enabled;
      }
      return accu;
    }, {});
    return options;
  },


  /**
   * Converts debugOptions object to string that can be saved to localStorage
   * @param {object} optionsObject - debug options as object
   * @return {string} optionsString - debug options as string
   */
  getDebugOptionsString: function getDebugOptionsString(optionsObject) {
    var options = optionsObject;
    options = _.reduce(options, function (accu, namespaceOptions, namespaceName) {
      _.forEach(namespaceOptions, function (namespaceOption, subNamespaceName) {
        if (subNamespaceName === '_default') {
          accu.push('' + (namespaceOption ? '' : '-') + namespaceName);
        } else {
          accu.push('' + (namespaceOption ? '' : '-') + namespaceName + ':' + subNamespaceName);
        }
      });
      return accu;
    }, []);
    return options.join(',');
  },


  /**
   * Returns the function that enable or disable (based on enable parameter) given namespace in optionsObject and returns that object
   * @param {boolean} enable flag that indicates if returned function should enable or disable namespaces
   * @return {function} function to be used for disabling/enabling namespaces
   */
  changeDebugOption: function changeDebugOption(enable) {
    /**
     * Function to be used for disabling/enabling namespaces
     * @param {object} optionsObject - debug options to be edited (as JS object)
     * @param {string} namespace - namespace to be enabled/disabled (e.g. 'socket.io-client' or 'mi18n-redux:info')
     * @param {number} level - if set to 0 and provided with outer namespace (like 'debug' and not 'debug:warning') the namespace with asterisk (e.g. 'debug:*') will be added as well
     * @return {object} new optionsObject - modified debug options as js object
     */
    return function (optionsObject, namespace) {
      var level = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

      var splitNamespace = namespace.split(':');
      var newOptions = _extends({}, optionsObject);

      if (splitNamespace.length === 1) {
        // console.log('length=1', splitNamespace, enable, newOptions);
        if (namespace === '*') {
          if (enable) {
            newOptions = _extends({}, newOptions, {
              '*': { _default: true }
            });
            // console.log('length=1 *', splitNamespace, enable, newOptions);
          } else {
            delete newOptions['*'];
          }
        } else if (level === 0) {
          newOptions = _extends({}, newOptions, defineProperty({}, splitNamespace[0], { _default: enable, '*': enable }));
        } else {
          newOptions = _extends({}, newOptions, defineProperty({}, splitNamespace[0], _extends({}, newOptions[splitNamespace[0]], {
            _default: enable
          })));
        }
      } else {
        // console.log('length!=1', newOptions[splitNamespace[0]]);
        newOptions = _extends({}, newOptions, defineProperty({}, splitNamespace[0], _extends({}, newOptions[splitNamespace[0]], defineProperty({}, splitNamespace[1], enable))));
        // console.log('length!=1', splitNamespace, enable, newOptions);
      }
      return newOptions;
    };
  },


  /**
   * Enables given namespace (with saving to localStorage)
   * @param {string} namespace - namespace to be enabled
   * @param {number} level - if set to 0 and provided with outer namespace (like 'debug' and not 'debug:warning') the namespace with asterisk (e.g. 'debug:*') will be added as well
   * @return {void}
   */
  enableDebug: function enableDebug() {
    var namespace = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '*';
    var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    var debugOptions = debugTools$1.getDebugOptionsObject(debugTools$1.getFromLocalStorage());
    var modifiedDebugOptions = debugTools$1.changeDebugOption(true)(debugOptions, namespace, level);
    debugTools$1.setToLocalStorage(debugTools$1.getDebugOptionsString(modifiedDebugOptions));
  },


  /**
   * Disables given namespace (with saving to localStorage)
   * @param {string} namespace - namespace to be disabled
   * @param {number} level - if set to 0 and provided with outer namespace (like 'debug' and not 'debug:warning') the namespace with asterisk (e.g. 'debug:*') will be added as well
   * @return {void}
   */
  disableDebug: function disableDebug() {
    var namespace = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '*';
    var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    var debugOptions = debugTools$1.getDebugOptionsObject(debugTools$1.getFromLocalStorage());
    var modifiedDebugOptions = debugTools$1.changeDebugOption(false)(debugOptions, namespace, level);
    debugTools$1.setToLocalStorage(debugTools$1.getDebugOptionsString(modifiedDebugOptions));
  },


  /**
   * Returns current debug options from localStorage
   * @return {object} debug options as JS object
   */
  getDebugOptions: function getDebugOptions() {
    return this.getDebugOptionsObject(localStorage.getItem('debug'));
  }
};

var debugTools = debugTools$1;
var configureDebugger = debugTools.configureDebugger;
var resetDebugger = debugTools.clearLocalStorage;

exports.debugTools = debugTools;
exports.configureDebugger = configureDebugger;
exports.resetDebugger = resetDebugger;
exports['default'] = createLogger$1;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=debug-composer.js.map
