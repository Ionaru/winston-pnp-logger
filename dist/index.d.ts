/// <reference types="winston" />
import { LeveledLogMethod, LoggerInstance } from 'winston';
export declare let logger: WinstonPnPLogger;
export interface IOptions {
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
    constructor(options?: IOptions);
    private createFileTransports(transportsList);
    private getLogTimeStamp();
}
