// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// For a user site (ev1lpizza.github.io) the base is "/".
// For a project repo (github.com/ev1lpizza/arcade) set SITE_BASE=/arcade in the workflow.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://ev1lpizza.github.io',
  base: process.env.SITE_BASE ?? '/',
  trailingSlash: 'always',
  integrations: [sitemap()],
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
});
