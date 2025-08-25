import { defineViteConfig } from 'config'
import path from 'path'


export default defineViteConfig({
  server: {
    port: 1234,
  },
  build: {
    minify: false,
    lib: {
      entry: {
        index: './src/index.ts',
        dom: './src/dom.ts'
      },
      name: '@floating-ui/utils',
      formats: ['es', /* 'cjs', 'umd' */],
      fileName: (format: string, entryName: string) => {
        const suffix = format === 'es' ? '.mjs' : format === 'cjs' ? '.esm.js' : `.${format}.js`
        return `floating-ui.utils.${entryName}${suffix}`
      }
    },
    sourcemap: true,
    rollupOptions: {
      external: ['woby', 'use-woby', '@floating-ui/core'],
      output: {
        globals: {
          'woby': 'woby',
          '@floating-ui/core': '@floating-ui/core',
          'woby/jsx-runtime': 'woby/jsx-runtime',
        }
      }
    }
  },
  plugins: [],
  resolve: {
    alias: {
      '@floating-ui/core': process.argv.includes('dev') ? path.resolve('../core/src') : '@floating-ui/core',
      '@floating-ui/utils': process.argv.includes('dev') ? path.resolve('../utils/src') : '@floating-ui/utils',
    },
  },
  esbuild: {
    jsx: 'automatic',
  },
  define: {
    __DEV__: true,
  },
})
