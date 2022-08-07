import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import electron from 'vite-plugin-electron'

export default defineConfig({
    plugins: [
        solidPlugin(),
        electron({
            main: {
                entry: 'src/main.ts',
            },
        })
    ],
    build: {
        target: 'esnext',
        polyfillDynamicImport: false,
        rollupOptions: {
            external: "css"
        }
    },
});