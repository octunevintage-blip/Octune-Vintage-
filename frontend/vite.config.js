import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load environment variables from the current directory (frontend)
  const envFrontend = loadEnv(mode, __dirname, '');

  const processEnv = {};
  Object.keys(envFrontend).forEach((key) => {
    if (key.startsWith('NEXT_PUBLIC_') || key.startsWith('VITE_') || key === 'NODE_ENV') {
      processEnv[key] = envFrontend[key];
    }
  });

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'next/link': path.resolve(__dirname, './src/lib/next-link.jsx'),
        'next/image': path.resolve(__dirname, './src/lib/next-image.jsx'),
        'next/navigation': path.resolve(__dirname, './src/lib/next-navigation.js'),
        'next/script': path.resolve(__dirname, './src/lib/next-script.jsx'),
      },
    },
    define: {
      'process.env': processEnv,
    },
    server: {
      port: 3000,
    },
  };
});
