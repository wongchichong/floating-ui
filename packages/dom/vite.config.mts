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
            },
            name: '@floating-ui/utils',
            formats: ['es', /* 'cjs', 'umd' */],
            fileName: (format: string, entryName: string) => {
                const suffix = format === 'es' ? '.mjs' : format === 'cjs' ? '.esm.js' : `.${format}.js`
                return `floating-ui.dom.${entryName}${suffix}`
            },
        },
        sourcemap: true,
        rollupOptions: {
            external: ['woby', 'use-woby', '@floating-ui/core', '@floating-ui/utils', '@floating-ui/utils/dom'],
            output: {
                globals: {
                    'woby': 'woby',
                    'use-woby': 'use-woby',
                    '@floating-ui/core': '@floating-ui/core',
                    '@floating-ui/utils': '@floating-ui/utils',
                    '@floating-ui/utils/dom': '@floating-ui/utils/dom',
                }
            }
        }
    },
    plugins: [],
    resolve: {
        alias: {
            '@floating-ui/core': process.argv.includes('dev') ? path.resolve(__dirname, '../core/src/index.ts') : '@floating-ui/core',
            '@floating-ui/utils': process.argv.includes('dev') ? path.resolve(__dirname, '../utils/src/index.ts') : '@floating-ui/utils',
            '@floating-ui/utils/dom': process.argv.includes('dev') ? path.resolve(__dirname, '../utils/src/dom.ts') : '@floating-ui/utils/dom',
        },
    },
    esbuild: {
        jsx: 'automatic',
    },
    define: {
        __DEV__: true,
    },
})

