import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://carathepirate.com',
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', ro: 'ro' } },
      filter: (page) => !page.includes('/blog-shell'),
      customPages: ['https://carathepirate.com/blog'],
    }),
  ],
});
