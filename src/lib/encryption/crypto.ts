import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 12 bytes for GCM
const AUTH_TAG_LENGTH = 16; // 16 bytes auth tag

/**
 * Returns a 32-byte Buffer key from ENCRYPTION_KEY env
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY || 'default_fallback_insecure_key_change_me_now_!';
  // Hash the secret with SHA-256 to ensure exact 32-byte key
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts a plaintext string into a base64 encoded payload: iv:authTag:encryptedData
 */
export function encryptPII(text: string | null | undefined): string | null {
  if (!text) return null;
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = getEncryptionKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');
    const ivHex = iv.toString('hex');

    return `${ivHex}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error occurred');
    return null;
  }
}

/**
 * Decrypts a base64/hex encrypted string back into plaintext
 */
export function decryptPII(encryptedText: string | null | undefined): string | null {
  if (!encryptedText) return null;
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return null;

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = getEncryptionKey();

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error occurred');
    return null;
  }
}
