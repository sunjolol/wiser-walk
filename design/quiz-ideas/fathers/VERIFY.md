# Quiz #4: the check before it goes live (2026-09-23)

One checker, one pass, as the owner asked: verify only what survived his review. Every line the quiz SHOWS (cells of
`quiz.json` without `hide`) and every `who`, `hook`, `status` and `pairs` sentence in `people.json`.

## How the lines were checked

For each shown cell: the `url` of its stance in `research/topics/*.json` (or, for a `use` swap, the matching line in
`research/figures/*.json`) was fetched with curl, tags stripped, entities decoded, and the displayed line searched for
after undoing the allowed edits (capital first letter, closing full stop, capitals on pronouns for God). Then each
line was read in about 1,400 characters of its surrounding text against the statement's current wording in
`model.mjs`, and the work's name was compared with the page. The script was a scratch tool and is not kept here; to
repeat it, fetch the 154 urls and search each line the same way.

Result, after the changes below (197 shown lines, 154 source pages):

- 185 found word for word, punctuation included. In 36 of them the page only puts a space before a question mark or
  after a word the site links (New Advent does this).
- 3 found letter for letter through OCR spacing: tertullian.mystery, origen.deeper, antony.mystery.
- 1 found through OCR misreadings, read by eye: basil.lie (archive.org prints "It 1s" and a stray footnote mark).
- 8 are our own translations ("Our translation" on the page). For each, the original at the url was found whole and
  the English read against it: augustine.nature (Latin, Sermon 68), chrysostom.surplus (Greek), jerome.rich (Latin),
  gregory.calling (Latin, Migne OCR), basil.rich (Greek), basil.surplus (Greek), nazianzen.surplus (Greek),
  benedict.effort (Latin). All are faithful. Two small freedoms, both fair: "But" opens augustine.nature where the
  Latin has no connective, and gregory.calling's "but those we suffer as adversaries" renders a Latin "and" (Gregory
  means the same kin, loved as kin and fled as adversaries).

Lines that could not be loaded: none. One archive.org text (Augustine on Psalm 147) answered 500 on the first try
and loaded on the second.

## Changes to the lines (excerpts.json, table.mjs OVERRIDE)

**The 'pure' statement.** Draft 2 reworded it from the research claim ("a church should be a community of people who
live up to its standards, and those who do not should be put out") to "A church should keep out people who openly
live in serious wrongdoing". The research coded the pure-church quarrel, and its own notes say the Fathers who fought
the pure-church sects still barred open, unrepentant sinners. Against the current wording:

- ambrose.pure: the side was wrong. His line ("Touch me not, for I am pure") mocks those who refuse penitents, which
  is the second-chances question. He kept the emperor Theodosius from the Eucharist after the Thessalonica massacre.
  Recoded -2 to +1 and the line swapped (a `use`) to Letter 51, section 13, read in the source: "I dare not offer the
  sacrifice if you intend to be present. Is that which is not allowed after shedding the blood of one innocent
  person, allowed after shedding the blood of many? I do not think so." The research/figures quote holds the first
  sentence; the two after it were checked on the same page.
- augustine.pure: -2 to -1. "Let the good tolerate the bad" is his side, but he backed excommunication for notorious
  sin (the research says so), so not the strongest disagreement.
- jerome.pure: -2 to -1. The ark line is a mixed church; nothing on record says he opposed barring open sinners.
- nazianzen.pure (a hidden line, still scored): -2 to 0 (off the record). The research: he took a deliberate middle
  line, and in the next section says he too would refuse the unrepentant.
- antony.pure: off the record (was -1, shown as "Do ye wish to drown him that hath been saved?"). The saying is about
  taking back a brother who repented, not about keeping out open sinners, and it read as a riddle without the story.

If 'pure' is ever reworded back toward the research claim, delete that OVERRIDE line: the research codes fit it.

**Other lines.**

- justin.mystery: the `use` line ("Reason directs those who are truly pious... declining to follow traditional
  opinions") answers the emperors about prejudice, not questions about God. Replaced by his own researched line,
  Dialogue with Trypho 2, in his own voice: "Philosophy is, in fact, the greatest possession, and most honourable
  before God, to Whom it leads us and alone commends us." (pronoun capital added).
- jerome.mystery: hidden, still scored -1. The line ended "to know nothing else, to seek nothing else", which on its
  own reads as the opposite side. His probing of Scripture stands in the research, so the position is kept.
- boethius.surplus: hidden, still scored +1. "If all the money in the world were heaped up in one man's possession,
  all others would be made poor" argues that riches are a poor good; it does not say giving is paying back what is
  theirs (the research itself calls it a weak fit). Taking it off the record would leave Boethius on six statements,
  under the floor of seven.
- tertullian.pure: note added: "He wrote this against a bishop who pardoned adultery after penance." Without it,
  "such a proclamation" has nothing to point to.
- antony.quiet and antony.mystery: `by` added, "as the desert monks remembered it". Both come from the Sayings of the
  Desert Fathers, which Antony did not write. (His other lines already said Athanasius or Evagrius recorded them.)
- origen.war: the fix turned the source's "--an army of piety--" into parentheses, an edit outside the rules. It now
  prints the dash New Advent prints: "army — an army of piety — by".
- jerome.calling note: "He wrote this in his twenties" became "He wrote this as a young man". His birth year is
  uncertain (some date it to the 330s). The second sentence now follows his own words in Letter 52.1: he "decked it
  out a good deal with the flourishes of the schools".
- excerpts.json `_how`: says the `fix` edits may also restore typing marks a plain-text copy spells differently (the
  dash above, and Boethius's small-capital "I HAVE"), and points here.

Checked and kept, though a reader might ask:

- chrysostom.tears (-2): the homily goes on at length against lamenting at all; there is no softer passage to weigh.
- chrysostom.alone (-2): he says he would "vote a thousand times over" for the life among people (On the Priesthood).
- gregory.laugh (-1): "foolish mirth" is not every laugh, which is why it is only -1.
- justin.dreams (+1): prophecy rather than dreams; the claim is dreams and visions, so +1, not +2.
- justin.war (-1): the stop cuts "do not only now refrain... but also" after the first half; the meaning holds.
- martin.alone: Gallus says "Martin was accustomed to say to you" to Sulpicius; the "you" is Sulpicius.
- cassian lines: the Conferences put Cassian's teaching in the mouths of desert abbots (Joseph, Moses, Nesteros).
  They are his own pen, so no `by`; scholars read them as his views.
- boethius.calm is verse ("Joy, hope and fear / Suffer not near..."). The capitals mid-line are line starts; the page
  could show the line breaks.

## Changes to people.json (who, hook, status, pairs)

- augustine hook: "Thirty years later" became "Nearly thirty years later" (the theft at sixteen, in 370; the
  Confessions from 397).
- chrysostom who: "His name means golden mouth" became "Chrysostom means golden-mouthed". It was a nickname.
- chrysostom hook: "The empress exiled him twice" became "He angered the empress and was exiled twice". The emperor
  signed the orders and the first exile came through a church synod.
- tertullian status: "Late in life" became "Later in life" (he joined the New Prophecy around 207, in his fifties).
- nazianzen hook: "made a bishop three times against his will" has no source in the research. Now: his father made
  him a priest by force (Oration 2), his best friend made him a bishop against his will (Sasima; Letters 48-50), and he
  resigned Constantinople to go home to "my desert, my country life, and my God" (Oration 42, checked).
- nyssa hook: Basil's Letter 58 (read in full) says Gregory forged one letter and more came after; it never says "too
  simple to be trusted". Now: he forged a letter from his uncle, got caught, and when a third came Basil wrote: "Who
  ever falls a third time into the same nets?"
- lactantius hook: "He watched soldiers tear down the church across from the palace" became "He was teaching in the
  emperor's city when soldiers tore down the church in view of the palace" (Divine Institutes 5.2 puts him there; On
  the Deaths of the Persecutors 12 says "within view of the palace").
- lactantius status (new): "He is not counted a saint. Jerome praised his style but doubted some of his teaching."
  Tertullian and Origen carry the same kind of note; Lactantius had none, though no church venerates him.
- cyprian hook: "When the sword finally came, he said: Thanks be to God" became "Sentenced to die by the sword, he
  said: Thanks be to God". He said it when the sentence was read (Acts of Cyprian).
- antony hook: "At eighteen" became "At about eighteen" (the Life: "about eighteen or twenty").
- justin hook: "a teacher who wanted his fee up front" became "a teacher who asked to be paid". The teacher asked
  after a few days (Dialogue 2).
- irenaeus who: "learned the faith from Polycarp" became "As a boy he heard Polycarp, who had known the apostle John"
  (his own words in the Letter to Florinus).
- martin hook: "told the emperor" became "told his commander, the future emperor Julian". Julian was then Caesar,
  not yet emperor.
- pairs jerome|augustine: "traded sharp letters for twenty years" became "wrote to each other for more than twenty
  years. Their early letters were sharp." Their later letters were warm.

Everything else in people.json checked out against research/figures or the sources: all other hooks, who lines,
status notes and pairs, including Clement's "the whole of life a festival" (Stromata 7.7, read), Basil and the prefect
(Oration 43), Gregory seized for St Peter's (Gregory of Tours), Isaac's five months at Nineveh and the merciful heart,
Cassian's pen, knife and flint (Institutes 8), Benedict's bell on the rope, and Boethius's Muses.

## What it does to results

Rebuilt with `node model.mjs && node preview/build.mjs`. On the 30 simulated people of people-test-1, 6 results
changed. Augustine is now the kindred spirit of 8 in 30 (was 6); the README's balance note said no one had more than
6. The cause is mechanical: with Ambrose, Gregory of Nazianzus and Antony off the "disagree" side of 'pure', that
statement's usual position moved from 0.15 to 0.91, and Augustine now stands out more on it. Rewording 'pure' back
toward the research claim would undo this; that is the main session's call, not a line fix.

## For the main session and wave 2 (outside these files)

Work names come from the research files through `model.mjs`, so they were not changed here. All are right, but some
break the house rules or differ for one book. A small map in `model.mjs` (or in the site's build script) would fix it:

- Numbers a reader should not see: "Evagrius Ponticus, Praktikos, chapter 92, as quoted by Socrates Scholasticus,
  Church History" (Evagrius, as quoted by Socrates in his Church History); "Stromateis, book 6, quoted by Jerome in
  Apology against Rufinus" (Stromateis, as quoted by Jerome); "Mystic Treatises, Treatise 50, 'Short sections...'" (a
  long heading as a title).
- A Latin tail: 'Homily on the words "I will pull down my barns", Homilia in illud: Destruam horrea mea'.
- One book, two or three names: City of God / The City of God; Stromata / The Stromata; Divine Institutes / The
  Divine Institutes; Homilies on Matthew / Homilies on the Gospel of Matthew; Moralia in Job / Morals on the Book of
  Job; Rule of St Benedict / Rule of Benedict / The Rule; Oration 2 / Oration 2, In Defence of His Flight to Pontus;
  On the Christian Faith / On the Christian Faith, to the emperor Gratian; Isaac's Mystic Treatises / Ascetical
  Homilies (the usual English name); four forms of the Life of Antony; three of the Life of St Martin; three of On the
  Soul and the Resurrection.
- "Letter 17" alone, where every other letter names its reader (Ambrose's, to the Emperor Valentinian II).
- Where a `by` is shown after a work that already names the recorder (antony.nature: "Evagrius... as Evagrius
  recorded it"), the page may want only one of the two.
