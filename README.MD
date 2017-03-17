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

// you can use any method
logger.someStupendeslyLongMethodNameThatICanUseWithoutDeclaringIt('My message');

```

#### Good practises with logger
* Use namespace that is exactly the same as name of your library
* Try to use methods names wisely:
  * if your lib/application has distinctive parts/features use their names as methods
  * if not you can also use methods like warn, info, debug, error, critical etc. to distinguish importance of a message
  
  
#### Using configureDebugger method
> NOTE: configureDebugger method works only in browser (where localStorage is available). You can set these options in node by using DEBUG environment variable.
```javascript
import { configureDebugger, resetDebugger } from 'debug-composer';

const settings = {
  development: {
    '*': true,
    'socket.io-client': false,
    'socket.io-client:*': false,
    'engine.io-client': false,
    'engine.io-client:*': false,
    'socket.io-parser': false,
    'socket.io-parser:*': false,
    'mi18n-redux:*': true,
  },
  production: {
    'veryImportantLib:veryImportantLogs': true,
  },
};

resetDebugger(); // we can remove all previous configuration from localStorage
configureDebugger(settings, environment); // if you're using webpack and webpack.DefinePlugin you can make process.env.NODE_ENV available to the browser

```
This will create configuration string and save it in localStorage. You will need to reload the page for changes to take effect.