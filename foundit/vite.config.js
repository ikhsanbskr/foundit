import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:8080';

  return {
    plugins: [react()],
    server: {
      allowedHosts: ['3efe-2400-9800-6032-561d-bc4b-9a3e-46ce-37fc.ngrok-free.app'],
      proxy: {
        '/api': {
          target: `${backendUrl}/api`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        },
        '/uploads': {
          target: `${backendUrl}/uploads`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/uploads/, '')
        }
      }
    }
  }
})
