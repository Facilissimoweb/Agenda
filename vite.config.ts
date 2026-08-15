import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const groqKey = env.VITE_GROQ_API_KEY || env.GROQ_API_KEY || env.NEXT_PUBLIC_GROQ_API_KEY || '';
  const geminiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    define: {
      'import.meta.env.VITE_GROQ_API_KEY': JSON.stringify(groqKey),
      'import.meta.env.GROQ_API_KEY': JSON.stringify(groqKey),
      'process.env.VITE_GROQ_API_KEY': JSON.stringify(groqKey),
      'process.env.GROQ_API_KEY': JSON.stringify(groqKey),
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey),
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
