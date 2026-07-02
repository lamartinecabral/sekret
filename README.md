# Sekret

Sekret is a small wrapper around the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) for password-based encryption and decryption.

It exposes a minimal API:

- `encrypt(message, password)`
- `decrypt(encryptedMessage, password)`
- `version`

## Installation

Using npm:

```sh
npm install @lamartinecabral/sekret
```

Browser via CDN:

```html
<script src="https://unpkg.com/@lamartinecabral/sekret"></script>
```

That script exposes a global named `Sekret`.

```html
<script>
  Sekret.encrypt("Hello World!", "1234").then(console.log);
</script>
```

ES modules via CDN:

```html
<script type="module">
  import Sekret from "https://unpkg.com/@lamartinecabral/sekret/dist/index.esm.js";
</script>
```

## Runtime requirements

Sekret depends on Web Crypto globals such as `crypto.subtle`, `TextEncoder`, `TextDecoder`, `atob`, and `btoa`.

- Modern browsers are supported.
- Recent Node.js versions with Web Crypto support are supported.

## How it works

Sekret derives a 256-bit AES-GCM key from the provided password using PBKDF2 with SHA-256.

For each encryption call it generates:

- a random 16-byte salt
- a random 12-byte IV

The returned string is a Base64 payload containing `salt + iv + ciphertext`, so the output is self-contained and can be passed directly to `decrypt` together with the same password.

## Basic usage

You can use the default export:

```js
import Sekret from "@lamartinecabral/sekret";

const message = "Hello World!";
const password = "1234";

const encrypted = await Sekret.encrypt(message, password);
const decrypted = await Sekret.decrypt(encrypted, password);

console.log(encrypted);
console.log(decrypted === message);
```

Or use named exports:

```js
import { encrypt, decrypt } from "@lamartinecabral/sekret";

const encrypted = await encrypt("Hello World!", "1234");
const decrypted = await decrypt(encrypted, "1234");
```

## API

### `encrypt(message, password)`

Encrypts a UTF-8 string and returns a Base64-encoded payload.

- `message`: `string`
- `password`: `string`
- returns: `Promise<string>`

The payload includes the random salt and IV required for decryption.

### `decrypt(encryptedMessage, password)`

Decrypts a Base64-encoded payload produced by Sekret.

- `encryptedMessage`: `string`
- `password`: `string`
- returns: `Promise<string>`

Throws if the password is wrong or the payload is invalid/corrupted.

### `version`

Exposes the package version injected during packaging.

## Development

```sh
npm test
npm start
```
