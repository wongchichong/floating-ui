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
            name: 'FloatingUICore',
            formats: ['es', /* 'cjs', */ 'umd'],
            fileName: (format: string) => {
                switch (format) {
                    case 'es':
                        return 'floating-ui.core.esm.js'
                    case 'umd':
                        return 'floating-ui.core.umd.js'
                    default:
                        return `floating-ui.core.${format}.js`
                }
            }
        },
        sourcemap: true,
        rollupOptions: {
            external: ['woby', 'use-woby', '@floating-ui/utils'],
            output: {
                globals: {
                    'woby': 'woby',
                    '@floating-ui/utils': '@floating-ui/utils',
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
