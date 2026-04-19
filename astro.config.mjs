// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://tori2k.github.io',
  base: '/znamya-truda-draft',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()]
  }
});