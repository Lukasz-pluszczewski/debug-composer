import _ from 'lodash';
import debug from 'debug';

var createLogger$1 = function createLogger(namespace) {
  var addToGlobals = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var debugInstances = {};
  var logger = new Proxy({}, {
    get: function get(target, name) {
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

var debugTools = {
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
   * @param {string|number} enable - debug settings level to enable (the same as index in settings object to be set)
   */
  configureDebugger: function configureDebugger(settings) {
    var enable = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'default';

    if ((typeof settings === 'undefined' ? 'undefined' : _typeof(settings)) !== 'object') {
      throw new Error('Expected an object provided as the first argument to configureDebugger function. ' + (typeof settings === 'undefined' ? 'undefined' : _typeof(settings)) + ' found instead.');
    }
    if (!settings[enable]) {
      throw new Error('Key ' + enable + ' not found in settings file provided to configureDebugger method. As a second argument you must provide index from settings object');
    }
    if (_typeof(settings[enable]) !== 'object') {
      throw new Error('Expected settings.' + enable + ' to be an object. ' + _typeof(settings[enable]) + ' found instead');
    }
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      logger.warning('It seems that you are using configureDebugger method in node.js or in outdated browser. It will not work as it needs browser environment with localStorage available.');
    }

    logger.info('Setting debug for ' + enable);

    var options = debugTools.getDebugOptionsObject(debugTools.getFromLocalStorage());
    _.forEach(settings[enable], function (level, namespace) {
      options = debugTools.changeDebugOption(level)(options, namespace);
    });
    debugTools.setToLocalStorage(debugTools.getDebugOptionsString(options));
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

    var debugOptions = debugTools.getDebugOptionsObject(debugTools.getFromLocalStorage());
    var modifiedDebugOptions = debugTools.changeDebugOption(true)(debugOptions, namespace, level);
    debugTools.setToLocalStorage(debugTools.getDebugOptionsString(modifiedDebugOptions));
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

    var debugOptions = debugTools.getDebugOptionsObject(debugTools.getFromLocalStorage());
    var modifiedDebugOptions = debugTools.changeDebugOption(false)(debugOptions, namespace, level);
    debugTools.setToLocalStorage(debugTools.getDebugOptionsString(modifiedDebugOptions));
  },


  /**
   * Returns current debug options from localStorage
   * @return {object} debug options as JS object
   */
  getDebugOptions: function getDebugOptions() {
    return this.getDebugOptionsObject(localStorage.getItem('debug'));
  }
};

var configureDebugger = debugTools.configureDebugger;
var resetDebugger = debugTools.clearLocalStorage;

export { configureDebugger, resetDebugger };export default createLogger$1;
//# sourceMappingURL=debug-composer.mjs.map
