/**
 * Safe Application Logger
 * Automatically sanitizes any potential PII and secrets before outputting
 */

const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /citizen_?id/i,
  /first_?name/i,
  /last_?name/i,
  /phone/i,
  /authorization/i,
];

function sanitize(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    // Check if it looks like a Thai citizen ID (13 digits)
    if (/^\d{13}$/.test(obj)) return '***CITIZEN_ID_REDACTED***';
    // Check if it looks like a phone number (10 digits)
    if (/^0\d{9}$/.test(obj)) return '***PHONE_REDACTED***';
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }
  if (typeof obj === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (SENSITIVE_PATTERNS.some((pattern) => pattern.test(key))) {
        sanitized[key] = '***REDACTED***';
      } else {
        sanitized[key] = sanitize(value);
      }
    }
    return sanitized;
  }
  return obj;
}

export const logger = {
  info: (message: string, context?: Record<string, any>) => {
    const timestamp = new Date().toISOString();
    if (context) {
      console.log(`[INFO] [${timestamp}] ${message}`, JSON.stringify(sanitize(context)));
    } else {
      console.log(`[INFO] [${timestamp}] ${message}`);
    }
  },
  warn: (message: string, context?: Record<string, any>) => {
    const timestamp = new Date().toISOString();
    if (context) {
      console.warn(`[WARN] [${timestamp}] ${message}`, JSON.stringify(sanitize(context)));
    } else {
      console.warn(`[WARN] [${timestamp}] ${message}`);
    }
  },
  error: (message: string, error?: any, context?: Record<string, any>) => {
    const timestamp = new Date().toISOString();
    console.error(
      `[ERROR] [${timestamp}] ${message}`,
      error?.message || error,
      context ? JSON.stringify(sanitize(context)) : ''
    );
  },
};
