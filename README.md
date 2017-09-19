# Winston Plug & Play Logger

[![winston-pnp-logger](https://img.shields.io/npm/v/winston-pnp-logger.svg)](https://www.npmjs.com/package/winston-pnp-logger)

Mainly built for my own projects, this package provides an Plug & Play solution for the [Winston](https://www.npmjs.com/package/winston) multi-transport async logging library with multiple transports and logging to file.
There's only a very minimal configuration required to start using the logger.

## Installation

Download package with
```bash
npm install winston-pnp-logger --save
```

Add it to your project with JavaScript:
```js
var WinstonPnPLogger = require('winston-pnp-logger').WinstonPnPLogger;
var logger = new WinstonPnPLogger();
logger.info('Hello!');
```

Or if you're using ES6 / TypeScript:
```js
import { WinstonPnPLogger } from 'winston-pnp-logger';
const logger = new WinstonPnPLogger();
logger.info('Hello!');
```

Also add this when you're using Typescript:
```bash
npm install @types/winston --save-dev
```

## API

### WinstonPnPLogger(options)
The plugin class you instantiate to make it all work.

options, all values can be changed or left out entirely:
```js
var options = {
    // Directory to write log files to. Omit to disable file logging.
    logDir: './logs',

    // Enable or disable logging to JSON files, requires logDir option to be set.
    enableJson: true,

    // Include or exclude timestamps.
    showTimestamp: true,

    // Show milliseconds in timestamps.
    showMilliSeconds: false,

    // Print a line on instantiation.
    announceSelf: true
};
```

Example usage:
```js
var WinstonPnPLogger = require('winston-pnp-logger').WinstonPnPLogger;
var logger = new WinstonPnPLogger(options);
logger.info('Hello!');
```

### logger
An exported instance of WinstonPnPLogger that will be available after the initial creation of a WinstonPnPLogger instance.

Example usage:
```js
var logger = require('winston-pnp-logger').logger;
logger.info('Hello!');
```

### WinstonPnPLogger.error
Logger on the 'error' level.

Example usage:
```js
logger.error('Does not compute!');
```

### WinstonPnPLogger.warn
Logger on the 'warn' level.

Example usage:
```js
logger.warn('Here be dragons.');
```

### WinstonPnPLogger.info
Logger on the 'info' level.
With standard settings. On default settings, the console will log this an above levels.

Example usage:
```js
logger.info('Information: stowaway.');
```

### WinstonPnPLogger.debug
Logger on the 'debug' level (4).

Enable by setting the environment variable LEVEL to `'debug'` or `'silly'`.

Example usage:
```js
logger.debug('foo bar');
```

### WinstonPnPLogger.silly
Logger on the 'silly' level (5). This will not be logged to file.

Enable by setting the environment variable LEVEL to `'silly'`.

Example usage:
```js
logger.silly('This line is rather silly.');
```

### WinstonPnPLogger.winston
Access to the Winston logger API

Example usage:
```js
logger.winston.log('info', 'blog it');
```
```js
logger.winston.profile('test');
```

## Environment Variables
This package will respond to several environment variables, these have to be set **before** instantiating WinstonPnPLogger for them to have any effect.

### LEVEL
Sets the console output level, default is `'info'`.

### SILENT
Disables all console and file logging, but will still log errors to the console.
