import { defineViteConfig } from 'config'
import path from 'path'

export default defineViteConfig({
    server: {
        port: 1234,
    },
    build: {
        minify: false,
        lib: {
            entry: ["./src/index.ts"],
            name: "FloatingUIWoby",
            formats: ['es'],
            fileName: (format: string, entryName: string) => `${entryName}.${format}.js`
        },
        sourcemap: true,
        rollupOptions: {
            external: ['woby', '@floating-ui/core', '@floating-ui/utils', '@floating-ui/utils/dom', '@floating-ui/woby-dom', 'tabbable'
            ],
            output: {
                globals: {
                    'woby': 'woby',
                    '@floating-ui/woby-dom': '@floating-ui/woby-dom',
                    '@floating-ui/core': '@floating-ui/core',
                    '@floating-ui/utils': '@floating-ui/utils',
                    '@floating-ui/utils/dom': '@floating-ui/utils/dom',
                    'woby/jsx-runtime': 'woby/jsx-runtime',
                    'tabbable': 'tabbable'
                }
            }
        }
    },
    plugins: [],
    resolve: {
        alias: {
            '@floating-ui/core': process.argv.includes('dev') ? path.resolve('../core/src') : '@floating-ui/core',
            '@floating-ui/utils': process.argv.includes('dev') ? path.resolve('../utils/src') : '@floating-ui/utils',
            '@floating-ui/utils/dom': process.argv.includes('dev') ? path.resolve('../utils/src/dom.ts') : '@floating-ui/utils/dom',
            '@floating-ui/woby-dom': process.argv.includes('dev') ? path.resolve('../woby-dom/src') : '@floating-ui/woby-dom',
        },
    },
    esbuild: {
        jsx: 'automatic',
    },
    define: {
        __DEV__: true,
    },
})