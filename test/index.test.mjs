// @ts-check

import { describe, it } from "node:test";
import assert from "node:assert";
import Sekret, { decrypt, encrypt, version } from "../src/index.ts";

describe("Sekret", () => {
  it("encrypts and decrypts a message with the default randomized mode", async () => {
    const password = "my-secret-password";
    const message = "Hello, World!";

    const encryptedMessage = await encrypt(message, password);

    assert.strictEqual(typeof encryptedMessage, "string");
    assert.notStrictEqual(encryptedMessage, message);

    const decryptedMessage = await decrypt(encryptedMessage, password);

    assert.strictEqual(decryptedMessage, message);
  });

  it("uses a different payload for each randomized encryption", async () => {
    const message = "Hello, World!";
    const password = "my-secret-password";

    const firstEncryptedMessage = await encrypt(message, password);
    const secondEncryptedMessage = await encrypt(message, password);

    assert.notStrictEqual(firstEncryptedMessage, secondEncryptedMessage);
    assert.strictEqual(await decrypt(firstEncryptedMessage, password), message);
    assert.strictEqual(
      await decrypt(secondEncryptedMessage, password),
      message,
    );
  });

  it("returns the same payload for deterministic encryption", async () => {
    const message = "Hello, World!";
    const password = "my-secret-password";

    const firstEncryptedMessage = await encrypt(message, password, {
      deterministic: true,
    });
    const secondEncryptedMessage = await encrypt(message, password, {
      deterministic: true,
    });

    assert.strictEqual(firstEncryptedMessage, secondEncryptedMessage);
    assert.strictEqual(await decrypt(firstEncryptedMessage, password), message);
  });

  it("changes deterministic payloads when the message or password changes", async () => {
    const firstEncryptedMessage = await encrypt("first message", "password", {
      deterministic: true,
    });
    const secondEncryptedMessage = await encrypt("second message", "password", {
      deterministic: true,
    });
    const thirdEncryptedMessage = await encrypt(
      "first message",
      "other-password",
      {
        deterministic: true,
      },
    );

    assert.notStrictEqual(firstEncryptedMessage, secondEncryptedMessage);
    assert.notStrictEqual(firstEncryptedMessage, thirdEncryptedMessage);
  });

  it("does not use a constant packet prefix for deterministic messages", async () => {
    const password = "my-secret-password";
    const firstEncryptedMessage = await encrypt("first message", password, {
      deterministic: true,
    });
    const secondEncryptedMessage = await encrypt("second message", password, {
      deterministic: true,
    });

    const firstPacketPrefix = Buffer.from(
      firstEncryptedMessage,
      "base64",
    ).subarray(0, 16);
    const secondPacketPrefix = Buffer.from(
      secondEncryptedMessage,
      "base64",
    ).subarray(0, 16);

    assert.notDeepStrictEqual(firstPacketPrefix, secondPacketPrefix);
  });

  it("does not reuse ciphertext prefixes for deterministic messages with a shared prefix", async () => {
    const password = "my-secret-password";
    const firstEncryptedMessage = await encrypt(
      "shared prefix: first",
      password,
      {
        deterministic: true,
      },
    );
    const secondEncryptedMessage = await encrypt(
      "shared prefix: second",
      password,
      { deterministic: true },
    );

    const firstCiphertext = Buffer.from(
      firstEncryptedMessage,
      "base64",
    ).subarray(28);
    const secondCiphertext = Buffer.from(
      secondEncryptedMessage,
      "base64",
    ).subarray(28);

    assert.notDeepStrictEqual(
      firstCiphertext.subarray(0, 16),
      secondCiphertext.subarray(0, 16),
    );
  });

  it("round trips empty and Unicode messages", async () => {
    for (const message of ["", "Hello, 世界! cafe\u0301"]) {
      const encryptedMessage = await encrypt(message, "my-secret-password");

      assert.strictEqual(
        await decrypt(encryptedMessage, "my-secret-password"),
        message,
      );
    }
  });

  it("rejects an incorrect password", async () => {
    const encryptedMessage = await encrypt("Hello, World!", "correct-password");

    await assert.rejects(decrypt(encryptedMessage, "incorrect-password"));
  });

  it("rejects malformed and tampered payloads", async () => {
    const encryptedMessage = await encrypt(
      "Hello, World!",
      "my-secret-password",
      { deterministic: true },
    );
    const tamperedMessage = `${encryptedMessage.slice(0, -1)}A`;

    await assert.rejects(decrypt("not-base64", "my-secret-password"));
    await assert.rejects(decrypt(tamperedMessage, "my-secret-password"));
  });

  it("exposes the named API through the default export", () => {
    assert.strictEqual(Sekret.encrypt, encrypt);
    assert.strictEqual(Sekret.decrypt, decrypt);
    assert.strictEqual(Sekret.version, version);
  });
});
