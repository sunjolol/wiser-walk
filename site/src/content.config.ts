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
    draft: z.boolean().default(false),
    /**
     * The article's picture: a public-domain painting, in colour. The quizzes wear Doré's
     * engravings; the articles wear paintings, so the two halves of the site are cousins and
     * not twins. `imagePosition` is the CSS object-position that keeps the subject in a 3:2
     * crop. The credit is printed under the picture on the article's own page.
     */
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    imageCredit: z.string().optional(),
    imagePosition: z.string().optional()
  })
});

export const collections = { articles };
