/// <reference types="vitest/config" />
import path from 'path'

import { defineConfig, loadEnv } from 'vite'
import type { ConfigEnv, UserConfig } from 'vite'

import react, { reactCompilerPreset } from '@vitejs/plugin-react'

import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import checker from 'vite-plugin-checker'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default ({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd())
  const base = env.VITE_APP_BASE

  return defineConfig({
    base: base,
    test: {
      environment: 'jsdom',
      include: [
        'src/components/**/*.{test,spec}.?(c|m)[jt]s?(x)',
        'src/test/**/*.{test,spec}.?(c|m)[jt]s?(x)',
      ],
      coverage: {
        provider: 'v8',
        include: ['src/components/**/*.tsx', 'src/test/**/*.tsx'],
      },
      setupFiles: ['./setup-test.ts'],
      globals: true,
    },
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss(),
      svgr(),
      checker({
        typescript: {
          tsconfigPath: './tsconfig.app.json',
        },
        eslint: {
          useFlatConfig: true,
          lintCommand: 'eslint .',
        },
      }),
    ],
    publicDir: 'public',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      extensions: ['.js', '.ts', '.jsx', '.tsx'],
    },
    server: {
      host: '0.0.0.0',
      port: 9999,
      open: true,
      strictPort: false,
      cors: true,
      hmr: {
        port: 12345, // https://github.com/vitejs/vite/issues/14328#issuecomment-1897675256
      },
    },
    optimizeDeps: {
      exclude: ['react-scan'], // https://github.com/vitejs/vite/issues/10761
    },
    build: {
      outDir: 'dist',
      assetsDir: 'static',
      minify: 'terser',
      chunkSizeWarningLimit: 1024,
      cssCodeSplit: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('react-dom') || id.includes('node_modules/react/')) return 'react'
            if (id.includes('react-router')) return 'router'
            if (
              id.includes('radix-ui') ||
              id.includes('react-day-picker') ||
              id.includes('react-resizable-panels') ||
              id.includes('/cmdk/') ||
              id.includes('/vaul/') ||
              id.includes('embla-carousel') ||
              id.includes('input-otp') ||
              id.includes('sonner') ||
              id.includes('lucide-react')
            )
              return 'ui'
            if (id.includes('recharts') || id.includes('d3-')) return 'charts'
            if (id.includes('@tanstack')) return 'query'
            if (
              id.includes('lodash-es') ||
              id.includes('/ky/') ||
              id.includes('/zod/') ||
              id.includes('i18next') ||
              id.includes('date-fns') ||
              id.includes('gsap') ||
              id.includes('nanoid') ||
              id.includes('immer') ||
              id.includes('zustand') ||
              id.includes('clsx') ||
              id.includes('class-variance-authority') ||
              id.includes('tailwind-merge')
            )
              return 'utils'
          },
        },
      },
    },
  })
}
