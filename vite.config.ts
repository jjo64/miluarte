import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  build: {
    rollupOptions: {
      output: {
        // Vendor splitting: separate heavy libraries into cacheable chunks.
        // React ecosystem, GSAP, Framer Motion and icons each get their own file.
        // Browsers cache them independently — on repeat visits only changed chunks re-download.
        manualChunks: {
          'vendor-react':  ['react', 'react-dom', 'react-router'],
          'vendor-motion': ['motion/react'],
          'vendor-gsap':   ['gsap'],
          'vendor-icons':  ['lucide-react'],
        },
      },
    },
  },
})
