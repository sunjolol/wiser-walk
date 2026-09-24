/**
 * A picture for a quiz, and a plate for a figure.
 *
 * The home page pairs each quiz with a Doré engraving printed in one ink, so the cards
 * read as a family without any two of them looking alike. Any page that shows a quiz as a
 * picture should use the SAME picture, or a reader meets two different faces for one quiz.
 * So the pairing lives here, once, and the home page's own composition is left alone.
 *
 * The Theology Compass is deliberately absent: it has no engraving. It is an instrument, and
 * every page draws it as one — a mark on the dark starry ground. `artFor` returning null is
 * how a page is told to do that, rather than by naming the Compass in a condition.
 *
 * FIGURES (added 2026-09-21, the dawn pass). Doré drew most of the people in the figure
 * quiz, so a figure page opens on the plate of that person rather than on a generic one.
 * Rules the plates were chosen under, and which the next person to add one must keep:
 *
 *   - the plate has to SHOW that person, not merely belong to their book
 *   - nothing violent: no severed heads, no battlefield dead. Judith's plate is the one
 *     where she stands praying with the sword still on the floor, never the one after
 *   - a figure with no suitable plate gets none, and falls back to the quiz's own picture,
 *     which is honest: we are not pretending to have a portrait we do not have
 *
 * Every plate is Gustave Doré, 1866, public domain, except the early Christians quiz's, which
 * is Dürer's (1514, public domain), and the Christian Personality Test's, which is not an
 * engraving at all: the eight paintings its types wear, in colour (all public domain).
 * Credits: public/img/CREDITS.md.
 */
export interface QuizArt {
  src: string;
  /** What is actually in the plate. Never the quiz's title dressed up as a description. */
  alt: string;
  /** Where the crop should sit, so a face is not cut off by a card's aspect ratio. */
  objectPosition: string;
  /**
   * A brightness multiplier for this plate alone, where the printing is unusually light or
   * dark. Doré's Thessalonians plate is mostly white wall and blows out under the lift the
   * other plates need; home.css already dims that one picture for the same reason.
   */
  lift?: number;
  /**
   * Paintings in colour, printed as they are: never through the soft sepia the engravings get
   * (and never the engravings' `lift`, which is a brightness for that sepia). A card sets its
   * picture's filter to none; a band shows it as `kind="painting"`. Only the Christian
   * Personality Test's picture is one so far.
   */
  colour?: boolean;
}

const ART: Record<string, QuizArt> = {
  /* The eight paintings the test's eight types wear, two across and four down, in the types'
     own order (build-personality-data.mjs makes it from the report's pictures). Colour, on
     purpose: the owner loves the old art but wants colour, and the other quizzes are ink.
     The crop keeps the top two rows, the three at lunch and the wedding dance over the well
     and the forge, which are the part a card shows above its words. */
  personality: {
    src: '/img/personality/mosaic.jpg',
    alt: 'Eight paintings in a grid: the painter, his wife and a friend talking over lunch (Krøyer), a village wedding dance (Bruegel), Rebecca at the well (Murillo), a family at an iron forge (Wright of Derby), a monastery across a still river (Levitan), a sailor on watch under a ship’s bell (Homer), a lone oak in a wide valley (Friedrich) and Paul preaching in Athens (Raphael)',
    objectPosition: '50% 0%',
    colour: true
  },
  'bible-figure': {
    src: '/img/dore-moses.jpg',
    alt: 'Gustave Doré’s engraving of Moses breaking the tablets of the law',
    objectPosition: '50% 18%'
  },
  'spiritual-gifts': {
    src: '/img/dore-paul.jpg',
    alt: 'Gustave Doré’s engraving of Paul preaching to a gathered church at Thessalonica',
    objectPosition: '38% 44%',
    lift: 0.84
  },
  'seven-deadly-sins': {
    src: '/img/dore-eden.jpg',
    alt: 'Gustave Doré’s engraving of Adam and Eve driven out of Eden',
    objectPosition: '50% 12%'
  },
  /* The plate David's own figure page wears, and on purpose: the finished example of this
     quiz is Psalm 3, "when he fled from his son Absalom", and this is the same story's end.
     A king crowned and alone, grieving the son who hunted him; nothing violent in it. */
  'which-psalm': {
    src: '/img/figures/david.jpg',
    alt: 'Gustave Doré’s engraving of David standing crowned and bowed as he mourns Absalom',
    objectPosition: '48% 30%'
  },
  /* Not Doré, who drew the Bible and not the Church, but an engraving of the same family:
     Albrecht Dürer's Saint Jerome in His Study (1514). Jerome is one of the twenty-two a result
     can name, and he is doing what every one of them is remembered for: writing. Calm, and
     nothing violent in it; the lion and the dog are asleep. */
  'which-early-christian': {
    src: '/img/durer-jerome.jpg',
    alt: 'Albrecht Dürer’s engraving of Saint Jerome writing at his desk, a lion and a dog asleep on the floor of his study',
    objectPosition: '62% 58%'
  }
};

export const artFor = (slug: string): QuizArt | null => ART[slug] ?? null;

/**
 * How a card prints a `colour` picture, as an inline style on its <img> (the cards' own sheets
 * set the engravings' sepia, and this undoes it for this one picture): as it is, with no filter,
 * and fading into the card's dark ground from a little above the words. The Personality Test's
 * lower rows are a pale river and a pale sky, and through the plates' scrim they showed as a
 * light box behind the title. The home page does the same in home.css (.room--personality).
 */
export const COLOUR_PRINT =
  'filter:none;-webkit-mask-image:linear-gradient(180deg,#000 40%,transparent 80%);' +
  'mask-image:linear-gradient(180deg,#000 40%,transparent 80%)';

/**
 * The plate for one figure in the "Who in the Bible are you most like?" quiz, keyed by the
 * figure's slug. `alt` says what the plate shows; `objectPosition` keeps the person in the
 * crop when the band cuts a tall plate down to a strip.
 */
const FIGURE_ART: Record<string, QuizArt> = {
  abraham: {
    src: '/img/figures/abraham.jpg',
    alt: 'Gustave Doré’s engraving of Abraham’s household going out towards Canaan with their flocks',
    objectPosition: '50% 46%'
  },
  moses: {
    src: '/img/dore-moses.jpg',
    alt: 'Gustave Doré’s engraving of Moses breaking the tablets of the law',
    objectPosition: '50% 24%'
  },
  joseph: {
    src: '/img/figures/joseph.jpg',
    alt: 'Gustave Doré’s engraving of Joseph interpreting Pharaoh’s dream in the hall of the court',
    objectPosition: '56% 42%'
  },
  david: {
    src: '/img/figures/david.jpg',
    alt: 'Gustave Doré’s engraving of David standing crowned and bowed as he mourns Absalom',
    objectPosition: '48% 34%'
  },
  jonathan: {
    src: '/img/figures/jonathan.jpg',
    alt: 'Gustave Doré’s engraving of David and Jonathan together in a wooded valley',
    objectPosition: '50% 52%'
  },
  elijah: {
    src: '/img/figures/elijah.jpg',
    alt: 'Gustave Doré’s engraving of Elijah under the juniper tree, an angel above him',
    objectPosition: '46% 40%'
  },
  nehemiah: {
    src: '/img/figures/nehemiah.jpg',
    alt: 'Gustave Doré’s engraving of Nehemiah looking over the broken walls of Jerusalem',
    objectPosition: '50% 40%'
  },
  daniel: {
    src: '/img/figures/daniel.jpg',
    alt: 'Gustave Doré’s engraving of Daniel standing in the lions’ den under a shaft of light',
    objectPosition: '52% 34%'
  },
  'john-the-baptist': {
    src: '/img/figures/john-the-baptist.jpg',
    alt: 'Gustave Doré’s engraving of John the Baptist preaching to a crowd in the wilderness',
    objectPosition: '52% 36%'
  },
  peter: {
    src: '/img/figures/peter.jpg',
    alt: 'Gustave Doré’s engraving of Peter received in the house of Cornelius',
    objectPosition: '50% 42%'
  },
  /* No calm plate of Paul alone exists on Commons at a usable size, and the one of his
     arrest is a riot with the dead on the ground. He keeps the preaching plate the gifts
     quiz wears, which is the same man doing the same thing. */
  paul: {
    src: '/img/dore-paul.jpg',
    alt: 'Gustave Doré’s engraving of Paul preaching to a gathered church at Thessalonica',
    objectPosition: '38% 44%',
    lift: 0.84
  },
  gideon: {
    src: '/img/figures/gideon.jpg',
    alt: 'Gustave Doré’s engraving of Gideon choosing his three hundred at the water',
    objectPosition: '50% 52%'
  },
  esther: {
    src: '/img/figures/esther.jpg',
    alt: 'Gustave Doré’s engraving of Esther coming before the king of Persia',
    objectPosition: '54% 44%'
  },
  ruth: {
    src: '/img/figures/ruth.jpg',
    alt: 'Gustave Doré’s engraving of Ruth kneeling before Boaz among the reapers',
    objectPosition: '46% 46%'
  },
  'mary-of-nazareth': {
    src: '/img/figures/mary-of-nazareth.jpg',
    alt: 'Gustave Doré’s engraving of the angel’s announcement to Mary',
    objectPosition: '46% 40%'
  },
  martha: {
    src: '/img/figures/martha.jpg',
    alt: 'Gustave Doré’s engraving of Jesus talking with Mary and Martha in their house',
    objectPosition: '54% 44%'
  },
  'mary-magdalene': {
    src: '/img/figures/mary-magdalene.jpg',
    alt: 'Gustave Doré’s engraving of Mary Magdalene kneeling alone among the rocks',
    objectPosition: '48% 42%'
  },
  jesus: {
    src: '/img/figures/jesus.jpg',
    alt: 'Gustave Doré’s engraving of the Sermon on the Mount, the crowd seated on the hillside',
    objectPosition: '50% 30%'
  },
  judith: {
    src: '/img/figures/judith.jpg',
    alt: 'Gustave Doré’s engraving of Judith standing in prayer in the tent of Holofernes',
    objectPosition: '40% 32%'
  },
  tobit: {
    src: '/img/figures/tobit.jpg',
    alt: 'Gustave Doré’s engraving of the angel Raphael with Tobit and his household',
    objectPosition: '54% 48%'
  }
  /* No plate: Deborah, Hannah, Abigail, Rahab, Barnabas. Doré drew no usable one of the
     first four (the Jericho plate that holds Rahab is full of the dead), and none at all of
     Barnabas. They fall back to the quiz's own picture through artForOutcome. */
};

/**
 * The picture for one outcome page. The figure's own plate when there is one, the quiz's
 * picture when there is not, and null for the Compass, which is drawn as an instrument.
 */
export const artForOutcome = (quizSlug: string, outcomeSlug: string): QuizArt | null => {
  if (quizSlug === 'bible-figure') return FIGURE_ART[outcomeSlug] ?? artFor(quizSlug);
  return artFor(quizSlug);
};
