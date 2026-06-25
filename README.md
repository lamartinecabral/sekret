# Sekret

A simple encryption tool powered by [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

# Installation

In a browser:

```html
<script src="https://unpkg.com/@lamartinecabral/sekret"></script>
```

```html
<script type="module">
  import Sekret from "https://unpkg.com/@lamartinecabral/sekret";
</script>
```

Using npm:

```sh
npm install @lamartinecabral/sekret
```

# Usage example

```js
import Sekret from "@lamartinecabral/sekret";

(async () => {
  const message = "Hello World!";
  const password = "1234";

  const encrypted = await Sekret.encrypt(message, password);
  console.log(encrypted); // WYCn8qIJNoNlVU0pV/LuDg==

  const decrypted = await Sekret.decrypt(encrypted, password);
  console.log(message === decrypted); // true
})();
```
