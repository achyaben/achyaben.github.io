import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';
import baseConfig from './vite.config';

export default mergeConfig(baseConfig, {
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    https: {
      key: readFileSync(fileURLToPath(new URL('./.certs/localhost-key.pem', import.meta.url))),
      cert: readFileSync(fileURLToPath(new URL('./.certs/localhost.pem', import.meta.url))),
    },
  },
});
