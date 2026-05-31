import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// VITE_BASE_PATH is injected by the GitHub Actions workflow as /<repo-name>/
// Locally it is not set, so the app runs at / with no sub-path.
const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      // injectManifest mode: we own the SW file completely.
      // This avoids the generateSW sub-path registration bug where
      // the auto-generated SW fails to install on GitHub Pages sub-paths.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'BackendCraft — 10-Day Course',
        short_name: 'BackendCraft',
        description: 'Learn Express, Axios & React Query in 10 days',
        theme_color: '#0f1117',
        background_color: '#0f1117',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      injectManifest: {
        // Precache all JS, CSS, HTML, images and font files
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      }
    })
  ]
})
