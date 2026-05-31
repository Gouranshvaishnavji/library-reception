import * as fs from 'fs';
import * as path from 'path';

type LogLevel = 'INFO' | 'ERROR' | 'WARN' | 'DEBUG';

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    data?: unknown;
}

const logsDir = path.join(process.cwd(), 'logs');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const getTimestamp = (): string => {
    return new Date().toISOString();
};

const getLogFilePath = (level: LogLevel): string => {
    const date = new Date().toISOString().split('T')[0];
    return path.join(logsDir, `${level.toLowerCase()}-${date}.log`);
};

const writeToFile = (logEntry: LogEntry): void => {
    const filePath = getLogFilePath(logEntry.level);
    const logLine = `${JSON.stringify(logEntry)}\n`;
    
    fs.appendFile(filePath, logLine, (err) => {
        if (err) {
            console.error(`Failed to write log to ${filePath}:`, err);
        }
    });
};

const log = (level: LogLevel, message: string, data?: unknown): void => {
    const timestamp = getTimestamp();
    const logEntry: LogEntry = {
        timestamp,
        level,
        message,
    };
    
    if (data !== undefined) {
        logEntry.data = data;
    }

    // Write to file
    writeToFile(logEntry);
    
    // Also console log for development visibility
    console.log(JSON.stringify(logEntry));
};

export const logger = {
    info: (message: string, data?: unknown) => log('INFO', message, data),
    error: (message: string, data?: unknown) => log('ERROR', message, data),
    warn: (message: string, data?: unknown) => log('WARN', message, data),
    debug: (message: string, data?: unknown) => log('DEBUG', message, data),
};
