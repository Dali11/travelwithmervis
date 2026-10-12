import { defineConfig } from 'vite';

export default defineConfig({
  build: { target: 'es2020' },
  // host: true lets you open the dev server on your phone via your Wi-Fi address.
  server: { host: true },
});
