import { defineConfig } from 'electron-vite';
import { resolve } from 'path';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        external: ['@electron-toolkit/utils'],
      },
    },
  },
  preload: {
    build: {
      rollupOptions: {
        external: ['@electron-toolkit/preload'],
      },
    },
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
      },
    },
    plugins: [solidPlugin()],
    build: {
      target: 'chrome',
      rollupOptions: {
        external: 'css',
      },
    },
  },
});
