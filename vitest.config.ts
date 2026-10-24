import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@app/supabase': fileURLToPath(new URL('./libs/supabase/client.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['apps/**/*.{test,spec}.ts'],
    restoreMocks: true,
  },
});
