import { defineViteConfig } from 'config'
import path from 'path'


export default defineViteConfig({
    server: {
        port: 1234,
    },
    build: {
        minify: false,
        lib: {
            entry: './src/dom.ts',
            name: 'FloatingUIUtilsDOM',
            formats: ['es', /* 'cjs', */ 'umd'],
            fileName: (format: string) => {
                switch (format) {
                    case 'es':
                        //     return 'floating-ui.utils.dom.mjs'
                        // case 'cjs':
                        return 'floating-ui.utils.dom.esm.js'
                    case 'umd':
                        return 'floating-ui.utils.dom.umd.js'
                    default:
                        return `floating-ui.utils.dom.${format}.js`
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
