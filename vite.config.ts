import { defineConfig } from "vite";
import path from "path";
import dts from 'vite-plugin-dts';
import glsl from 'vite-plugin-glsl'

const libConfig = defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            fileName: "index",
            name: 'bitmap-index'
        },
    },
    plugins: [dts({exclude: "**/*.test.ts"}), glsl()],
});

export default libConfig
