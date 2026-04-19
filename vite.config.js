import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: '/' — Vercel/Netlify 루트 배포용
// GitHub Pages에 올릴 경우 base를 '/레포이름/'으로 바꾸세요.
export default defineConfig({
  plugins: [react()],
  base: '/',
})
