// Helper: Derives an AES-GCM key from a password and salt using PBKDF2
async function deriveKey(
  password: string,
  salt: ArrayBuffer,
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

// A fixed, static salt used to ensure deterministic key derivation
const STATIC_SALT = new Uint8Array([
  ...[0x44, 0x65, 0x74, 0x65, 0x72, 0x6d, 0x69, 0x6e],
  ...[0x69, 0x73, 0x74, 0x69, 0x63, 0x53, 0x61, 0x6c], // "DeterministicSalt"
]);

/**
 * Encrypts a message string using a password deterministically.
 * Returns a self-contained, URL-safe Base64 payload.
 */
export async function encrypt(
  message: string,
  password: string,
  options?: {
    deterministic?: boolean;
  },
): Promise<string> {
  const encoder = new TextEncoder();
  const messageBuffer = encoder.encode(message);

  let salt: Uint8Array<ArrayBuffer>;
  let iv: Uint8Array<ArrayBuffer>;

  if (options?.deterministic) {
    // 1. Use the static salt instead of a random one
    salt = STATIC_SALT;

    // 2. Compute a deterministic IV by hashing the message.
    // This achieves determinism while preventing AES-GCM key/IV reuse attacks.
    const hashBuffer = await crypto.subtle.digest("SHA-256", messageBuffer);
    iv = new Uint8Array(hashBuffer).slice(0, 12); // AES-GCM requires a 12-byte IV
  } else {
    // Generate random salt (16 bytes) and initialization vector (12 bytes for AES-GCM)
    salt = crypto.getRandomValues(new Uint8Array(16));
    iv = crypto.getRandomValues(new Uint8Array(12));
  }

  const key = await deriveKey(password, salt.buffer);

  // Encrypt the encoded message
  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    messageBuffer,
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

  const key = await deriveKey(password, salt.buffer);

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
