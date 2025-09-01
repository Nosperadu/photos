// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  base: '/', // Bei Custom Domain (z.B. jonas-nemeth.de) unbedingt '/' lassen
})