import crypto from 'crypto';

/**
 * Anonymously hashes an IP address using SHA-256 with a salt
 * Never stores plain IP address in the database
 */
export function hashIp(ip: string | null | undefined): string {
  if (!ip) return 'anonymous_ip';
  const salt = process.env.AUTH_SECRET || 'pdhpsyco_salt_2026';
  return crypto.createHash('sha256').update(`${ip}-${salt}`).digest('hex').substring(0, 32);
}

/**
 * Extracts client IP from Next.js request headers
 */
export function extractClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}
