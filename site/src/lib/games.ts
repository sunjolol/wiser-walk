/**
 * Games are the third kind of thing on the site, beside quizzes and articles. A quiz tells
 * you something about yourself from your answers; a game is played against a clock and
 * counts knowledge. Like a quiz, a game is data plus a page: adding one means adding an
 * entry here and a route under /play/, never a change to the home page.
 */
import slsMeta from '../games/sounds-like-scripture.meta.json';

export interface Game {
  slug: string;
  title: string;
  tagline: string;
  /** The small grey line under the tagline. */
  meta: string;
  icon: 'compass' | 'flame' | 'scroll' | 'book' | 'arrow';
  /** Always built from the slug, so a card cannot point somewhere the route does not exist. */
  href: string;
  live: boolean;
}

const game = (g: Omit<Game, 'href'>): Game => ({ ...g, href: `/play/${g.slug}/` });

export const GAMES: Game[] = [
  game({
    slug: 'sounds-like-scripture',
    title: 'Sounds Like Scripture',
    tagline:
      'A line appears. Is it in the Bible, or does it only sound like it? Ten lines, a few seconds each, and it is harder than you think.',
    meta: `${slsMeta.items} lines, every one quoted word for word · about two minutes a run`,
    icon: 'scroll',
    live: true
  })
];

export const liveGames = (): Game[] => GAMES.filter(g => g.live);
