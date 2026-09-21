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
    /**
     * The day the piece was last genuinely rewritten, where that has happened. Optional, and
     * deliberately unset on every article today: it is the ONLY date the sitemap stamps as
     * `lastmod` and the only one the article's `dateModified` is allowed to come from, so a
     * value here has to be a real edit rather than the day of a deploy. Google uses lastmod
     * only where it is verifiably accurate, and a build timestamp on ninety-seven pages is
     * how a site teaches it to ignore the field.
     */
    updated: z.coerce.date().optional(),
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
