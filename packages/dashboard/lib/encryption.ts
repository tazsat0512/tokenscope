const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12;

async function getKey(): Promise<CryptoKey> {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
  }
  const keyBytes = new Uint8Array(keyHex.match(/.{2}/g)!.map((b) => parseInt(b, 16)));
  return crypto.subtle.importKey('raw', keyBytes, ALGORITHM, false, ['encrypt', 'decrypt']);
}

export async function encrypt(plaintext: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, encoded);

  const result = new Uint8Array(iv.length + ciphertext.byteLength);
  result.set(iv);
  result.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...result));
}

export async function decrypt(ciphertext: string): Promise<string> {
  const key = await getKey();
  const data = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));

  const iv = data.slice(0, IV_LENGTH);
  const encrypted = data.slice(IV_LENGTH);

  const decrypted = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, encrypted);
  return new TextDecoder().decode(decrypted);
}
