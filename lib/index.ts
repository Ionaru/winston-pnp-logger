import * as mkdirp from 'mkdirp';
import * as path from 'path';
import { createLogger, format, LeveledLogMethod, Logger, transports } from 'winston';
import * as WinstonDRF from 'winston-daily-rotate-file';
import * as TransportStream from 'winston-transport';

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

    public error: LeveledLogMethod;
    public warn: LeveledLogMethod;
    public info: LeveledLogMethod;
    public debug: LeveledLogMethod;
    public silly: LeveledLogMethod;

    public winston: Logger;

    private options: IOptions;

    private readonly jsonEnabled: boolean;
    private readonly showTimestamp: boolean;
    private readonly showMilliSeconds: boolean;
    private readonly announceSelf: boolean;

    private readonly pnpFormatter = format((info) => {
        const timestamp = this.getLogTimeStamp();
        info.level = `${timestamp} - ${info.level}`;
        return info;
    });

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

        this.showMilliSeconds = this.options.showMilliSeconds || false;

        const consoleLogLevel = process.env.LEVEL || 'info';
        let transportsList: TransportStream[] = [];

        transportsList.push(
            new transports.Console({
                format: format.combine(
                    format.colorize(),
                    this.pnpFormatter(),
                    format.simple(),
                ),
                level: consoleLogLevel,
            }));

        transportsList = this.createFileTransports(transportsList);

        if (process.env.SILENT === 'true') {
            // Only print errors and log nothing to file, useful in certain test cases.
            transportsList = [
                new transports.Console({
                    format: format.combine(
                        format.colorize(),
                        this.pnpFormatter(),
                        format.simple(),
                    ),
                    level: 'error',
                }),
            ];
        }

        this.winston = createLogger({transports: transportsList});
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

    private createFileTransports(transportsList: TransportStream[]): TransportStream[] {
        if (!this.options.logDir) {
            return transportsList;
        }

        const logDirs: ILogDirs = {
            debug: path.join(this.options.logDir, '/debug/'),
            error: path.join(this.options.logDir, '/error/'),
            info: path.join(this.options.logDir, '/info/'),
            warn: path.join(this.options.logDir, '/warn/'),
        };

        for (const dirKey in logDirs) {
            if (logDirs.hasOwnProperty(dirKey)) {
                mkdirp.sync(logDirs[dirKey]);
            }
        }

        const debugFilePath = logDirs.debug + 'log_%DATE%_plain.log';
        const logFilePath = logDirs.info + 'log_%DATE%_plain.log';
        const warnFilePath = logDirs.warn + 'log_%DATE%_plain.log';
        const errFilePath = logDirs.error + 'log_%DATE%_plain.log';

        transportsList.push(
            new WinstonDRF({
                datePattern: 'YYYY-MM-DD',
                filename: debugFilePath,
                format: format.combine(
                    this.pnpFormatter(),
                    format.simple(),
                ),
                json: false,
                level: 'debug',
            }));

        transportsList.push(
            new WinstonDRF({
                datePattern: 'YYYY-MM-DD',
                filename: logFilePath,
                format: format.combine(
                    this.pnpFormatter(),
                    format.simple(),
                ),
                json: false,
                level: 'info',
            }));

        transportsList.push(
            new WinstonDRF({
                datePattern: 'YYYY-MM-DD',
                filename: warnFilePath,
                format: format.combine(
                    this.pnpFormatter(),
                    format.simple(),
                ),
                json: false,
                level: 'warn',
            }));

        transportsList.push(
            new WinstonDRF({
                datePattern: 'YYYY-MM-DD',
                filename: errFilePath,
                format: format.combine(
                    this.pnpFormatter(),
                    format.simple(),
                ),
                json: false,
                level: 'error',
            }));

        if (this.jsonEnabled) {
            const debugFileJSONPath = logDirs.debug + 'log_%DATE%_json.log';
            const logFileJSONPath = logDirs.info + 'log_%DATE%_json.log';
            const warnFileJSONPath = logDirs.warn + 'log_%DATE%_json.log';
            const errFileJSONPath = logDirs.error + 'log_%DATE%_json.log';

            transportsList.push(
                new WinstonDRF({
                    datePattern: 'YYYY-MM-DD',
                    filename: debugFileJSONPath,
                    format: format.combine(
                        format.timestamp(),
                        format.json(),
                    ),
                    level: 'debug',
                }));

            transportsList.push(
                new WinstonDRF({
                    datePattern: 'YYYY-MM-DD',
                    filename: logFileJSONPath,
                    format: format.combine(
                        format.timestamp(),
                        format.json(),
                    ),
                    level: 'info',
                }));

            transportsList.push(
                new WinstonDRF({
                    datePattern: 'YYYY-MM-DD',
                    filename: warnFileJSONPath,
                    format: format.combine(
                        format.timestamp(),
                        format.json(),
                    ),
                    level: 'warn',
                }));

            transportsList.push(
                new WinstonDRF({
                    datePattern: 'YYYY-MM-DD',
                    filename: errFileJSONPath,
                    format: format.combine(
                        format.timestamp(),
                        format.json(),
                    ),
                    level: 'error',
                }));
        }

        return transportsList;
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
            const milliseconds = ('00' + now.getMilliseconds()).slice(-3);
            time += '.' + milliseconds;
        }

        return [date, time].join(' ');
    }
}
