/**
 * A saint's page, as data: /saints/<slug>/.
 *
 * The Saints hub is built like the quizzes: the page is a template (src/pages/saints/[slug].astro)
 * and each person is a data file (src/data/saints/<slug>.json) of this shape. Adding a person is
 * adding a file. St Martin of Tours is the first and the standard every other page is held to
 * (design/saints-hub/README.md, "Draft 2 of the mock-up": the owner's notes bind every page).
 *
 * THE RULES THE DATA CARRIES
 *
 * - Real data only. Every claim that is not common knowledge carries a `cite`, and every quotation
 *   is word for word from a public-domain translation, checked by script against the fetched text
 *   (design/saints-hub/tools/verify-quotes.mjs, case-insensitive because of the capitals rule for
 *   God). The evidence behind each file is in design/saints-hub/research/.
 * - A section with nothing checked to fill it is left out of the file, and the template leaves it
 *   off the page and out of the pager. It is never faked, and never padded.
 * - Plain short sentences, in our own voice. No section numbers or § marks.
 * - THE PERSON SHAPES THE PAGE (the owner, 2026-09-25). The sections are the same for everyone,
 *   but no list below has a fixed length: a rich record (the Confessions, the Life of Antony,
 *   Gregory's Dialogues on Benedict) gets as many moments, miracles, traits and lines as are
 *   genuinely worth reading, and a thin one gets three or four. A life with something central
 *   that no section holds gets a section of its own (`extras`). Never pad, never cap.
 *
 * RICH TEXT. Fields typed `Rich` take three marks and nothing else: **bold**, *italic*, and
 * {la|words} for words in Latin (printed in italics, marked lang="la"; {el|...} for Greek).
 * Everything else is escaped, so a stray < in the data can never become markup.
 *
 * A `Cite` is where a line or a claim comes from, as the reader sees it ("Life of St Martin,
 * chapter 3"), with the address of a free copy where one exists. Citations to other sites open
 * in a new tab; the template decides that, not the data.
 */

/** Text with **bold**, *italic* and {la|Latin} marks. */
export type Rich = string;

export interface Cite {
  text: string;
  url?: string;
}

/** A quotation: the words, who is speaking or when (optional), and where it comes from. */
export interface Quote {
  /** The words as the page prints them, capitals for God applied; no surrounding quotation marks. */
  q: string;
  /** The line under it: "Sulpicius Severus", "On seeing a sheep that had just been shorn." */
  who?: Rich;
  cite: Cite;
}

export interface Picture {
  /** A path under /img/, e.g. /img/saints/martin-of-tours.jpg */
  src: string;
  alt: string;
  width: number;
  height: number;
  /** What the picture is and who made it, printed as a caption or credit line. */
  credit: string;
  /** Its page on Wikimedia Commons or the museum, for the sources list and the image's metadata. */
  page?: string;
  /** "CC0", "Public domain" */
  license: string;
  /** The painter, for the image's metadata. */
  creator?: string;
}

export interface Feast {
  /** 1 to 12 */
  month: number;
  day: number;
  /** Who keeps it, and anything about it: "**Catholic** memorial. Also the **Church of England**…" */
  text: Rich;
}

export interface SaintPage {
  /** The address: /saints/<slug>/. The same slug as his old /early-christian/ page where he had one. */
  slug: string;
  /**
   * His key in "Which early Christian thinks like you?" (src/data/which-early-christian.json),
   * where he is one of its 22. Draws "Where he stood" from the quiz's own checked cells.
   */
  wec?: string;
  /** His type in the Christian Personality Test (src/data/personality.json TYPES), where it names him. */
  type?: string;
  /** Where the test names him as a young man (the Spark's Augustine, the Herald's Basil). */
  typeYoung?: boolean;

  /** The H1: the plain name, the searched form ("Martin of Tours", never "St Martin" alone). */
  name: string;
  /** How the page refers to him after that: "Martin". */
  short: string;
  /** For "his" and "her" in the template's own few words. */
  she?: boolean;
  /**
   * An honest status line where churches do not count him a saint: "Church Father. Not counted a
   * saint." Printed under his name as a pill, so it stays short: 50 characters at most (Clement's
   * first ran to 88 and the owner found it "WAY too long for a pill"; it is now "Church Father,
   * not a saint in most traditions"). The page's "Is he a saint?" holds the detail. The hub's
   * card prints it without "Church Father". Never "St" for such a person anywhere.
   */
  status?: string;

  /** The search listing. Title 65 characters or fewer; description 50 to 160, ending in a full stop. */
  seo: { title: string; description: string };
  /** JSON-LD for the Person the page is about. */
  person: {
    alternateName?: string[];
    birthPlace?: string;
    deathPlace?: string;
    /** Wikipedia and Wikidata, exactly. */
    sameAs: string[];
  };
  /** When the page first went up and when its words last changed, YYYY-MM-DD. */
  published: string;
  modified: string;

  /** The band. */
  band: {
    /** "About 316 to 397 · Gaul, today's France" is `dates` and `where` joined. */
    dates: string;
    where: string;
    lede: Rich;
    picture: Picture;
    /** Where the face is, as an object-position, on a phone and on a wide screen (checked 320 to 390). */
    posM: string;
    posD: string;
  };

  /** The hub's card: one line on who he was, and a portrait cropped to his face. */
  card: {
    line: string;
    /** A square-ish portrait for the card and the "people like him" chips: a path under /img/. */
    img: string;
    /** object-position for the card crop */
    focus?: string;
  };
  /** The hub's filters. */
  filters: {
    /** Group keys: fathers, desert, cappadocians, teachers, martyrs, women, monks, apostolic */
    groups: string[];
    /** pre300 | 300s | 400s | 500on */
    lived: string;
    /** east, west, or both */
    side: string[];
    /** Extra words the hub's search should find him by: "anthony", "golden mouth". */
    alias?: string;
  };

  /** "Who was Martin?": 40 to 60 words, plain, near the top. */
  who: string;

  /** AT A GLANCE */
  roles?: Array<{ name: string; line: string }>;
  /** "In numbers": only numbers people care about, each with its source. Never a rating. */
  numbers?: Array<{ chip: string; n: string; lines: string[]; src: string }>;
  facts: Array<{ label: string; text: Rich }>;
  /** A second picture, usually an icon or a painting from the other half of the Church. */
  portrait?: Picture & { caption: Rich };
  /** The personality box: why the test places him where it does, in a line or two. */
  typeNote?: Rich;
  feasts?: {
    west: Feast[];
    east: Feast[];
    /** A note under both columns: why the dates differ, the old calendar's 13 days. */
    note?: Rich;
  };

  /** WHAT WAS HE LIKE? Traits, each shown by what he did or said, with its source. */
  traits?: Array<{ title: string; text: Rich; cite: Cite }>;

  /** WHAT OTHERS SAID OF HIM */
  said?: { lede?: Rich; quotes: Quote[] };

  /** HIS LIFE IN N MOMENTS (the number is counted, never typed) */
  moments?: Array<{ place: string; when: string; title: string; text: Rich; cite: Cite }>;

  /**
   * HIS MIRACLES, where the sources record them. Told as the source tells it, quoted and cited,
   * never hedged in our voice; doubts are given in the sources' own words.
   */
  miracles?: {
    lede: Rich;
    pledge?: Quote;
    /** A dark panel for the headline wonder: "3 raised from the dead". */
    feature?: {
      n: string;
      title: string;
      items: Array<{ place: string; when: string; title: string; text: Rich; quote: string; witness?: Rich; cite: Cite }>;
      note?: { text: Rich; cite: Cite };
    };
    more?: Array<{ title: string; text: Rich; quote: string; cite: Cite }>;
    doubt?: { title: string; text: Rich; cites: Cite[] };
  };

  /** HIS WORDS */
  words?: {
    /** A line under the heading, e.g. that he wrote nothing and these are recorded by a friend. */
    note?: Rich;
    /** The one line on the dark panel. */
    feature?: { kicker: string; q: string; ctx?: Rich; cite: Cite; ghost?: string };
    quotes: Quote[];
  };

  /** OFTEN MISQUOTED: what is often said, and what the sources say. */
  myths?: Array<{ claim: Rich; truth: Rich; cite: Cite }>;

  /** WHERE HE STOOD: the quiz's cells, with where in the work each line is. */
  stood?: {
    lede?: Rich;
    /** "as Sulpicius Severus recorded it" */
    recorder?: string;
    /**
     * Per statement id: the work as this page names it (where the quiz's short name will not do:
     * "Letter 3, to Bassula"), the place inside it ("chapter 27"), and a free copy of it.
     */
    places?: Record<string, { work?: string; place?: string; url?: string }>;
  };

  /**
   * FRIENDS, FAMILY AND RIVALS. People he knew or argued with, each in a sentence. `key` links to
   * their page where they have one (a hub key, e.g. 'basil').
   */
  circle?: Array<{ key?: string; name: string; text: Rich; cite?: Cite }>;

  /** HOW HE DIED */
  death?: {
    big: Rich;
    paras: Rich[];
    later?: { title: string; text: Rich; cite: Cite };
    /** The dark panel: his prayer, his last words. */
    last?: { items: Array<{ k: string; q: string; ctx?: Rich }>; cite: Cite };
  };

  /** IS HE A SAINT? */
  saint: {
    big: Rich;
    churches: Array<{ church: string; status: string; note: string }>;
    paras?: Rich[];
    quotes?: Quote[];
  };

  /** A PRAYER HE WROTE, only when it is really his. */
  prayer?: { intro?: Rich; q: string; cite: Cite };

  /** WHAT TO READ FIRST: free copies only. */
  reads?: Array<{ title: string; by: string; text: Rich; url: string; label?: string }>;

  /** PEOPLE LIKE HIM. Hub keys (or personality picture keys) of people like him, with a line each. */
  kin?: Array<{ key: string; name: string; text: Rich; cite: string }>;

  /**
   * A SECTION OF HIS OWN, where his life has something central that no standard section holds:
   * Benedict's Rule, Jerome's Bible, Augustine's garden, Chrysostom's exiles, Boethius's prison
   * book. Each is placed after a standard section (`after`: who, glance, like, said, life,
   * miracles, words, myths, stood, circle, death, saint, prayer, read) and joins the pager.
   * Use it for what is genuinely his, never to fill space.
   */
  extras?: Array<{
    /** The section's anchor: a short slug, e.g. "the-rule" */
    id: string;
    /** In plain words, as the other titles: "His Rule", "The Bible he translated" */
    title: string;
    after: string;
    lede?: Rich;
    /** Blocks, each a panel: a heading, text, an optional quotation and its source. */
    items: Array<{ title?: string; text: Rich; quote?: string; cite?: Cite }>;
  }>;

  /** SOURCES, in groups: "His life, and his words", "Reference", "Calendars", "Pictures". */
  sources: Array<{
    heading: string;
    /** `text` is the link; `after` is printed straight after it, with its own leading punctuation
        (". Tr. Alexander Roberts, 1894." or ", Memorial of Saint Martin of Tours"). */
    items: Array<{ text: Rich; url?: string; after?: Rich }>;
  }>;
}
