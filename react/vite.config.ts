// this is the build config for this demo library source, not the playground
// the build config for the library playground (document) is located at docs/vite.config.ts

import { resolve } from 'path';
import { defineConfig } from 'vite';
import typescript from '@rollup/plugin-typescript';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
  build: {
    sourcemap: true,
    // use vite library mode to build the package
    // https://vitejs.dev/guide/build.html#library-mode
    lib: {
      entry: {
        sso: resolve(__dirname, 'src/sso/index.ts'),
        shared: resolve(__dirname, 'src/shared/index.ts'),
      },
      name: 'BoxyHQUI',
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['react'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: 'React',
        },
      },
    },
  },
  plugins: [
    cssInjectedByJsPlugin({
      jsAssetsFilterFunction: function customJsAssetsfilterFunction(outputChunk) {
        // console.log(outputChunk.fileName, outputChunk.name);
        const entryPoints = ['sso', 'shared', 'index'];
        // TODO: at the moment this plugin injects all styles into every file instead of splitting by entry point, also look into styles not being injected into sso.cjs
        return entryPoints.includes(outputChunk.name);
      },
    }),
    // use @rollup/plugin-typescript to generate .d.ts files
    typescript({
      declaration: true,
      emitDeclarationOnly: true,
      noForceEmit: true,
      declarationDir: resolve(__dirname, 'dist/'),
      rootDir: resolve(__dirname, 'src'),
    }),
  ],
});
