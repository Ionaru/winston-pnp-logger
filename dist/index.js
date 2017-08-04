"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var winston = require("winston");
var WinstonDRF = require("winston-daily-rotate-file");
var mkdirp = require("mkdirp");
var path = require("path");
var WinstonPnPLogger = (function () {
    function WinstonPnPLogger(options) {
        if (exports.logger) {
            throw new Error('Do not create multiple WinstonPnPLogger instances, use the exposed instance through ' +
                '`require(\'winston-pnp-logger\').logger` or configure the options instead.');
        }
        this.options = options || {};
        var scope = this;
        // Default options set to true.
        this.jsonEnabled = this.options.enableJson !== false;
        this.showTimestamp = this.options.showTimestamp !== false;
        this.announceSelf = this.options.announceSelf !== false;
        var consoleLogLevel = process.env.LEVEL || 'info';
        var transports = [];
        transports.push(new winston.transports.Console({
            level: consoleLogLevel,
            timestamp: function () {
                return scope.getLogTimeStamp();
            },
            colorize: true
        }));
        transports = this.createFileTransports(transports);
        if (process.env.SILENT === 'true') {
            // Only print errors and log nothing to file, useful in certain test cases.
            transports = [
                new winston.transports.Console({
                    level: 'error',
                    timestamp: function () {
                        return scope.getLogTimeStamp();
                    },
                    colorize: true
                })
            ];
        }
        this.winston = new (winston.Logger)({ transports: transports });
        this.info = this.winston.info;
        this.warn = this.winston.warn;
        this.error = this.winston.error;
        this.debug = this.winston.debug;
        this.silly = this.winston.silly;
        // Expose this WinstonPnPLogger instance as the 'logger' export.
        exports.logger = scope;
        if (this.announceSelf) {
            this.info('Winston Plug & Play Logger enabled');
        }
    }
    WinstonPnPLogger.prototype.createFileTransports = function (transports) {
        if (!this.options.logDir) {
            return transports;
        }
        var logDirs = {
            debug: path.join(this.options.logDir, '/debug/'),
            info: path.join(this.options.logDir, '/info/'),
            warn: path.join(this.options.logDir, '/warn/'),
            error: path.join(this.options.logDir, '/error/')
        };
        for (var dirKey in logDirs) {
            if (logDirs.hasOwnProperty(dirKey)) {
                mkdirp.sync(logDirs[dirKey]);
            }
        }
        var debugFilePath = logDirs.debug + '_plain.log';
        var logFilePath = logDirs.info + '_plain.log';
        var warnFilePath = logDirs.warn + '_plain.log';
        var errFilePath = logDirs.error + '_plain.log';
        transports.push(new WinstonDRF({
            name: 'file#debug',
            datePattern: 'log_yyyy-MM-dd',
            level: 'debug',
            prepend: true,
            timestamp: function () {
                return exports.logger.getLogTimeStamp();
            },
            filename: debugFilePath,
            json: false
        }));
        transports.push(new WinstonDRF({
            name: 'file#log',
            datePattern: 'log_yyyy-MM-dd',
            level: 'info',
            prepend: true,
            timestamp: function () {
                return exports.logger.getLogTimeStamp();
            },
            filename: logFilePath,
            json: false
        }));
        transports.push(new WinstonDRF({
            name: 'file#warn',
            datePattern: 'log_yyyy-MM-dd',
            level: 'warn',
            prepend: true,
            timestamp: function () {
                return exports.logger.getLogTimeStamp();
            },
            filename: warnFilePath,
            json: false
        }));
        transports.push(new WinstonDRF({
            name: 'file#error',
            datePattern: 'log_yyyy-MM-dd',
            level: 'error',
            prepend: true,
            timestamp: function () {
                return exports.logger.getLogTimeStamp();
            },
            filename: errFilePath,
            json: false
        }));
        if (this.jsonEnabled) {
            var debugFileJSONPath = logDirs.debug + '_json.log';
            var logFileJSONPath = logDirs.info + '_json.log';
            var warnFileJSONPath = logDirs.warn + '_json.log';
            var errFileJSONPath = logDirs.error + '_json.log';
            transports.push(new WinstonDRF({
                name: 'file#jsondebug',
                datePattern: 'log_yyyy-MM-dd',
                level: 'debug',
                prepend: true,
                timestamp: function () {
                    return exports.logger.getLogTimeStamp();
                },
                filename: debugFileJSONPath
            }));
            transports.push(new WinstonDRF({
                name: 'file#jsonlog',
                datePattern: 'log_yyyy-MM-dd',
                level: 'info',
                prepend: true,
                timestamp: function () {
                    return exports.logger.getLogTimeStamp();
                },
                filename: logFileJSONPath
            }));
            transports.push(new WinstonDRF({
                name: 'file#jsonwarn',
                datePattern: 'log_yyyy-MM-dd',
                level: 'warn',
                prepend: true,
                timestamp: function () {
                    return exports.logger.getLogTimeStamp();
                },
                filename: warnFileJSONPath
            }));
            transports.push(new WinstonDRF({
                name: 'file#jsonerror',
                datePattern: 'log_yyyy-MM-dd',
                level: 'error',
                prepend: true,
                timestamp: function () {
                    return exports.logger.getLogTimeStamp();
                },
                filename: errFileJSONPath
            }));
        }
        return transports;
    };
    WinstonPnPLogger.prototype.getLogTimeStamp = function () {
        if (!this.showTimestamp) {
            return '';
        }
        var now = new Date();
        var year = now.getFullYear();
        var month = ('0' + (now.getMonth() + 1)).slice(-2);
        var day = ('0' + now.getDate()).slice(-2);
        var hour = ('0' + now.getHours()).slice(-2);
        var minute = ('0' + now.getMinutes()).slice(-2);
        var second = ('0' + now.getSeconds()).slice(-2);
        var date = [year, month, day].join('-');
        var time = [hour, minute, second].join(':');
        if (this.showMilliSeconds) {
            var milliseconds = ('0' + now.getMilliseconds()).slice(-3);
            time += '.' + milliseconds;
        }
        return [date, time].join(' ');
    };
    return WinstonPnPLogger;
}());
exports.WinstonPnPLogger = WinstonPnPLogger;
