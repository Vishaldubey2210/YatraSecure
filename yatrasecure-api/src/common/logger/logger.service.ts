import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

@Injectable()
export class LoggerService implements NestLoggerService {
  log(message: string, context?: string) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [LOG] [${context || 'App'}] ${message}`);
  }

  error(message: string, trace?: string, context?: string) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ERROR] [${context || 'App'}] ${message}`);
    if (trace) {
      console.error(`[${timestamp}] [TRACE] ${trace}`);
    }
  }

  warn(message: string, context?: string) {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [WARN] [${context || 'App'}] ${message}`);
  }

  debug(message: string, context?: string) {
    const timestamp = new Date().toISOString();
    console.debug(`[${timestamp}] [DEBUG] [${context || 'App'}] ${message}`);
  }

  verbose(message: string, context?: string) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [VERBOSE] [${context || 'App'}] ${message}`);
  }
}