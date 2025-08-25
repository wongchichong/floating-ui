import { defineConfig } from 'vite'
import mdx from '@mdx-js/rollup'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            '@floating-ui/woby': path.resolve(__dirname, '../packages/woby/src'),
            '@floating-ui/woby-dom': path.resolve(__dirname, '../packages/woby-dom/src'),
        },
    },
    esbuild: {
        jsx: 'automatic',
    },
    plugins: [mdx({
        jsxImportSource: 'woby',
    })],
    optimizeDeps: {
        include: ['woby'],
    },
})