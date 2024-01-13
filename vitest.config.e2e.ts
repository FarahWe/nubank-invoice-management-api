import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  test: {
    include: ['**/*.test.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      '**/unit/middlewares/**'
    ],
    globals: true,
    root: './',
    setupFiles: ['./tests/helpers/setup-e2e.ts']
  },
  plugins: [
    tsConfigPaths(),
    swc.vite({
      module: { type: 'es6' }
    })
  ]
})
