import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/ -- build v2
export default defineConfig({
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [react()],
  base: '/',
})
