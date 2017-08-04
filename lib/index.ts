import winston = require('winston');
import WinstonDRF = require('winston-daily-rotate-file');
import mkdirp = require('mkdirp');
import path = require('path');

import TransportInstance = winston.TransportInstance;
import LoggerInstance = winston.LoggerInstance;
import {LeveledLogMethod} from 'winston';

interface LogDirs {
    [key: string]: string;

    debug: string;
    info: string;
    warn: string;
    error: string;
}

export let logger: WinstonPnPLogger;

export interface Options {
    logDir?: string;
    enableJson?: boolean;
    showTimestamp?: boolean;
    showMilliSeconds?: boolean;
    announceSelf?: boolean;
}

export class WinstonPnPLogger {

    public info: LeveledLogMethod;
    public warn: LeveledLogMethod;
    public error: LeveledLogMethod;
    public debug: LeveledLogMethod;
    public silly: LeveledLogMethod;
    public winston: LoggerInstance;

    private options: Options;

    private jsonEnabled: boolean;
    private showTimestamp: boolean;
    private showMilliSeconds: boolean;
    private announceSelf: boolean;

    constructor(options?: Options) {
        if(logger) {
            throw new Error('Do not create multiple WinstonPnPLogger instances, use the exposed instance through ' +
                '`require(\'winston-pnp-logger\').logger` or configure the options instead.')
        }

        this.options = options || {};

        const scope = this;

        // Default options set to true.
        this.jsonEnabled = this.options.enableJson !== false;
        this.showTimestamp = this.options.showTimestamp !== false;
        this.announceSelf = this.options.announceSelf !== false;

        const consoleLogLevel = process.env.LEVEL || 'info';
        let transports: Array<TransportInstance> = [];

        transports.push(
            new winston.transports.Console({
                level: consoleLogLevel,
                timestamp: function (): string {
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
                    timestamp: function (): string {
                        return scope.getLogTimeStamp();
                    },
                    colorize: true
                })
            ];
        }

        this.winston = new (winston.Logger)({transports: transports});
        this.info = this.winston.info;
        this.warn = this.winston.warn;
        this.error = this.winston.error;
        this.debug = this.winston.debug;
        this.silly = this.winston.silly;

        // Expose this WinstonPnPLogger instance as the 'logger' export.
        logger = scope;

        if(this.announceSelf) {
            this.info('Winston Plug & Play Logger enabled');
        }
    }

    private createFileTransports(transports: Array<TransportInstance>): Array<TransportInstance> {
        if (!this.options.logDir) {
            return transports;
        }

        const logDirs: LogDirs = {
            debug: path.join(this.options.logDir, '/debug/'),
            info: path.join(this.options.logDir, '/info/'),
            warn: path.join(this.options.logDir, '/warn/'),
            error: path.join(this.options.logDir, '/error/')
        };

        for (const dirKey in logDirs) {
            if (logDirs.hasOwnProperty(dirKey)) {
                mkdirp.sync(logDirs[dirKey]);
            }
        }

        const debugFilePath = logDirs.debug + '_plain.log';
        const logFilePath = logDirs.info + '_plain.log';
        const warnFilePath = logDirs.warn + '_plain.log';
        const errFilePath = logDirs.error + '_plain.log';

        transports.push(
            new WinstonDRF({
                name: 'file#debug',
                datePattern: 'log_yyyy-MM-dd',
                level: 'debug',
                prepend: true,
                timestamp: function (): string {
                    return logger.getLogTimeStamp();
                },
                filename: debugFilePath,
                json: false
            }));

        transports.push(
            new WinstonDRF({
                name: 'file#log',
                datePattern: 'log_yyyy-MM-dd',
                level: 'info',
                prepend: true,
                timestamp: function (): string {
                    return logger.getLogTimeStamp();
                },
                filename: logFilePath,
                json: false
            }));

        transports.push(
            new WinstonDRF({
                name: 'file#warn',
                datePattern: 'log_yyyy-MM-dd',
                level: 'warn',
                prepend: true,
                timestamp: function (): string {
                    return logger.getLogTimeStamp();
                },
                filename: warnFilePath,
                json: false
            }));

        transports.push(
            new WinstonDRF({
                name: 'file#error',
                datePattern: 'log_yyyy-MM-dd',
                level: 'error',
                prepend: true,
                timestamp: function (): string {
                    return logger.getLogTimeStamp();
                },
                filename: errFilePath,
                json: false
            }));

        if (this.jsonEnabled) {
            const debugFileJSONPath = logDirs.debug + '_json.log';
            const logFileJSONPath = logDirs.info + '_json.log';
            const warnFileJSONPath = logDirs.warn + '_json.log';
            const errFileJSONPath = logDirs.error + '_json.log';

            transports.push(
                new WinstonDRF({
                    name: 'file#jsondebug',
                    datePattern: 'log_yyyy-MM-dd',
                    level: 'debug',
                    prepend: true,
                    timestamp: function (): string {
                        return logger.getLogTimeStamp();
                    },
                    filename: debugFileJSONPath
                }));

            transports.push(
                new WinstonDRF({
                    name: 'file#jsonlog',
                    datePattern: 'log_yyyy-MM-dd',
                    level: 'info',
                    prepend: true,
                    timestamp: function (): string {
                        return logger.getLogTimeStamp();
                    },
                    filename: logFileJSONPath
                }));

            transports.push(
                new WinstonDRF({
                    name: 'file#jsonwarn',
                    datePattern: 'log_yyyy-MM-dd',
                    level: 'warn',
                    prepend: true,
                    timestamp: function (): string {
                        return logger.getLogTimeStamp();
                    },
                    filename: warnFileJSONPath
                }));

            transports.push(
                new WinstonDRF({
                    name: 'file#jsonerror',
                    datePattern: 'log_yyyy-MM-dd',
                    level: 'error',
                    prepend: true,
                    timestamp: function (): string {
                        return logger.getLogTimeStamp();
                    },
                    filename: errFileJSONPath
                }));
        }

        return transports;
    }

    private getLogTimeStamp(): string {
        if(!this.showTimestamp) {
            return '';
        }

        const now = new Date();
        const year = now.getFullYear();
        const month = ('0' + (now.getMonth() + 1)).slice(-2);
        const day = ('0' + now.getDate()).slice(-2);
        const hour = ('0' + now.getHours()).slice(-2);
        const minute = ('0' + now.getMinutes()).slice(-2);
        const second = ('0' + now.getSeconds()).slice(-2);

        const date = [year, month, day].join('-');
        let time = [hour, minute, second].join(':');

        if(this.showMilliSeconds) {
            const milliseconds = ('0' + now.getMilliseconds()).slice(-3);
            time += '.' + milliseconds;
        }

        return [date, time].join(' ');
    }
}
