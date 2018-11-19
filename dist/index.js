"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mkdirp = require("mkdirp");
var path = require("path");
var winston_1 = require("winston");
var WinstonDRF = require("winston-daily-rotate-file");
var WinstonPnPLogger = /** @class */ (function () {
    function WinstonPnPLogger(options) {
        var _this = this;
        this.pnpFormatter = winston_1.format(function (info) {
            var timestamp = _this.getLogTimeStamp();
            info.level = timestamp + " - " + info.level;
            return info;
        });
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
            format: winston_1.format.combine(winston_1.format.colorize(), this.pnpFormatter(), winston_1.format.simple()),
            level: consoleLogLevel,
        }));
        transportsList = this.createFileTransports(transportsList);
        if (process.env.SILENT === 'true') {
            // Only print errors and log nothing to file, useful in certain test cases.
            transportsList = [
                new winston_1.transports.Console({
                    format: winston_1.format.combine(winston_1.format.colorize(), this.pnpFormatter(), winston_1.format.simple()),
                    level: 'error',
                }),
            ];
        }
        this.winston = winston_1.createLogger({ transports: transportsList });
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
        if (!this.options.logDir) {
            return transportsList;
        }
        var logDirs = {
            debug: path.join(this.options.logDir, '/debug/'),
            error: path.join(this.options.logDir, '/error/'),
            info: path.join(this.options.logDir, '/info/'),
            warn: path.join(this.options.logDir, '/warn/'),
        };
        for (var dirKey in logDirs) {
            if (logDirs.hasOwnProperty(dirKey)) {
                mkdirp.sync(logDirs[dirKey]);
            }
        }
        var debugFilePath = logDirs.debug + 'log_%DATE%_plain.log';
        var logFilePath = logDirs.info + 'log_%DATE%_plain.log';
        var warnFilePath = logDirs.warn + 'log_%DATE%_plain.log';
        var errFilePath = logDirs.error + 'log_%DATE%_plain.log';
        transportsList.push(new WinstonDRF({
            datePattern: 'YYYY-MM-DD',
            filename: debugFilePath,
            format: winston_1.format.combine(this.pnpFormatter(), winston_1.format.simple()),
            json: false,
            level: 'debug',
        }));
        transportsList.push(new WinstonDRF({
            datePattern: 'YYYY-MM-DD',
            filename: logFilePath,
            format: winston_1.format.combine(this.pnpFormatter(), winston_1.format.simple()),
            json: false,
            level: 'info',
        }));
        transportsList.push(new WinstonDRF({
            datePattern: 'YYYY-MM-DD',
            filename: warnFilePath,
            format: winston_1.format.combine(this.pnpFormatter(), winston_1.format.simple()),
            json: false,
            level: 'warn',
        }));
        transportsList.push(new WinstonDRF({
            datePattern: 'YYYY-MM-DD',
            filename: errFilePath,
            format: winston_1.format.combine(this.pnpFormatter(), winston_1.format.simple()),
            json: false,
            level: 'error',
        }));
        if (this.jsonEnabled) {
            var debugFileJSONPath = logDirs.debug + 'log_%DATE%_json.log';
            var logFileJSONPath = logDirs.info + 'log_%DATE%_json.log';
            var warnFileJSONPath = logDirs.warn + 'log_%DATE%_json.log';
            var errFileJSONPath = logDirs.error + 'log_%DATE%_json.log';
            transportsList.push(new WinstonDRF({
                datePattern: 'YYYY-MM-DD',
                filename: debugFileJSONPath,
                format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.json()),
                level: 'debug',
            }));
            transportsList.push(new WinstonDRF({
                datePattern: 'YYYY-MM-DD',
                filename: logFileJSONPath,
                format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.json()),
                level: 'info',
            }));
            transportsList.push(new WinstonDRF({
                datePattern: 'YYYY-MM-DD',
                filename: warnFileJSONPath,
                format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.json()),
                level: 'warn',
            }));
            transportsList.push(new WinstonDRF({
                datePattern: 'YYYY-MM-DD',
                filename: errFileJSONPath,
                format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.json()),
                level: 'error',
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
            var milliseconds = ('00' + now.getMilliseconds()).slice(-3);
            time += '.' + milliseconds;
        }
        return [date, time].join(' ');
    };
    return WinstonPnPLogger;
}());
exports.WinstonPnPLogger = WinstonPnPLogger;
//# sourceMappingURL=index.js.map