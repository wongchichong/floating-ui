import { defineViteConfig } from 'config'

export default defineViteConfig({
    server: {
        port: 1234,
    },
    build: {
        minify: false,
        lib: {
            entry: './src/index.ts',
            name: 'FloatingUIWobyDOM',
            formats: ['es', 'umd'],
            fileName: (format: string) => {
                switch (format) {
                    case 'es':
                        return 'floating-ui.woby-dom.esm.js'
                    case 'umd':
                        return 'floating-ui.woby-dom.umd.js'
                    default:
                        return `floating-ui.woby-dom.${format}.js`
                }
            }
        },
        sourcemap: true,
        rollupOptions: {
            external: ['woby', '@floating-ui/dom'],
            output: {
                globals: {
                    'woby': 'woby',
                    '@floating-ui/dom': '@floating-ui/dom'
                }
            }
        }
    },
    plugins: [],

    esbuild: {
        jsx: 'automatic',
    },
    define: {
        __DEV__: true,
    },
})