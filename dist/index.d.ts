/// <reference types="winston" />
import winston = require('winston');
import LoggerInstance = winston.LoggerInstance;
import { LeveledLogMethod } from 'winston';
export declare let logger: WinstonPnPLogger;
export interface Options {
    logDir?: string;
    enableJson?: boolean;
    showTimestamp?: boolean;
    showMilliSeconds?: boolean;
    announceSelf?: boolean;
}
export declare class WinstonPnPLogger {
    info: LeveledLogMethod;
    warn: LeveledLogMethod;
    error: LeveledLogMethod;
    debug: LeveledLogMethod;
    silly: LeveledLogMethod;
    winston: LoggerInstance;
    private options;
    private jsonEnabled;
    private showTimestamp;
    private showMilliSeconds;
    private announceSelf;
    constructor(options?: Options);
    private createFileTransports(transports);
    private getLogTimeStamp();
}
