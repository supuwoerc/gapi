/// <reference types="vitest/config" />
import path from 'path'

import { defineConfig, loadEnv } from 'vite'
import type { ConfigEnv, UserConfig } from 'vite'

import react from '@vitejs/plugin-react'

import tailwindcss from '@tailwindcss/vite'
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
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
      tailwindcss(),
      svgr(),
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
          manualChunks: {
            react: ['react', 'react-dom'], // 单独打包 React 相关库
            utils: ['lodash-es', 'axios'], // 工具库单独打包
          },
        },
      },
    },
  })
}
