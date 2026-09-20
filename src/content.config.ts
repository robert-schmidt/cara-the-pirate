import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One markdown file per chapter per language: src/content/chapters/<lang>/<nn>-<slug>.md
// Files are sorted by name, so the number prefix sets the order.
export const collections = {
  chapters: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/chapters' }),
    schema: z.object({
      date: z.string(),
      title: z.string(),
      // background colour while this chapter is on screen
      mood: z.enum(['dawn', 'dusk', 'golden', 'summer']),
      media: z.array(
        z.object({
          photo: z.string().optional(), // file name in src/assets/photos, without .jpg
          video: z.string().optional(), // file name in public/video, without .mp4
          alt: z.string(),
          caption: z.string().optional(),
        }),
      ),
    }),
  }),
};
