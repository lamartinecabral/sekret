// Helper: Derives an AES-GCM key from a password and salt using PBKDF2
async function deriveKey(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();

  // 1. Import the raw password string as a base key material
  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  // 2. Derive a secure 256-bit AES-GCM key from the base key
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000, // Secure standard iteration count
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

// Helper: Converts a Uint8Array to a Base64 string safely
function bufferToBase64(buffer: Uint8Array): string {
  return btoa(Array.from(buffer, (byte) => String.fromCharCode(byte)).join(""));
}

// Helper: Converts a Base64 string back to a Uint8Array
function base64ToBuffer(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const buffer = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    buffer[i] = binaryString.charCodeAt(i);
  }
  return buffer;
}

/**
 * Encrypts a message string using a password.
 * Returns a self-contained, URL-safe Base64 payload containing salt, iv, and ciphertext.
 */
export async function encrypt(
  message: string,
  password: string,
): Promise<string> {
  const encoder = new TextEncoder();

  // Generate random salt (16 bytes) and initialization vector (12 bytes for AES-GCM)
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(password, salt);

  // Encrypt the encoded message
  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encoder.encode(message),
  );

  const ciphertext = new Uint8Array(ciphertextBuffer);

  // Combine salt + iv + ciphertext into a single packet
  const combinedBuffer = new Uint8Array(
    salt.length + iv.length + ciphertext.length,
  );
  combinedBuffer.set(salt, 0);
  combinedBuffer.set(iv, salt.length);
  combinedBuffer.set(ciphertext, salt.length + iv.length);

  return bufferToBase64(combinedBuffer);
}

/**
 * Decrypts a Base64-encoded encrypted payload using a password.
 * Throws an error if the password or data is corrupted.
 */
export async function decrypt(
  encryptedMessage: string,
  password: string,
): Promise<string> {
  const decoder = new TextDecoder();
  const combinedBuffer = base64ToBuffer(encryptedMessage);

  // Extract the individual components back out of the combined array
  const salt = combinedBuffer.slice(0, 16);
  const iv = combinedBuffer.slice(16, 28);
  const ciphertext = combinedBuffer.slice(28);

  const key = await deriveKey(password, salt);

  // Decrypt the ciphertext. AES-GCM will automatically authenticate the tag.
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    ciphertext,
  );

  return decoder.decode(decryptedBuffer);
}

export const version: string = "";

export default { encrypt, decrypt, version };
