/**
 * The names of the site's line marks, in one place.
 *
 * An .astro component cannot export a type for another module to import, so the union that
 * Icon.astro draws and that Hero.astro accepts lives here instead. Add a name here when you
 * draw a new mark in Icon.astro, and nothing else has to be told about it.
 */
export type IconName =
  | 'compass' | 'flame' | 'scroll' | 'book' | 'arrow'
  | 'users' | 'sparkle' | 'mail' | 'pencil' | 'clock' | 'quote' | 'play' | 'path' | 'apple';
