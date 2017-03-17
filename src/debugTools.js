import _ from 'lodash';
import createLogger from './logger';

const logger = createLogger('debug-composer');

const debugTools = {
  /**
   * Gets debug settings from localStorage
   * @return {string} debug settings
   */
  getFromLocalStorage() {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('debug');
    }
    return '';
  },

  /**
   * Sets debug settings to localStorage
   * @param {string} value debug settings as string
   */
  setToLocalStorage(value) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('debug', value);
    }
  },

  /**
   * Clear debug options in localStorage
   */
  clearLocalStorage() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('debug');
    }
  },

  /**
   * Sets provided settings as string to localStorage
   * @param {object} settings - debug settings as js object
   * @param {string|number} enable - debug settings level to enable (the same as index in settings object to be set)
   */
  configureDebugger(settings, enable = 'default') {
    if (typeof settings !== 'object') {
      throw new Error(`Expected an object provided as the first argument to configureDebugger function. ${typeof settings} found instead.`);
    }
    if (!settings[enable]) {
      throw new Error(`Key ${enable} not found in settings file provided to configureDebugger method. As a second argument you must provide index from settings object`);
    }
    if (typeof settings[enable] !== 'object') {
      throw new Error(`Expected settings.${enable} to be an object. ${typeof settings[enable]} found instead`);
    }
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      logger.warning('It seems that you are using configureDebugger method in node.js or in outdated browser. It will not work as it needs browser environment with localStorage available.');
    }

    logger.info(`Setting debug for ${enable}`);

    let options = debugTools.getDebugOptionsObject(debugTools.getFromLocalStorage());
    _.forEach(settings[enable], (level, namespace) => {
      options = debugTools.changeDebugOption(level)(options, namespace);
    });
    debugTools.setToLocalStorage(debugTools.getDebugOptionsString(options));
  },

  /**
   * Converts debugString (as saved in localStorage) to object
   * @param {object} debugString - debug settings string
   * @return {object} debug setting object
   */
  getDebugOptionsObject(debugString) {
    if (!debugString) {
      return {};
    }
    let options = debugString;
    options = _.map(options.split(','), el => el.split(';'));
    options = _.flatten(options);
    options = _.reduce(options, (accu, val) => {
      const enabled = val.indexOf('-') !== 0;
      const split = val.replace(/^-/, '').split(':');
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
  getDebugOptionsString(optionsObject) {
    let options = optionsObject;
    options = _.reduce(options, (accu, namespaceOptions, namespaceName) => {
      _.forEach(namespaceOptions, (namespaceOption, subNamespaceName) => {
        if (subNamespaceName === '_default') {
          accu.push(`${namespaceOption ? '' : '-'}${namespaceName}`);
        } else {
          accu.push(`${namespaceOption ? '' : '-'}${namespaceName}:${subNamespaceName}`);
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
  changeDebugOption(enable) {
    /**
     * Function to be used for disabling/enabling namespaces
     * @param {object} optionsObject - debug options to be edited (as JS object)
     * @param {string} namespace - namespace to be enabled/disabled (e.g. 'socket.io-client' or 'mi18n-redux:info')
     * @param {number} level - if set to 0 and provided with outer namespace (like 'debug' and not 'debug:warning') the namespace with asterisk (e.g. 'debug:*') will be added as well
     * @return {object} new optionsObject - modified debug options as js object
     */
    return (optionsObject, namespace, level = 0) => {
      const splitNamespace = namespace.split(':');
      let newOptions = {
        ...optionsObject,
      };

      if (splitNamespace.length === 1) {
        // console.log('length=1', splitNamespace, enable, newOptions);
        if (namespace === '*') {
          if (enable) {
            newOptions = {
              ...newOptions,
              '*': { _default: true },
            };
            // console.log('length=1 *', splitNamespace, enable, newOptions);
          } else {
            delete newOptions['*'];
          }
        } else if (level === 0) {
          newOptions = {
            ...newOptions,
            [splitNamespace[0]]: { _default: enable, '*': enable },
          };
        } else {
          newOptions = {
            ...newOptions,
            [splitNamespace[0]]: {
              ...newOptions[splitNamespace[0]],
              _default: enable,
            },
          };
        }
      } else {
        // console.log('length!=1', newOptions[splitNamespace[0]]);
        newOptions = {
          ...newOptions,
          [splitNamespace[0]]: {
            ...newOptions[splitNamespace[0]],
            [splitNamespace[1]]: enable,
          },
        };
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
  enableDebug(namespace = '*', level = 0) {
    const debugOptions = debugTools.getDebugOptionsObject(debugTools.getFromLocalStorage());
    const modifiedDebugOptions = debugTools.changeDebugOption(true)(debugOptions, namespace, level);
    debugTools.setToLocalStorage(debugTools.getDebugOptionsString(modifiedDebugOptions));
  },

  /**
   * Disables given namespace (with saving to localStorage)
   * @param {string} namespace - namespace to be disabled
   * @param {number} level - if set to 0 and provided with outer namespace (like 'debug' and not 'debug:warning') the namespace with asterisk (e.g. 'debug:*') will be added as well
   * @return {void}
   */
  disableDebug(namespace = '*', level = 0) {
    const debugOptions = debugTools.getDebugOptionsObject(debugTools.getFromLocalStorage());
    const modifiedDebugOptions = debugTools.changeDebugOption(false)(debugOptions, namespace, level);
    debugTools.setToLocalStorage(debugTools.getDebugOptionsString(modifiedDebugOptions));
  },

  /**
   * Returns current debug options from localStorage
   * @return {object} debug options as JS object
   */
  getDebugOptions() {
    return this.getDebugOptionsObject(localStorage.getItem('debug'));
  },
};

export default debugTools;
