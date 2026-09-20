# Live article repair, 2026-09-19

Files: `site/src/content/articles/how-to-become-more-grateful.md`, `how-to-become-more-joyful.md`,
`what-does-it-mean-to-be-christlike.md`. Not committed, not pushed. `npm run build` in `site/`
(which runs the engine tests first) passes after the edits.

## The three reported problems, verified

1. **Unnamed non-house translation: TRUE.** Ten quotations did not match `_bsb.txt`. All are now
   verbatim BSB. A script extracted every quoted string from the three articles and tested it as a
   substring of `_bsb.txt` (whitespace, bold markers and curly quotes normalised); every Scripture
   quotation passes. The only non-matching quoted strings are not Scripture ("Thank you for
   everything", the Chrysostom line, two rhetorical questions, the word "Christ-like").
2. **"In, not for" with no Ephesians 5:20: TRUE.** BSB Ephesians 5:20: "always giving thanks to God
   the Father for everything in the name of our Lord Jesus Christ." Rewritten, see G6.
3. **Cross-links to the draft quiz: TRUE.** `seven-deadly-sins` was in all three `quizzes` lists, and
   the gratitude article's last sentence pointed at it in prose. Removed. `[slug].astro` always adds
   the Theology Compass and the game to "where to go next", so an empty list still renders links.

## Gratitude

| # | Before | After |
|---|---|---|
| G1 | `quizzes: [seven-deadly-sins]` | `quizzes: []` (the Compass is not genuinely relevant to this piece, so nothing replaces it) |
| G2 | Paul tells the Thessalonians to "give thanks in all circumstances" (1 Thessalonians 5:18) | Paul tells the Thessalonians, "Give thanks in every circumstance" (1 Thessalonians 5:18) |
| G3 | people "did not honour him as God or give thanks to him." | people "neither glorified Him as God nor gave thanks to Him." (Romans 1:21) |
| G4 | "forget not all his benefits" — and then lists them, one by one, forgiveness, healing, redemption, steadfast love. | "do not forget all His kind deeds" — and then lists them, one by one, forgiveness, healing, redemption, loving devotion. (Psalm 103:2-4; "steadfast love" was the other translation's wording for what the BSB calls "loving devotion") |
| G5 | "by prayer and supplication, with thanksgiving, let your requests be made known to God." | "by prayer and petition, with thanksgiving, present your requests to God." (Philippians 4:6) |
| G6 | This is the hard one, and the one 1 Thessalonians 5:18 actually commands. "In all circumstances" is not "for all circumstances" — you are not asked to be glad about the bad thing. You are asked to keep naming what is still good while the bad thing is happening. That is a discipline, and like every discipline it is clumsy at first. | This is the hard one, and the one 1 Thessalonians 5:18 actually commands: "Give thanks in every circumstance." Ephesians 5:20 puts it more strongly still: "always giving thanks to God the Father for everything in the name of our Lord Jesus Christ." Christians have read the two verses together in more than one way. Many let "in" guide "for": thanks is given in the middle of the bad thing, for what is still good and for God's purpose in it, and nobody is asked to be glad about the evil itself. Others take "for everything" at full strength. John Chrysostom, preaching on that verse, asks whether we are to give thanks for everything that befalls us and answers, "Yes; be it even disease, be it even penury" (Homily 19 on Ephesians), and that reading is still taught, especially among the Orthodox. On either reading the practice begins in the same place: you keep naming what is good while the bad thing is happening. That is a discipline, and like every discipline it is clumsy at first. |
| G7 | The same book that says "rejoice always" contains Lamentations. | The same book that says "Rejoice at all times" (1 Thessalonians 5:16) contains Lamentations. (reference added because the quotation had none) |
| G8 | ...and envy, which resents that someone else received more. If you want to see which of the seven has the most pull on you, that quiz is the natural next step. | ...and envy, which resents that someone else received more. (second sentence deleted; the section is now one sentence) |
| G9 | (no foot line) | Rule, then: *Scripture quotations are from the Berean Standard Bible, which is in the public domain. The line from John Chrysostom is from the nineteenth-century Nicene and Post-Nicene Fathers translation of his Homily 19 on Ephesians, also in the public domain.* |

Sources for G6. The Chrysostom sentence was read today at
https://www.newadvent.org/fathers/230119.htm (NPNF first series, Homily 19 on Ephesians): "What
then? Are we to give thanks for everything that befalls us? Yes; be it even disease, be it even
penury." The article quotes only the answer and paraphrases the question. "Still taught, especially
among the Orthodox" rests on Fr Stephen Freeman's piece cited in `research/LANDSCAPE-articles.md`
(finding 1), which that research says argues from this verse and from Chrysostom; I did not reopen
it. Chrysostom is pre-1054 and is claimed for nobody in the text. The first reading ("in" guides
"for") is described without a named holder because I had no page open to cite one; if the owner
wants a name there, it needs a verified source first.

## Joy

| # | Before | After |
|---|---|---|
| J1 | `quizzes: [seven-deadly-sins]` | `quizzes: []` |
| J2 | James tells his readers to "count it all joy" when they meet trials (James 1:2) — count it, an act of reckoning | James writes, "Consider it pure joy, my brothers, when you encounter trials of many kinds" (James 1:2) — consider it, an act of reckoning |
| J3 | He says "rejoice **in the Lord** always" | He says "Rejoice **in the Lord** always" (capital only; BSB Philippians 4:4) |
| J4 | "in your presence there is fullness of joy." | "You will fill me with joy in Your presence, with eternal pleasures at Your right hand." (Psalm 16:11; the point about joy having an address still holds) |
| J5 | "that my joy may be in you, and that your joy may be full." | "so that My joy may be in you and your joy may be complete." (John 15:11) |
| J6 | (no foot line) | Rule, then: *Scripture quotations are from the Berean Standard Bible, which is in the public domain.* |

Unchanged and verified: "sorrowful, yet always rejoicing" (2 Corinthians 6:10) and "the joy of the
LORD is your strength" (Nehemiah 8:10) are already identical in the BSB.

## Christ-like

| # | Before | After |
|---|---|---|
| C1 | `quizzes: [theology-compass, seven-deadly-sins]` | `quizzes: [theology-compass]` (kept: the piece opens on Romans 8:29) |
| C2 | Romans 8:29 says those God foreknew he "predestined to be conformed to the image of his Son." | Romans 8:29 says, "those God foreknew, He also predestined to be conformed to the image of His Son." |
| C3 | "ought to walk in the same way in which he walked." | "must walk as Jesus walked." (1 John 2:6) |
| C4 | beholding the glory of the Lord, we "are being transformed into the same image from one degree of glory to another." That is passive — | "we, who with unveiled faces all reflect the glory of the Lord, are being transformed into His image with intensifying glory." (The word rendered "reflect" can also mean to behold, as in a mirror, and many translations take it that way.) That is passive — |
| C5 | (no foot line) | Same foot line as J6 |

Note on C4. This is the one place the BSB wording touches the argument. The article's next words
("something being done to you while you look", "attention matters as much as effort") depend on
"beholding", and the BSB main text says "reflect". The Greek verb carries both senses and
translations split (KJV, ESV, NASB "beholding"; NIV "contemplate"; BSB "reflect"). The parenthesis
says so in one sentence rather than letting the paragraph lean on a word the quoted text no longer
contains. It is the only added sentence in this article.

## Every other reference, checked against BSB text and context

Holds, no change:
- Luke 17:11-19: ten lepers cleansed, one returns giving thanks. Paraphrase accurate.
- Psalm 103:1-2 is addressed "O my soul", so "talking to himself" holds.
- Philippians 4:6 context (4:4-7) supports "thanksgiving inside the request".
- Galatians 5:22-23: "the fruit of the Spirit", and the nine-item list in the Christ-like article
  matches the BSB word for word.
- Philippians 2:5-8 paraphrase (did not grasp, emptied, form of a servant, humbled, obedient to
  death) matches the BSB verbs.
- Psalm 88 ends at verse 18, "darkness is my closest companion". "Does not resolve" holds.
- "The apostles remained recognisably themselves": no verse is cited, none needed.

Reported, NOT changed (outside the brief of changing nothing else):
1. **Joy, Nehemiah 8:10.** The article says the line "is not a denial of what they feel". In context
   the people are told three times to stop: "Do not mourn or weep" (8:9), "Do not grieve" (8:10,
   8:11), because the day is holy. The article's reading (a reminder of what is also true) is
   defensible, but the passage is firmer about ending the weeping than the article suggests.
2. **Joy, "Most joylessness in Christians is not a mystery..."** The landscape review asks for this
   to be cut as an unsupported claim about other people's inner lives that sits badly beside the
   depression paragraph. I agree, but it is part of the argument, so it is the owner's call.
3. **Christ-like, "the changing is not chiefly your achievement".** The landscape review says this
   leans to one side of the monergism and synergism axis and wants a fairness line with a link to
   that axis. Not added; owner's call.
4. **Gratitude practice three and joy practice four** cite no passage. The house style would have
   them say they are practical wisdom. Not changed.
5. The proposed house style also wants a Sources block, a pre-1900 voice and a "Where Christians
   differ" section in every article. Only the single foot line was added, as instructed.
6. `audit/article-drafts/how-to-be-content.md` (a draft, not live) also lists `seven-deadly-sins`
   and points to the quiz in prose. The other drafts were not checked for this.
