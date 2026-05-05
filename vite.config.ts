import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/ -- build v2
export default defineConfig({
  plugins: [react()],
  base: '/',
})
