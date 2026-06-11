import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: { index: 'src/composition/index.ts' },
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
  },
  {
    entry: { takt: 'src/composition/snippet.ts' },
    format: ['iife'],
    globalName: 'takt',
    outExtension: () => ({ js: '.js' }),
    minify: true,
    sourcemap: true,
    treeshake: true,
  },
])
