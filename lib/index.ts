import winston = require('winston');
import WinstonDRF = require('winston-daily-rotate-file');
import mkdirp = require('mkdirp');
import path = require('path');

import TransportInstance = winston.TransportInstance;
import LoggerInstance = winston.LoggerInstance;
import {LeveledLogMethod} from 'winston';

interface ILogDirs {
    [key: string]: string;

    debug: string;
    info: string;
    warn: string;
    error: string;
}

export let logger: WinstonPnPLogger;

export interface IOptions {
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

    private options: IOptions;

    private jsonEnabled: boolean;
    private showTimestamp: boolean;
    private showMilliSeconds: boolean;
    private announceSelf: boolean;

    constructor(options?: IOptions) {
        if (logger) {
            throw new Error('Do not create multiple WinstonPnPLogger instances, use the exposed instance through ' +
                '`require(\'winston-pnp-logger\').logger` or configure the options instead.');
        }

        this.options = options || {};

        // Default options set to true.
        this.jsonEnabled = this.options.enableJson !== false;
        this.showTimestamp = this.options.showTimestamp !== false;
        this.announceSelf = this.options.announceSelf !== false;

        const consoleLogLevel = process.env.LEVEL || 'info';
        let transports: TransportInstance[] = [];

        transports.push(
            new winston.transports.Console({
                colorize: true,
                level: consoleLogLevel,
                timestamp: (): string => {
                    return this.getLogTimeStamp();
                }
            }));

        transports = this.createFileTransports(transports);

        if (process.env.SILENT === 'true') {
            // Only print errors and log nothing to file, useful in certain test cases.
            transports = [
                new winston.transports.Console({
                    colorize: true,
                    level: 'error',
                    timestamp: (): string => {
                        return this.getLogTimeStamp();
                    }
                })
            ];
        }

        this.winston = new (winston.Logger)({transports});
        this.info = this.winston.info;
        this.warn = this.winston.warn;
        this.error = this.winston.error;
        this.debug = this.winston.debug;
        this.silly = this.winston.silly;

        // Expose this WinstonPnPLogger instance as the 'logger' export.
        logger = this;

        if (this.announceSelf) {
            this.info('Winston Plug & Play Logger enabled');
        }
    }

    private createFileTransports(transports: TransportInstance[]): TransportInstance[] {
        if (!this.options.logDir) {
            return transports;
        }

        const logDirs: ILogDirs = {
            debug: path.join(this.options.logDir, '/debug/'),
            error: path.join(this.options.logDir, '/error/'),
            info: path.join(this.options.logDir, '/info/'),
            warn: path.join(this.options.logDir, '/warn/')
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
                datePattern: 'log_yyyy-MM-dd',
                filename: debugFilePath,
                json: false,
                level: 'debug',
                name: 'file#debug',
                prepend: true,
                timestamp: (): string => {
                    return this.getLogTimeStamp();
                }
            }));

        transports.push(
            new WinstonDRF({
                datePattern: 'log_yyyy-MM-dd',
                filename: logFilePath,
                json: false,
                level: 'info',
                name: 'file#log',
                prepend: true,
                timestamp: (): string => {
                    return this.getLogTimeStamp();
                }
            }));

        transports.push(
            new WinstonDRF({
                datePattern: 'log_yyyy-MM-dd',
                filename: warnFilePath,
                json: false,
                level: 'warn',
                name: 'file#warn',
                prepend: true,
                timestamp: (): string => {
                    return this.getLogTimeStamp();
                }
            }));

        transports.push(
            new WinstonDRF({
                datePattern: 'log_yyyy-MM-dd',
                filename: errFilePath,
                json: false,
                level: 'error',
                name: 'file#error',
                prepend: true,
                timestamp: (): string => {
                    return this.getLogTimeStamp();
                }
            }));

        if (this.jsonEnabled) {
            const debugFileJSONPath = logDirs.debug + '_json.log';
            const logFileJSONPath = logDirs.info + '_json.log';
            const warnFileJSONPath = logDirs.warn + '_json.log';
            const errFileJSONPath = logDirs.error + '_json.log';

            transports.push(
                new WinstonDRF({
                    datePattern: 'log_yyyy-MM-dd',
                    filename: debugFileJSONPath,
                    level: 'debug',
                    name: 'file#jsondebug',
                    prepend: true,
                    timestamp: (): string => {
                        return this.getLogTimeStamp();
                    }
                }));

            transports.push(
                new WinstonDRF({
                    datePattern: 'log_yyyy-MM-dd',
                    filename: logFileJSONPath,
                    level: 'info',
                    name: 'file#jsonlog',
                    prepend: true,
                    timestamp: (): string => {
                        return this.getLogTimeStamp();
                    }
                }));

            transports.push(
                new WinstonDRF({
                    datePattern: 'log_yyyy-MM-dd',
                    filename: warnFileJSONPath,
                    level: 'warn',
                    name: 'file#jsonwarn',
                    prepend: true,
                    timestamp: (): string => {
                        return this.getLogTimeStamp();
                    }
                }));

            transports.push(
                new WinstonDRF({
                    datePattern: 'log_yyyy-MM-dd',
                    filename: errFileJSONPath,
                    level: 'error',
                    name: 'file#jsonerror',
                    prepend: true,
                    timestamp: (): string => {
                        return this.getLogTimeStamp();
                    }
                }));
        }

        return transports;
    }

    private getLogTimeStamp(): string {
        if (!this.showTimestamp) {
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

        if (this.showMilliSeconds) {
            const milliseconds = ('0' + now.getMilliseconds()).slice(-3);
            time += '.' + milliseconds;
        }

        return [date, time].join(' ');
    }
}
