# Debug composer
> Easy and clean wrapper for great debug utility

Wrapper for [debug](https://github.com/visionmedia/debug) utility that provides clean and dead simple API

## FAQ
#### Why this exists?
Just to be able to call debug logger methods in a cleaner way and make debug configuration (that in localStorage in browser) much simpler.

#### I found a bug! What should I do?
Feel free to make a pull request. All contributions are appreciated! 

## Usage

#### Creating logger
```javascript
import createLogger from 'debug-composer';

const logger = createLogger('yourNamespace');
```

#### Using logger
```javascript

// this will be same as calling debug(yourNamespace:info)('Not so important message')
logger.info('Not so important message'); // yourNamespace:info Not so important message
```

You can use one of predefined methods:
 * log
 * info
 * warn
 * error
 * debug

Or add you own:
```javascript
logger.add('someCustomMethod');
logger.someCustomMethod('My message'); // yourNamespace:someCustomMethod My message

// add returns added method
logger.add('someOtherMethod')('Another message'); // yourNamespace:someOtherMethod Another message

// you can add more methods at once (but in this case add will not return any of added methods)
logger.add(['firstMethod', 'secondMethod']);
logger.secondMethod('Second message'); // yourNamespace:secondMethod Second message
```

#### Good practices with logger
* Use namespace that is exactly the same as name of your library
* Try to use methods names wisely:
  * if your lib/application has distinctive parts/features (e.g. AuthService or name of the react component) use their names as methods
  * if not you can also use methods like warn, info, debug, error, critical etc. to distinguish importance of a message
  
  
#### Using configureDebugger method
> NOTE: configureDebugger method works only in browser (where localStorage is available). You can set these options in node by using [DEBUG environment variable](https://github.com/visionmedia/debug#environment-variables).
```javascript
import { configureDebugger, resetDebugger } from 'debug-composer';

const settings = {
  development: {
    '*': true,
    'socket.io-client': false,
    'socket.io-client:*': false,
  },
  production: {
    'veryImportantLib:veryImportantLogs': true,
  },
};

resetDebugger(); // we can remove all previous configuration from localStorage
configureDebugger(settings, environment); // if you're using webpack and webpack.DefinePlugin you can make process.env.NODE_ENV available to the browser

/* ==================================== */

const settings = {
  default: {
    '*': true,
    'socket.io-client': false,
    'socket.io-client:*': false,
  },
  production: {
    'veryImportantLib:veryImportantLogs': true,
  },
};

configureDebugger(settings, undefined); // default settings will be applied

/* ====================================== */

const settings = {
  '*': true,
  'socket.io-client': false,
  'socket.io-client:*': false,
};

configureDebugger(settings); // just settings object will be applied when environment is not provided
```

This will create configuration string and save it in localStorage. You will need to reload the page for changes to take effect.

#### Additional logger functionality
```javascript
import createLogger from 'debug-composer';
const logger = createLogger('yourNamespace');

// measure time - method 1 - measuring code executed once, or large part of the code
logger.time('someName', true); // second param indicates if current time should be logged to console (as yourNamespace:performance). Optional, defaults to false.
myRenderFunction();
let timeInMiliseconds = logger.timeEnd('someName', true); // second param indicates if measured time should be logged to console (as yourNamespace:performance). Optional, defaults to true.

// measure time - method 2 - measuring code executed 10000 times
timeInMiliseconds = logger.testPerformance(() => {
  // here goes code to test
}, 10000, false); // third param indicates if time should be logged to console (as yourNamespace:performance)

// get stacktrace
logger.debug(logger.stacktrace()); // array of strings
logger.debug(logger.stacktrace(true)); // array of objects
```
