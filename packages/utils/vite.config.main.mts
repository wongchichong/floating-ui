import { defineViteConfig } from 'config'
import path from 'path'


export default defineViteConfig({
    server: {
        port: 1234,
    },
    build: {
        minify: false,
        lib: {
            entry: './src/index.ts',
            name: 'FloatingUIUtils',
            formats: ['es', /* 'cjs', */ 'umd'],
            fileName: (format: string) => {
                switch (format) {
                    case 'es':
                        //     return 'floating-ui.utils.mjs'
                        // case 'cjs':
                        return 'floating-ui.utils.esm.js'
                    case 'umd':
                        return 'floating-ui.utils.umd.js'
                    default:
                        return `floating-ui.utils.${format}.js`
                }
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
