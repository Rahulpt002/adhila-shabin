import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Social previews (WhatsApp, iMessage, Facebook) need an absolute og:image URL.
 * Set VITE_SITE_URL (e.g. https://shabin-adhila.example.com) at build time to emit it.
 */
function socialImage(siteUrl: string | undefined): Plugin {
  return {
    name: 'social-image',
    transformIndexHtml(html) {
      if (!siteUrl) return html
      const base = siteUrl.replace(/\/$/, '')
      return html.replace(
        '<!-- og:image -->',
        `<meta property="og:url" content="${base}/" />\n    <meta property="og:image" content="${base}/og-image.jpg" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />`,
      )
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    // Relative base so the build works from any folder or sub-path (GitHub Pages, Netlify, etc.)
    base: './',
    plugins: [react(), socialImage(env.VITE_SITE_URL)],
    build: { target: 'es2020' },
  }
})
