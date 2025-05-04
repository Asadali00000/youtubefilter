import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'create-manifest',
      buildEnd() {
        // Ensure dist directory exists
        if (!existsSync('dist')) {
          mkdirSync('dist');
        }
        
        // Create manifest.json in dist
        console.log("creating manifest files")
        const manifest = {
          manifest_version: 3,
          name: "YouTube Content Filter",
          version: "1.0",
          description: "Filter YouTube videos based on title content using Gemini API",
          permissions: [
            "storage",
            "tabs",
            "scripting"
          ],
          host_permissions: [
            "https://www.youtube.com/*",
            "https://*.googleapis.com/*"
          ],
          background: {
            service_worker: "background.js"
          },
          content_scripts: [
            {
              matches: ["https://www.youtube.com/*"],
              js: ["content.js"]
            }
          ],
          // action: {
          //   default_popup: "index.html",
          //   default_icon: {
          //     "16": "icon.png",
          //     "48": "icon.png",
          //     "128": "icon.png"
          //   }
          // },
          // icons: {
          //   "16": "icon.png",
          //   "48": "icon.png",
          //   "128": "icon.png"
          // }
        };
        
        writeFileSync('dist/manifest.json', JSON.stringify(manifest, null, 2));
        
        // Copy icon to dist folder
        if (existsSync('public/icon.png')) {
          copyFileSync('public/icon.png', 'dist/icon.png');
        }
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/background.js'),
        content: resolve(__dirname, 'src/content.js')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background' || chunkInfo.name === 'content') {
            return '[name].js';
          }
          return 'assets/[name]-[hash].js';
        }
      }
    }
  }
});