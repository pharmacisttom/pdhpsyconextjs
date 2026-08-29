/**
 * Utility functions for masking Personally Identifiable Information (PII)
 * Follows healthcare privacy and PDPA standards
 */

/**
 * Masks Thai National Citizen ID (13 digits)
 * Example: "3560123456171" -> "3560xxxxxx171"
 */
export function maskCitizenId(citizenId: string | null | undefined): string {
  if (!citizenId) return '-';
  const clean = citizenId.replace(/\D/g, '');
  if (clean.length === 13) {
    return `${clean.substring(0, 4)}xxxxxx${clean.substring(10, 13)}`;
  }
  if (clean.length > 6) {
    return `${clean.substring(0, 3)}...${clean.substring(clean.length - 3)}`;
  }
  return '************';
}

/**
 * Masks First and Last Name in Thai or English
 * Example: ("นายจัตุรงค์", "กันทะวงค์") -> "นายจัตุxx กันทะxx"
 */
export function maskName(firstName?: string | null, lastName?: string | null): string {
  if (!firstName && !lastName) return 'ผู้ประเมินนิรนาม';

  const maskWord = (word: string | null | undefined): string => {
    if (!word) return '';
    const trimmed = word.trim();
    if (trimmed.length <= 2) return `${trimmed.charAt(0)}*`;
    if (trimmed.length <= 4) return `${trimmed.slice(0, 2)}**`;
    const visibleLength = Math.max(2, Math.floor(trimmed.length / 2));
    return `${trimmed.slice(0, visibleLength)}xx`;
  };

  const maskedFirst = maskWord(firstName);
  const maskedLast = maskWord(lastName);

  return [maskedFirst, maskedLast].filter(Boolean).join(' ');
}

/**
 * Masks Phone Number
 * Example: "0812345678" -> "08x-xxx-5678"
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return '-';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10) {
    return `${clean.substring(0, 2)}x-xxx-${clean.substring(6, 10)}`;
  }
  if (clean.length === 9) {
    return `${clean.substring(0, 2)}x-xxx-${clean.substring(5, 9)}`;
  }
  return '0xx-xxx-xxxx';
}
