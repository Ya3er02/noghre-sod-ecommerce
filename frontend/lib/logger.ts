type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  stack?: string;
}

class Logger {
  private isDevelopment = import.meta.env.MODE === 'development';
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  private formatMessage(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      stack: data instanceof Error ? data.stack : undefined,
    };
  }

  private log(level: LogLevel, message: string, data?: any): void {
    const entry = this.formatMessage(level, message, data);
    
    // Store log entry
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output in development
    if (this.isDevelopment) {
      const emoji = {
        debug: '🔍',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
      }[level];

      console[level === 'debug' ? 'log' : level](
        `${emoji} [${level.toUpperCase()}] ${message}`,
        data || ''
      );
    }

    // Send critical errors to monitoring service
    if (level === 'error' && !this.isDevelopment) {
      this.sendToMonitoring(entry);
    }
  }

  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | any): void {
    this.log('error', message, error);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  private sendToMonitoring(entry: LogEntry): void {
    // Implement integration with monitoring service (Sentry, etc.)
    // Example:
    // if (window.Sentry) {
    //   window.Sentry.captureException(entry.data, {
    //     level: entry.level,
    //     extra: { message: entry.message },
    //   });
    // }
  }
}

export const logger = new Logger();
