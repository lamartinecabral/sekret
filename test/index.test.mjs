// @ts-check

import { describe, it } from "node:test";
import assert from "node:assert";
import { encrypt, decrypt } from "../src/index.ts";

describe("Sekret", () => {
  it("should encrypt and decrypt a message", async () => {
    const password = "my-secret-password";
    const message = "Hello, World!";

    const encryptedMessage = await encrypt(message, password);

    assert.strictEqual(typeof encryptedMessage, "string");
    assert.notStrictEqual(encryptedMessage, message);

    const decryptedMessage = await decrypt(encryptedMessage, password);

    assert.strictEqual(decryptedMessage, message);
  });
});
