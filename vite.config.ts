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
      input: {
        main: path.resolve(__dirname, 'index.html'),
        login: path.resolve(__dirname, 'login.html'),
        marketplace: path.resolve(__dirname, 'marketplace.html'),
        profile: path.resolve(__dirname, 'profile.html'),
        adminLogin: path.resolve(__dirname, 'admin/login.html'),
        adminDashboard: path.resolve(__dirname, 'admin/dashboard.html'),
        adminUsers: path.resolve(__dirname, 'admin/users.html'),
        adminListings: path.resolve(__dirname, 'admin/listings.html'),
        adminReports: path.resolve(__dirname, 'admin/reports.html'),
        adminPayments: path.resolve(__dirname, 'admin/payments.html'),
      },
    },
  },
})
