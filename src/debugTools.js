const debugTools = {
  getFromLocalStorage() {
    if (localStorage) {
      return localStorage.getItem('debug');
    }
    return '';
  },
  setToLocalStorage(value) {
    if (localStorage) {
      localStorage.setItem('debug', value);
    }
  },
  configureDebugger(enable = false) {
    // level: 0 - completely disabled/enabled; 1 - specific disabled/enabled;
    const productionEnabledDebuggers = {

    };
    const developmentDisabledDebuggers = {
      'socket.io-client': 0,
      'engine.io-client': 0,
      'socket.io-parser': 0,
      'mi18n-redux:info': 1,
    };
    let options = debugTools.getDebugOptionsObject(debugTools.getFromLocalStorage());
    if (enable) {
      options = debugTools.changeDebugOption(true)(options, '*');
      _.forEach(developmentDisabledDebuggers, (level, namespace) => {
        options = debugTools.changeDebugOption(false)(options, namespace, level);
      });
    } else {
      options = debugTools.changeDebugOption(false)(options, '*');
      _.forEach(productionEnabledDebuggers, (level, namespace) => {
        options = debugTools.changeDebugOption(true)(options, namespace, level);
      });
    }
    debugTools.setToLocalStorage(debugTools.getDebugOptionsString(options));
  },
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
  changeDebugOption(enable) {
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
          }
        };
        // console.log('length!=1', splitNamespace, enable, newOptions);
      }
      return newOptions;
    };
  },
  enableDebug(namespace = '*', level = 0) {
    const debugOptions = debugTools.getDebugOptionsObject(debugTools.getFromLocalStorage());
    const modifiedDebugOptions = debugTools.changeDebugOption(true)(debugOptions, namespace, level);
    debugTools.setToLocalStorage(debugTools.getDebugOptionsString(modifiedDebugOptions));
  },
  disableDebug(namespace = '*', level = 0) {
    const debugOptions = debugTools.getDebugOptionsObject(debugTools.getFromLocalStorage());
    const modifiedDebugOptions = debugTools.changeDebugOption(false)(debugOptions, namespace, level);
    debugTools.setToLocalStorage(debugTools.getDebugOptionsString(modifiedDebugOptions));
  },
  getDebugOptions() {
    return this.getDebugOptionsObject(localStorage.getItem('debug'));
  }
};

export default debugTools;

// debugTools.configureDebugger(process.env.ENVIRONMENT === 'development');
