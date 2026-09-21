/**
 * The articles as a feed.
 *
 * The one distribution channel that costs the owner nothing to keep: somebody subscribes
 * once and every article after that reaches them with no post, no list and no account. It is
 * announced in the head of every page and linked from nowhere visible, because a feed is for
 * the readers and the aggregators that look for one, not something to explain on a page whose
 * job is to get somebody into an article.
 *
 * Written by hand rather than with a feed package, because it is thirty lines of XML and the
 * site is not taking a dependency for that. Everything below is a real value off the article's
 * own front matter; the enclosure's byte length is read off the file on disk rather than
 * guessed, and a picture we cannot measure simply travels without one.
 *
 * The pure halves (`escapeXml`, `rfc822`, `rssDocument`) are exported so
 * scripts/seo-plumbing-test.mjs can drive them with no build and no network.
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { statSync } from 'node:fs';
import { join } from 'node:path';
import { SEO } from '../../lib/seo';

/** Everything XML treats as markup, in both text and attributes. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * RSS wants RFC 822. Built from the UTC parts by hand rather than through a locale, so the
 * feed reads the same whatever machine the build runs on — the same reason the article list
 * has a tie-break.
 */
export function rfc822(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${DAYS[date.getUTCDay()]}, ${pad(date.getUTCDate())} ${MONTHS[date.getUTCMonth()]} ` +
    `${date.getUTCFullYear()} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:` +
    `${pad(date.getUTCSeconds())} GMT`
  );
}

export interface FeedItem {
  title: string;
  /** Absolute. A feed is read far from the site, so nothing relative survives the trip. */
  link: string;
  description: string;
  pubDate: Date;
  enclosure?: { url: string; length: number; type: string };
}

export interface FeedChannel {
  title: string;
  description: string;
  /** Absolute address of the feed itself, for atom:link rel="self". */
  self: string;
  /** Absolute address of the page the feed is about. */
  link: string;
  items: FeedItem[];
}

export function rssDocument(channel: FeedChannel): string {
  const newest = channel.items[0];
  const items = channel.items.map(item => {
    const enclosure = item.enclosure
      ? `\n      <enclosure url="${escapeXml(item.enclosure.url)}" length="${item.enclosure.length}" type="${escapeXml(item.enclosure.type)}" />`
      : '';
    return (
      `    <item>\n` +
      `      <title>${escapeXml(item.title)}</title>\n` +
      `      <link>${escapeXml(item.link)}</link>\n` +
      // The link is permanent and unique, so it is the guid as well.
      `      <guid isPermaLink="true">${escapeXml(item.link)}</guid>\n` +
      `      <pubDate>${rfc822(item.pubDate)}</pubDate>\n` +
      `      <description>${escapeXml(item.description)}</description>` +
      enclosure +
      `\n    </item>`
    );
  });
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n` +
    `  <channel>\n` +
    `    <title>${escapeXml(channel.title)}</title>\n` +
    `    <link>${escapeXml(channel.link)}</link>\n` +
    `    <description>${escapeXml(channel.description)}</description>\n` +
    `    <language>en</language>\n` +
    // The newest article's own date, not the hour of the build: a feed that changed its
    // header every deploy would be reporting a change that never happened.
    (newest ? `    <lastBuildDate>${rfc822(newest.pubDate)}</lastBuildDate>\n` : '') +
    `    <atom:link href="${escapeXml(channel.self)}" rel="self" type="application/rss+xml" />\n` +
    items.join('\n') +
    (items.length ? '\n' : '') +
    `  </channel>\n` +
    `</rss>\n`
  );
}

/**
 * The picture's size on disk, so an enclosure can state a true byte length or none at all.
 *
 * Anchored on the working directory, not on `import.meta.url`: this endpoint is bundled into
 * dist/server before it runs, so a path relative to the module resolves somewhere that does
 * not exist and every enclosure quietly disappears. `astro dev` and `astro build` both run
 * from site/, which is also Vercel's root directory.
 */
export function bytesOf(publicPath: string): number | null {
  try {
    return statSync(join(process.cwd(), 'public', publicPath)).size;
  } catch {
    return null;
  }
}

export const GET: APIRoute = async context => {
  const site = context.site ?? new URL('https://wiserwalk.com/');
  const abs = (path: string) => new URL(path, site).href;

  const articles = (await getCollection('articles'))
    .filter(a => !a.data.draft)
    .sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf()
      || a.data.title.localeCompare(b.data.title));

  const items: FeedItem[] = articles.map(a => {
    const bytes = a.data.image?.endsWith('.jpg') ? bytesOf(a.data.image) : null;
    return {
      title: a.data.title,
      link: abs(`/articles/${a.id}/`),
      description: a.data.description,
      pubDate: a.data.updated ?? a.data.published,
      ...(a.data.image && bytes !== null
        ? { enclosure: { url: abs(a.data.image), length: bytes, type: 'image/jpeg' } }
        : {})
    };
  });

  const xml = rssDocument({
    title: 'Wiser Walk articles',
    description: SEO['/articles/'].description,
    self: abs('/articles/feed.xml'),
    link: abs('/articles/'),
    items
  });

  return new Response(xml, {
    headers: { 'content-type': 'application/rss+xml; charset=utf-8' }
  });
};
