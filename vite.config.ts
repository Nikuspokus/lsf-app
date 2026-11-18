import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json' with { type: 'json' }

// base './' : fonctionne quel que soit le nom du dépôt sur GitHub Pages
export default defineConfig({
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(`${pkg.version}+${new Date().toISOString().slice(0, 10)}`),
  },
  plugins: [
    vue(),
    VitePWA({
      // 'prompt' : le nouveau service worker attend la validation de l'utilisateur
      registerType: 'prompt',
      manifest: {
        name: 'Signes — apprendre la LSF',
        short_name: 'Signes',
        description: 'Apprendre la langue des signes française (LSF)',
        lang: 'fr',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#0f172a',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,json}'],
        // médias (vidéos/gifs des signes) : mis en cache à la première lecture, revalidés en arrière-plan
        runtimeCaching: [
          {
            urlPattern: /\/media\/.+\.(mp4|webm|gif|webp)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'lsf-media',
              cacheableResponse: { statuses: [200] },
              expiration: { maxEntries: 500 },
            },
          },
        ],
      },
    }),
  ],
})
