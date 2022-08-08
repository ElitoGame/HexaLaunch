import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import electron from "vite-plugin-electron";
import path from "path";
import fs from "fs";

fs.rmSync("dist", { recursive: true, force: true }); // v14.14.0

export default defineConfig({
	plugins: [
		solidPlugin(),
		electron({
			main: {
				entry: "src/main.ts",
			},
			preload: {
				input: {
					// Must be use absolute path, this is the restrict of Rollup
					preload: path.join(__dirname, "src/preload.ts"),
				},
			},
			// Enables use of Node.js API in the Electron-Renderer
			renderer: {},
		}),
	],
	build: {
		target: "esnext",
		polyfillDynamicImport: false,
		rollupOptions: {
			external: "css",
		},
	},
});
