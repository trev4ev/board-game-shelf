import { config } from 'dotenv'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { bggDevProxy } from './bgg/vitePlugin'

// Load .env so the BGG proxy can read BGG_API_TOKEN (no VITE_ prefix)
config()

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react(), bggDevProxy()],
})
