"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mkdirp = require("mkdirp");
var path = require("path");
var winston_1 = require("winston");
var WinstonDRF = require("winston-daily-rotate-file");
var WinstonPnPLogger = /** @class */ (function () {
    function WinstonPnPLogger(options) {
        var _this = this;
        if (exports.logger) {
            throw new Error('Do not create multiple WinstonPnPLogger instances, use the exposed instance through ' +
                '`require(\'winston-pnp-logger\').logger` or configure the options instead.');
        }
        this.options = options || {};
        // Default options set to true.
        this.jsonEnabled = this.options.enableJson !== false;
        this.showTimestamp = this.options.showTimestamp !== false;
        this.announceSelf = this.options.announceSelf !== false;
        this.showMilliSeconds = this.options.showMilliSeconds || false;
        var consoleLogLevel = process.env.LEVEL || 'info';
        var transportsList = [];
        transportsList.push(new winston_1.transports.Console({
            colorize: true,
            level: consoleLogLevel,
            timestamp: function () {
                return _this.getLogTimeStamp();
            }
        }));
        transportsList = this.createFileTransports(transportsList);
        if (process.env.SILENT === 'true') {
            // Only print errors and log nothing to file, useful in certain test cases.
            transportsList = [
                new winston_1.transports.Console({
                    colorize: true,
                    level: 'error',
                    timestamp: function () {
                        return _this.getLogTimeStamp();
                    }
                })
            ];
        }
        this.winston = new (winston_1.Logger)({ transports: transportsList });
        this.info = this.winston.info;
        this.warn = this.winston.warn;
        this.error = this.winston.error;
        this.debug = this.winston.debug;
        this.silly = this.winston.silly;
        // Expose this WinstonPnPLogger instance as the 'logger' export.
        exports.logger = this;
        if (this.announceSelf) {
            this.info('Winston Plug & Play Logger enabled');
        }
    }
    WinstonPnPLogger.prototype.createFileTransports = function (transportsList) {
        var _this = this;
        if (!this.options.logDir) {
            return transportsList;
        }
        var logDirs = {
            debug: path.join(this.options.logDir, '/debug/'),
            error: path.join(this.options.logDir, '/error/'),
            info: path.join(this.options.logDir, '/info/'),
            warn: path.join(this.options.logDir, '/warn/')
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
        transportsList.push(new WinstonDRF({
            datePattern: 'log_yyyy-MM-dd',
            filename: debugFilePath,
            json: false,
            level: 'debug',
            name: 'file#debug',
            prepend: true,
            timestamp: function () {
                return _this.getLogTimeStamp();
            }
        }));
        transportsList.push(new WinstonDRF({
            datePattern: 'log_yyyy-MM-dd',
            filename: logFilePath,
            json: false,
            level: 'info',
            name: 'file#log',
            prepend: true,
            timestamp: function () {
                return _this.getLogTimeStamp();
            }
        }));
        transportsList.push(new WinstonDRF({
            datePattern: 'log_yyyy-MM-dd',
            filename: warnFilePath,
            json: false,
            level: 'warn',
            name: 'file#warn',
            prepend: true,
            timestamp: function () {
                return _this.getLogTimeStamp();
            }
        }));
        transportsList.push(new WinstonDRF({
            datePattern: 'log_yyyy-MM-dd',
            filename: errFilePath,
            json: false,
            level: 'error',
            name: 'file#error',
            prepend: true,
            timestamp: function () {
                return _this.getLogTimeStamp();
            }
        }));
        if (this.jsonEnabled) {
            var debugFileJSONPath = logDirs.debug + '_json.log';
            var logFileJSONPath = logDirs.info + '_json.log';
            var warnFileJSONPath = logDirs.warn + '_json.log';
            var errFileJSONPath = logDirs.error + '_json.log';
            transportsList.push(new WinstonDRF({
                datePattern: 'log_yyyy-MM-dd',
                filename: debugFileJSONPath,
                level: 'debug',
                name: 'file#jsondebug',
                prepend: true,
                timestamp: function () {
                    return _this.getLogTimeStamp();
                }
            }));
            transportsList.push(new WinstonDRF({
                datePattern: 'log_yyyy-MM-dd',
                filename: logFileJSONPath,
                level: 'info',
                name: 'file#jsonlog',
                prepend: true,
                timestamp: function () {
                    return _this.getLogTimeStamp();
                }
            }));
            transportsList.push(new WinstonDRF({
                datePattern: 'log_yyyy-MM-dd',
                filename: warnFileJSONPath,
                level: 'warn',
                name: 'file#jsonwarn',
                prepend: true,
                timestamp: function () {
                    return _this.getLogTimeStamp();
                }
            }));
            transportsList.push(new WinstonDRF({
                datePattern: 'log_yyyy-MM-dd',
                filename: errFileJSONPath,
                level: 'error',
                name: 'file#jsonerror',
                prepend: true,
                timestamp: function () {
                    return _this.getLogTimeStamp();
                }
            }));
        }
        return transportsList;
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
