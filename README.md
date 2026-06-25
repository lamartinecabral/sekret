# Sekret

Sekret is a small wrapper around the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) for password-based AES-CBC encryption and decryption.

It exposes a minimal API:

- `encrypt(message, passwordOrKey)`
- `decrypt(encryptedMessage, passwordOrKey)`
- `generateKey(password)`
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

## Reusing a derived key

If you need to encrypt or decrypt multiple values with the same password, derive the key once and reuse it.

```js
import { decrypt, encrypt, generateKey } from "@lamartinecabral/sekret";

const key = await generateKey("1234");

const encryptedName = await encrypt("Ada", key);
const encryptedRole = await encrypt("Engineer", key);

console.log(await decrypt(encryptedName, key));
console.log(await decrypt(encryptedRole, key));
```

## API

### `encrypt(message, passwordOrKey)`

Encrypts a UTF-8 string and returns a Base64-encoded ciphertext string.

- `message`: `string`
- `passwordOrKey`: `string | CryptoKey`
- returns: `Promise<string>`

### `decrypt(encryptedMessage, passwordOrKey)`

Decrypts a Base64-encoded ciphertext string produced by Sekret.

- `encryptedMessage`: `string`
- `passwordOrKey`: `string | CryptoKey`
- returns: `Promise<string>`

### `generateKey(password)`

Derives an AES-CBC `CryptoKey` from a password using PBKDF2.

- `password`: `string`
- returns: `Promise<CryptoKey>`

### `version`

Exposes the package version injected during packaging.

## Security note

Sekret derives keys with a fixed salt and encrypts with a fixed IV, so the same input and password always produce the same ciphertext. Use it as a lightweight utility or learning tool, not for serious security-sensitive use cases.

## Development

```sh
npm test
npm start
```
