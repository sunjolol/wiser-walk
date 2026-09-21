/**
 * A picture for a quiz.
 *
 * The home page pairs each quiz with a Doré engraving printed in one ink, so the four cards
 * read as a family without any two of them looking alike. Any page that shows a quiz as a
 * picture should use the SAME picture, or a reader meets two different faces for one quiz.
 * So the pairing lives here, once, and the home page's own composition is left alone.
 *
 * The Theology Compass is deliberately absent: it has no engraving. It is an instrument, and
 * every page draws it as one — a mark on the dark starry ground. `artFor` returning null is
 * how a page is told to do that, rather than by naming the Compass in a condition.
 *
 * Every plate is Gustave Doré, 1866, public domain. Credits: public/img/CREDITS.md.
 */
export interface QuizArt {
  src: string;
  /** What is actually in the plate. Never the quiz's title dressed up as a description. */
  alt: string;
  /** Where the crop should sit, so a face is not cut off by a card's aspect ratio. */
  objectPosition: string;
}

const ART: Record<string, QuizArt> = {
  'bible-figure': {
    src: '/img/dore-moses.jpg',
    alt: 'Gustave Doré’s engraving of Moses breaking the tablets of the law',
    objectPosition: '50% 18%'
  },
  'spiritual-gifts': {
    src: '/img/dore-paul.jpg',
    alt: 'Gustave Doré’s engraving of Paul preaching to a gathered church at Thessalonica',
    objectPosition: '42% 22%'
  },
  'seven-deadly-sins': {
    src: '/img/dore-eden.jpg',
    alt: 'Gustave Doré’s engraving of Adam and Eve driven out of Eden',
    objectPosition: '50% 12%'
  }
};

export const artFor = (slug: string): QuizArt | null => ART[slug] ?? null;
