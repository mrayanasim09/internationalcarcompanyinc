export interface LogLevel {
  DEBUG: 0
  INFO: 1
  WARN: 2
  ERROR: 3
  CRITICAL: 4
}

export const LOG_LEVELS: LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  CRITICAL: 4,
}

export interface LogEntry {
  id: string
  timestamp: string
  level: keyof LogLevel
  category: string
  message: string
  data?: Record<string, unknown>
  error?: Error
  userId?: string
  sessionId?: string
  url?: string
  userAgent?: string
  ip?: string
}

export interface LoggerConfig {
  minLevel: keyof LogLevel
  enableConsole: boolean
  enableFile: boolean
  enableRemote: boolean
  remoteEndpoint?: string
  maxFileSize: number
  maxFiles: number
  logDirectory: string
}

export class Logger {
  private config: LoggerConfig
  private logs: LogEntry[] = []
  private maxLogs: number = 1000

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      minLevel: (process.env.LOG_LEVEL as keyof LogLevel) || 'INFO',
      enableConsole: process.env.NODE_ENV !== 'production',
      enableFile: false,
      enableRemote: false,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      logDirectory: './logs',
      ...config,
    }
  }

  private shouldLog(level: keyof LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel]
  }

  private formatLog(entry: LogEntry): string {
    const timestamp = entry.timestamp
    const level = entry.level.padEnd(8)
    const category = `[${entry.category}]`.padEnd(15)
    const message = entry.message
    
    let formatted = `${timestamp} ${level} ${category} ${message}`
    
    if (entry.data) {
      formatted += ` | Data: ${JSON.stringify(entry.data)}`
    }
    
    if (entry.error) {
      formatted += ` | Error: ${entry.error.message}`
      if (entry.error.stack) {
        formatted += `\n${entry.error.stack}`
      }
    }
    
    if (entry.userId) {
      formatted += ` | User: ${entry.userId}`
    }
    
    if (entry.url) {
      formatted += ` | URL: ${entry.url}`
    }
    
    return formatted
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry)
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }
  }

  private async sendToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteEndpoint) return
    
    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      })
    } catch (error) {
      // Don't log remote logging errors to avoid infinite loops
      console.warn('Failed to send log to remote endpoint:', error)
    }
  }

  log(level: keyof LogLevel, category: string, message: string, data?: Record<string, unknown>, error?: Error, context?: Partial<LogEntry>): void {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      id: Math.random().toString(36).substring(7), // Simple unique ID
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      error,
      ...context,
    }

    this.addLog(entry)

    // Console logging
    if (this.config.enableConsole) {
      const formatted = this.formatLog(entry)
      switch (level) {
        case 'DEBUG':
          console.debug(formatted)
          break
        case 'INFO':
          console.info(formatted)
          break
        case 'WARN':
          console.warn(formatted)
          break
        case 'ERROR':
        case 'CRITICAL':
          console.error(formatted)
          break
      }
    }

    // Remote logging
    if (this.config.enableRemote) {
      this.sendToRemote(entry).catch(() => {
        // Silent fail for remote logging
      })
    }
  }

  debug(category: string, message: string, data?: Record<string, unknown>, context?: Partial<LogEntry>): void {
    this.log('DEBUG', category, message, data, undefined, context)
  }

  info(category: string, message: string, data?: Record<string, unknown>, context?: Partial<LogEntry>): void {
    this.log('INFO', category, message, data, undefined, context)
  }

  warn(category: string, message: string, data?: Record<string, unknown>, error?: Error, context?: Partial<LogEntry>): void {
    this.log('WARN', category, message, data, error, context)
  }

  error(category: string, message: string, data?: Record<string, unknown>, error?: Error, context?: Partial<LogEntry>): void {
    this.log('ERROR', category, message, data, error, context)
  }

  critical(category: string, message: string, data?: Record<string, unknown>, error?: Error, context?: Partial<LogEntry>): void {
    this.log('CRITICAL', category, message, data, error, context)
  }

  // Get recent logs
  getRecentLogs(limit: number = 100): LogEntry[] {
    return this.logs.slice(-limit)
  }

  // Get logs by level
  getLogsByLevel(level: keyof LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level)
  }

  // Get logs by category
  getLogsByCategory(category: string): LogEntry[] {
    return this.logs.filter(log => log.category === category)
  }

  // Clear logs
  clearLogs(): void {
    this.logs = []
  }

  // Export logs
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}

// Create default logger instance
export const logger = new Logger()

// Convenience functions
export const logDebug = (category: string, message: string, data?: Record<string, unknown>, context?: Partial<LogEntry>) => 
  logger.debug(category, message, data, context)

export const logInfo = (category: string, message: string, data?: Record<string, unknown>, context?: Partial<LogEntry>) => 
  logger.info(category, message, data, context)

export const logWarn = (category: string, message: string, data?: Record<string, unknown>, error?: Error, context?: Partial<LogEntry>) => 
  logger.warn(category, message, data, error, context)

export const logError = (category: string, message: string, data?: Record<string, unknown>, error?: Error, context?: Partial<LogEntry>) => 
  logger.error(category, message, data, error, context)

export const logCritical = (category: string, message: string, data?: Record<string, unknown>, error?: Error, context?: Partial<LogEntry>) => 
  logger.critical(category, message, data, error, context)

// Legacy debug function for backward compatibility
export const DEBUG_CONFIG = {
  enabled: process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true',
  categories: process.env.DEBUG_CATEGORIES?.split(',') || ['*'],
}

export function debug(category: string, message: string, data?: Record<string, unknown>): void {
  if (!DEBUG_CONFIG.enabled) return
  
  const shouldLog = DEBUG_CONFIG.categories.includes('*') || DEBUG_CONFIG.categories.includes(category)
  if (shouldLog) {
    logger.debug(category, message, data)
  }
}

export function debugError(category: string, message: string, error?: unknown): void {
  if (!DEBUG_CONFIG.enabled) return
  
  const shouldLog = DEBUG_CONFIG.categories.includes('*') || DEBUG_CONFIG.categories.includes(category)
  if (shouldLog) {
    logger.error(category, message, undefined, error instanceof Error ? error : new Error(String(error)))
  }
}
