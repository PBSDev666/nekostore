import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    allowedHosts: ['nekostore-frontend-production.up.railway.app'],
  },
  preview: {
    allowedHosts: ['nekostore-frontend-production.up.railway.app'],
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'icons/*.svg',
        'brand/neko-logo-cat.png',
        'brand/neko-logo-text.png',
        'fonts/*.ttf',
      ],
      manifest: {
        name: 'NEKO STORE — Gótica • Oscura • Única',
        short_name: 'NEKO',
        description: 'Moda gótica. Alma oscura. Tienda online desde Costa Rica.',
        theme_color: '#050508',
        background_color: '#050508',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'es',
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'icons/icon-48x48.svg', sizes: '48x48', type: 'image/svg+xml' },
          { src: 'icons/icon-96x96.svg', sizes: '96x96', type: 'image/svg+xml' },
          { src: 'icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'icons/icon-512x512.svg', sizes: '512x512', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        importScripts: ['sw-push.js'],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,ttf}'],
        globIgnores: ['**/brand/contacto.png', '**/brand/nosotros.png'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/\/api\//, /^\/offline\.html$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'unsplash-images',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
