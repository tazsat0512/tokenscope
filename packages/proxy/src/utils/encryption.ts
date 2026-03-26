/**
 * AES-256-GCM decryption for Cloudflare Workers.
 * Mirrors the encryption in packages/dashboard/lib/encryption.ts.
 */

const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12;

async function importKey(keyHex: string): Promise<CryptoKey> {
  const keyBytes = new Uint8Array(keyHex.match(/.{2}/g)!.map((b) => parseInt(b, 16)));
  return crypto.subtle.importKey('raw', keyBytes, ALGORITHM, false, ['decrypt']);
}

export async function decryptAES(ciphertext: string, keyHex: string): Promise<string> {
  const key = await importKey(keyHex);
  const data = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));

  const iv = data.slice(0, IV_LENGTH);
  const encrypted = data.slice(IV_LENGTH);

  const decrypted = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, encrypted);
  return new TextDecoder().decode(decrypted);
}
