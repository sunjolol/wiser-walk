/**
 * The Saints hub's people, and where each one's page is.
 *
 * Three kinds of page hold a person on this site, and the hub lists all of them in one place:
 *
 *   /saints/<slug>/          a full page, from src/data/saints/<slug>.json (St Martin first)
 *   /early-christian/<slug>/ the 21 early Christians of "Which early Christian thinks like
 *                            you?" who do not have a full page YET. The owner, 2026-09-24:
 *                            each moves to /saints/ only when his new page is as full as
 *                            Martin's. When one does, its data file appears here, this list
 *                            points at /saints/ by itself, and the old address gets a 301 in
 *                            vercel.json. Nothing else changes.
 *   /figure/<slug>/          Bible people (their pages belong to the Bible figure quiz)
 *
 * Only people with a page are on the hub: a card that goes nowhere is a dead end, and there are
 * no placeholder pages (quiz page rule 10). The personality test's other people (Arsenius,
 * Monica, Cuthbert, Guthlac, Philip Neri; Isaiah, Jeremiah, Mary of Bethany) join when theirs
 * are written.
 *
 * SERVER ONLY. It reads the full quiz and saints data; a <script> must never import it.
 */
import wec from '../../data/which-early-christian.json';
import personality from '../../data/personality.json';
import type { SaintPage } from './types';
import { hasMoved } from './moved';

const files = import.meta.glob<SaintPage>('../../data/saints/*.json', { eager: true, import: 'default' });

/** Every full page, by slug. */
export const SAINTS: Record<string, SaintPage> = Object.fromEntries(
  Object.values(files).map(p => [p.slug, p])
);
export const saintOf = (slug: string): SaintPage => {
  const p = SAINTS[slug];
  if (!p) throw new Error(`saints: no page ${slug}`);
  return p;
};

type WecPerson = {
  slug: string; name: string; short: string; she: boolean; dates: string; where: string; who: string;
  status: string | null; portrait: { src: string; credit: string }; pairs: Record<string, string>;
};
const WEC = wec as unknown as { oldestFirst: string[]; people: Record<string, WecPerson> };

type TypeKey = keyof typeof personality.TYPES;
export const TYPES = personality.TYPES as Record<string, { name: string; ink: string; tagline: string; disposition: string; makeup: string; kindred: Array<{ who: string; img: string; text: string; src: string }> }>;

/**
 * The hub's filters for the 21 who are still on /early-christian/ (a full page carries its own,
 * in `filters`). Taken from the approved mock-up (design/saints-hub/mockup/src/build.mjs).
 */
const MOCK: Record<string, { groups: string; lived: string; side: string; focus: string; alias?: string }> = {
  justin: { groups: 'fathers martyrs', lived: 'pre300', side: 'east', focus: '50% 14%' },
  irenaeus: { groups: 'fathers', lived: 'pre300', side: 'east west', focus: '50% 30%' },
  clement: { groups: 'fathers', lived: 'pre300', side: 'east', focus: '50% 22%' },
  tertullian: { groups: 'fathers', lived: 'pre300', side: 'west', focus: '45% 22%' },
  origen: { groups: 'fathers', lived: 'pre300', side: 'east', focus: '50% 25%' },
  cyprian: { groups: 'fathers martyrs', lived: 'pre300', side: 'west', focus: '50% 12%' },
  lactantius: { groups: 'fathers', lived: '300s', side: 'west', focus: '50% 35%' },
  antony: { groups: 'desert monks', lived: '300s', side: 'east', focus: '50% 12%', alias: 'anthony' },
  martin: { groups: 'monks', lived: '300s', side: 'west', focus: '50% 9%' },
  macrina: { groups: 'cappadocians women monks', lived: '300s', side: 'east', focus: '50% 10%' },
  nazianzen: { groups: 'fathers cappadocians teachers', lived: '300s', side: 'east', focus: '50% 8%', alias: 'gregory the theologian nazianzen nazianzus' },
  basil: { groups: 'fathers cappadocians teachers', lived: '300s', side: 'east', focus: '50% 10%' },
  nyssa: { groups: 'fathers cappadocians', lived: '300s', side: 'east', focus: '50% 25%', alias: 'nyssen' },
  ambrose: { groups: 'fathers teachers', lived: '300s', side: 'west', focus: '50% 30%' },
  chrysostom: { groups: 'fathers teachers', lived: '400s', side: 'east', focus: '50% 25%', alias: 'john golden mouth' },
  jerome: { groups: 'fathers teachers', lived: '400s', side: 'west', focus: '70% 40%' },
  augustine: { groups: 'fathers teachers', lived: '400s', side: 'west', focus: '50% 30%', alias: 'hippo' },
  cassian: { groups: 'fathers desert monks', lived: '400s', side: 'east west', focus: '50% 35%', alias: 'john' },
  boethius: { groups: '', lived: '500on', side: 'west', focus: '50% 45%' },
  benedict: { groups: 'monks', lived: '500on', side: 'west', focus: '40% 25%' },
  gregory: { groups: 'fathers teachers', lived: '500on', side: 'west', focus: '55% 20%', alias: 'pope gregory i dialogus' },
  isaac: { groups: 'fathers monks', lived: '500on', side: 'east', focus: '50% 22%', alias: 'isaac of nineveh' }
};

/** Where the Christian Personality Test places each of the early Christians it names. */
const TYPE_OF: Record<string, [string, boolean?]> = {
  antony: ['hearth'], augustine: ['spark', true], gregory: ['deepwell'], chrysostom: ['forge'], jerome: ['forge'],
  nazianzen: ['stillwater'], martin: ['oak'], benedict: ['oak'], basil: ['herald', true]
};

/** The Bible people on the hub: the personality test's, where the Bible figure quiz has a page. */
const BIBLE = [
  { slug: 'moses', name: 'Moses', line: 'He begged God to send someone else. Then he led a whole people through the desert for forty years.', type: 'lookout', testament: 'Old Testament' },
  { slug: 'gideon', name: 'Gideon', line: 'He obeyed God, but he did it at night, because he was afraid.', type: 'lookout', testament: 'Old Testament' },
  { slug: 'elijah', name: 'Elijah', line: 'After his great victory on Carmel he ran into the wilderness and sat under a tree.', type: 'deepwell', testament: 'Old Testament' },
  { slug: 'john-the-baptist', name: 'John the Baptist', line: 'He lived in the wilderness until the day he began to preach.', type: 'oak', testament: 'New Testament' },
  { slug: 'martha', name: 'Martha', line: 'Busy with all the preparations. When her brother died, she went out to meet Jesus.', type: 'lookout', testament: 'New Testament', groups: 'women' },
  { slug: 'peter', name: 'Peter', line: 'He denied Christ three times. Then he wept, came back, and led the Church.', type: 'herald', testament: 'New Testament' },
  { slug: 'barnabas', name: 'Barnabas', line: 'The “Son of Encouragement”, who wanted to give young Mark a second chance.', type: 'hearth', testament: 'New Testament' },
  { slug: 'paul', name: 'Paul', line: 'He would not give Mark a second chance. Years later he asked for him.', type: 'forge', testament: 'New Testament' }
];

export interface HubPerson {
  /** The person's key everywhere on the site: their slug, which is also their picture's key. */
  slug: string;
  name: string;
  dates: string;
  line: string;
  status?: string;
  href: string;
  img: string;
  focus: string;
  groups: string[];
  lived: string;
  side: string[];
  type?: string;
  young?: boolean;
  alias: string;
  /** A full /saints/ page, as opposed to an older page elsewhere. */
  full: boolean;
}

const words = (s: string) => s.split(' ').filter(Boolean);

/** Everyone on the hub, oldest first, then the Bible people. */
export const HUB: HubPerson[] = [
  ...WEC.oldestFirst.map((key): HubPerson => {
    const w = WEC.people[key]!;
    const full = hasMoved(w.slug) ? SAINTS[w.slug] : undefined;
    const m = MOCK[key]!;
    const [type, young] = TYPE_OF[key] ?? [];
    if (full) {
      return {
        slug: full.slug, name: full.name, dates: full.band.dates, line: full.card.line,
        status: full.status ? 'Not counted a saint.' : undefined, href: `/saints/${full.slug}/`,
        img: full.card.img, focus: full.card.focus ?? m.focus, groups: full.filters.groups, lived: full.filters.lived,
        side: full.filters.side, type: full.type, young: full.typeYoung, alias: full.filters.alias ?? m.alias ?? '', full: true
      };
    }
    // Ambrose's quiz portrait is a mosaic that crops badly into a card; the mock-up used the
    // personality test's crop of it, as here.
    const ambrose = key === 'ambrose';
    return {
      slug: w.slug, name: w.name, dates: w.dates, line: w.who,
      status: w.status ? 'Not counted a saint.' : undefined, href: `/early-christian/${w.slug}/`,
      img: ambrose ? '/img/personality/faces/ambrose-of-milan.jpg' : w.portrait.src, focus: ambrose ? '50% 40%' : m.focus, groups: words(m.groups), lived: m.lived, side: words(m.side),
      type, young, alias: m.alias ?? '', full: false
    };
  }),
  ...BIBLE.map((b): HubPerson => ({
    slug: b.slug, name: b.name, dates: b.testament, line: b.line, href: `/figure/${b.slug}/`,
    img: `/img/personality/faces/${b.slug}.jpg`, focus: '50% 40%', groups: ['bible', ...words(b.groups ?? '')],
    lived: 'bible', side: [], type: b.type, alias: '', full: false
  }))
];

/** A person's page by their slug, or null where the site has none (Mary of Bethany, today). */
export const hubHref = (slug: string): string | null => HUB.find(p => p.slug === slug)?.href ?? null;

/** A face for a small round portrait: the personality test's crop where it has one. */
export const faceFor = (slug: string): string => {
  const faces = new Set(Object.values(personality.TYPES).flatMap(t => t.kindred.map(k => k.img))
    .concat(Object.values(personality.OPPOSITES).flatMap(o => Object.values(o.people).map(p => p.img))));
  if (faces.has(slug)) return `/img/personality/faces/${slug}.jpg`;
  return HUB.find(p => p.slug === slug)?.img ?? `/img/personality/faces/${slug}.jpg`;
};

/** A person's card picture by slug (for the collections' mosaics). */
export const imgOf = (slug: string): string => HUB.find(p => p.slug === slug)?.img ?? `/img/personality/faces/${slug}.jpg`;

/** The hub's collections, in the mock-up's order: a way in to the list, never a page yet. */
export const COLLECTIONS: Array<{ group: string; title: string; imgs: string[] }> = [
  { group: 'fathers', title: 'Church Fathers', imgs: ['justin-martyr', 'irenaeus-of-lyons', 'origen', 'augustine-of-hippo'] },
  { group: 'desert', title: 'Desert fathers and mothers', imgs: ['antony-the-great'] },
  { group: 'cappadocians', title: 'The Cappadocian fathers', imgs: ['basil-the-great', 'gregory-of-nazianzus', 'gregory-of-nyssa'] },
  { group: 'teachers', title: 'Great teachers of East and West', imgs: ['john-chrysostom', 'ambrose-of-milan', 'gregory-the-great'] },
  { group: 'martyrs', title: 'Martyrs', imgs: ['cyprian-of-carthage'] },
  { group: 'women', title: 'Women of the early Church', imgs: ['macrina-the-younger'] },
  { group: 'bible', title: 'People of the Bible', imgs: ['moses', 'peter', 'paul'] }
];

/** The filters, as the mock-up drew them. */
export const FILTER_KINDS: Array<{ key: string; label: string; note?: string; opts: Array<[string, string, string?]> }> = [
  { key: 'group', label: 'Group', opts: [...COLLECTIONS.map(c => [c.group, c.title] as [string, string]), ['monks', 'Monks and hermits']] },
  { key: 'lived', label: 'Lived', opts: [['pre300', 'Before 300'], ['300s', 'The 300s'], ['400s', 'The 400s'], ['500on', '500 and later'], ['bible', 'In the Bible']] },
  { key: 'side', label: 'East or West', opts: [['east', 'East'], ['west', 'West']] },
  {
    key: 'type', label: 'Personality type', note: 'Where the Christian Personality Test places them. Our reading, not a church’s.',
    opts: Object.keys(personality.TYPES).map(k => [k, TYPES[k]!.name, TYPES[k]!.ink] as [string, string, string])
  }
];

/** "he" and "his", or "she" and "her". */
export const pron = (she?: boolean) => (she ? { he: 'she', his: 'her', him: 'her' } : { he: 'he', his: 'his', him: 'him' });

export type { TypeKey };
