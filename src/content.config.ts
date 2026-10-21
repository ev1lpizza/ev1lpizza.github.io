import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const games = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/games' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      tagline: z.string(),
      released: z.coerce.date(),
      updated: z.coerce.date().optional(),
      genre: z.string(),
      tags: z.array(z.string()).default([]),
      controls: z.string(),
      length: z.string(),
      engine: z.string(),
      /** Path under public/ (e.g. /play/dough-dodge/index.html) or a full https URL. */
      embed: z.string(),
      aspect: z.string().default('16 / 10'),
      cover: image().optional(),
      /** Name of a built-in animated preview in src/scripts/attract.ts. Optional. */
      attract: z.string().optional(),
      featured: z.boolean().default(false),
      mobile: z.boolean().default(true),
      /** Shown on the game page before play, e.g. "Flashing lights". */
      warnings: z.array(z.string()).default([]),
      links: z
        .array(z.object({ label: z.string(), url: z.url() }))
        .default([]),
      draft: z.boolean().default(false),
    }),
});

const devlog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/devlog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    game: reference('games').optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { games, devlog };
