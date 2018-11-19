import { LeveledLogMethod, Logger } from 'winston';
export declare let logger: WinstonPnPLogger;
export interface IOptions {
    logDir?: string;
    enableJson?: boolean;
    showTimestamp?: boolean;
    showMilliSeconds?: boolean;
    announceSelf?: boolean;
}
export declare class WinstonPnPLogger {
    error: LeveledLogMethod;
    warn: LeveledLogMethod;
    info: LeveledLogMethod;
    debug: LeveledLogMethod;
    silly: LeveledLogMethod;
    winston: Logger;
    private options;
    private readonly jsonEnabled;
    private readonly showTimestamp;
    private readonly showMilliSeconds;
    private readonly announceSelf;
    private readonly pnpFormatter;
    constructor(options?: IOptions);
    private createFileTransports;
    private getLogTimeStamp;
}
