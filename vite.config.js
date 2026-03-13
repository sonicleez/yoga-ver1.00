import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        port: 3000,
        open: true,
        proxy: {
            '/api/google-ai': {
                target: 'https://generativelanguage.googleapis.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/google-ai/, ''),
            },
            '/api/vertex-key': {
                target: 'https://vertex-key.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/vertex-key/, ''),
            },
            '/api/gommo': {
                target: 'https://api.gommo.net',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/gommo/, ''),
            },
        },
    },
    build: {
        outDir: 'dist',
    },
});
