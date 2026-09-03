import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Articles are a first-class part of the site, not an afterthought bolted on.
 * `quizzes` is what makes the cross-linking work in both directions: a result page
 * offers the articles that speak to it, and an article offers the quizzes it relates to.
 */
const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    published: z.coerce.date(),
    minutes: z.number().int().positive(),
    tags: z.array(z.string()).default([]),
    quizzes: z.array(z.string()).default([]),
    draft: z.boolean().default(false)
  })
});

export const collections = { articles };
