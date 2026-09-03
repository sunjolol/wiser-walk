# Theology Compass: fairness audit, editor's report

Twenty adversarial reviewers produced 522 findings. A three-lens verification (accuracy, fairness, necessity) kept 424 of them: 42 blockers, 232 majors, 150 minors. Every blocker survived. This report says what was changed, what was not, and what is left for v1.

Files: the revised data set is `audit/compass-data.revised.json`; apply it with `node audit/apply.js audit/compass-data.revised.json`. The changelog inside that file has 89 entries, each carrying a `status` of `applied to data` or `specified, not yet in code`; eleven kept findings that were deliberately not applied are in its `disputed` array. The eighteen answer sheets behind the coordinates and behind section 5 are in its `simulations` array, and the rules the audit specified but the page does not run are in `scoring_v1_proposed`.

---

## 1. Executive summary

**Publishable once the code and page-copy items in the changelog are implemented; the data alone is not publishable.** Nine changelog entries have the status `specified, not yet in code`, and four of them are blockers (the all-central suppression, the headline's middle-band exclusion, the match denominator and the share bar). Applying the JSON and publishing, which is what the project plan says to do next, ships those four defects with the blockers marked closed. The Status column in section 2 says which rows are in the data and which are not.

The 42 blockers fell into four groups, and all four are now closed:

- **Labels that named a rival tradition.** The Grace bands called a confessional Lutheran "Reformed-leaning" and the quiz's own Eastern Orthodox coordinate "Arminian-leaning"; the Kingdom bands stamped "covenantal" (Reformed federal theology) on Catholics, Orthodox, Lutherans and Mennonites (catholic-2, copy-1, lutheran-3, orthodox-5, presbyterian-3, sbc-2, survey-4, mockery-2, mockery-4, orthodox-15, anabaptist-2, charismatic-2). Every band on every axis is now built from that axis's own pole words.
- **Statements that did not measure what they claimed.** Six of eighteen were double-barrelled in a way that let one pole agree with the other pole's item (survey-5, survey-6, survey-7, orthodox-1, lutheran-1, progressive-1, dispensational-1, survey-3). All eighteen have been rewritten; every direction sign was re-derived.
- **Coordinates no adherent could reach.** A Prayer Book Anglican landed on Roman Catholic, a Catholic answering from the Catechism landed on Eastern Orthodox, a PCA elder landed on Lutheran (anglican-1, catholic-1, mockery-6, presbyterian-1, lutheran-4, sbc-1). All twelve original coordinates were re-derived by scoring an informed adherent through the revised items; the eighteen answer sheets are published in `simulations`, so every value can be checked.
- **Whole families with nowhere to land.** Churches of Christ, mainline Protestants and Reformed charismatics had no entry at all (churchofchrist-1, progressive-2, reformedcharismatic-1). Six entries were added.

Eighteen simulated adversaries — one per listed tradition — now land on their own tradition. Each one's eighteen answers are published in the `simulations` array of the data file, so the numbers below can be recomputed by anyone: they land 9.1 to 25.5 units from their own entry, which is 90 to 96 per cent on the formula the page runs today and 87 to 95 per cent under the denominator the audit proposes (section 5).

**Caveat.** Nine kept findings are code or page-copy changes that `apply.js` does not regenerate: the share bar (mockery-5 and six others), the headline rule (survey-23), the match denominator and tie rule (mockery-15, survey-24), the all-central suppression (wesleyan-1), the permalink encoder (copy-7, survey-22), the answer-scale label (anabaptist-27), the axis-lean text (survey-27), the closest-traditions note and the footer (copy-9, copy-20). They are specified in `scoring_v1_proposed` and carry the status `specified, not yet in code`; they must be edited in `theology-compass.html` by hand. Three are verified still broken on the page produced by `node audit/apply.js audit/compass-data.revised.json`:

- **The share bar.** At `#r=000000` (a coherent sacramental, liturgical, one-people answer set) the block is six consecutive lines of ten empty circles, and the pole names start the bar at six different columns, so it is ragged as well as inverted (mockery-5, orthodox-29, pentecostal-20, reformedcharismatic-16). This is the one surface the three-week launch test measures.
- **The all-central suppression.** An all-Unsure sheet is still handed a tradition. The Wesleyan coordinate has been moved out of the six-dimensional centre (it is now 72.7 units away rather than 67.1, and its share of the reachable score space falls from 15.6 to 11.3 per cent), but the entry nearest the centre is now Mainline Protestant at 67.1 units, printed as a 71 per cent match. No honest coordinate for a broad, centrally placed tradition sits further out, so this blocker cannot be closed in the data.
- **The match denominator.** The page divides by `sqrt(6 * 100^2)` = 244.95, so it prints 2 to 3 points above the figures the proposed 198-unit rule gives. Section 5 reports both.

**Honest limit.** These six axes are the questions that split the Western churches at the Reformation. They do not measure the papacy, church government, or the peace-church convictions, so Rome and Constantinople still sit closer to each other than any other pair on the map (18.7 units, against a 198.1-unit longest span), and a Molinist Catholic can still be handed "Eastern Orthodox" first (mockery-1, survey-2, orthodox-26, catholic-30). The fix is not a seventh axis the demo cannot carry; it is to say so on the page, which the revised closest-traditions note does — and which is itself a page-copy item not yet in the page.

---

## 2. The blockers, before and after

| # | Target | Before | After | Status | Findings |
|---|---|---|---|---|---|
| 1 | Grace bands | `Reformed-leaning` / `Arminian-leaning` | `monergist-leaning` / `synergist-leaning` | applied to data | catholic-2, copy-1, lutheran-3, orthodox-5, presbyterian-3, sbc-2, survey-4, mockery-2 |
| 2 | Grace summary | "his saving grace cannot finally be refused" as the definition of monergism | monergism defined by the sinner contributing nothing; the Reformed/Lutheran split on resistibility stated | applied to data | lutheran-2 |
| 3 | Kingdom poles | left pole `Covenantal` | left pole `One people` (shortened in the repair pass; see row 43) | applied to data | orthodox-15 |
| 4 | Kingdom bands | `covenantal` … `centered on the kingdom` | `one-people-of-God` … `balanced on Israel and the church` | applied to data | mockery-4 |
| 5 | Table bands | midpoint `centered on the sacraments` | `between sacramental and memorial` | applied to data | mockery-3 |
| 6 | Table poles / statement 5 | axis scored credobaptism twice, so a 1689 Baptist read "memorial-leaning" | statement 5 now tests means of grace; the same respondent scores 50 | applied to data | reformedbaptist-1 |
| 7 | Table summary | "so both are ordinances obeyed by believers rather than channels of grace" | blessing located in the faith of the receivers; mixed positions named | applied to data | reformedbaptist-2 |
| 8 | Worship bands | midpoint `flexible in worship` | `between liturgical and free` | applied to data | presbyterian-4 |
| 9 | Statement 1 | "Before anyone does anything, God has already chosen…" (affirmed by foreknowledge Arminians) | "God's choice … is not based on anything he foresaw they would do." | applied to data | survey-5 |
| 10 | Statement 2 | "can genuinely resist God's grace … to the very end" (affirmed by Calvinists of the non-elect) | "A person whom God is drawing to salvation can still finally refuse him and be lost." | applied to data | lutheran-1, survey-6 |
| 11 | Statement 3 | "Saving faith is itself a gift … not the reason he chose them" (first clause universal) | "God alone works saving faith … not even the decision to believe." | applied to data | orthodox-1 |
| 12 | Statement 5 | "an outward sign of a decision to follow Christ" | "a public testimony to a faith already held, not a means by which God gives grace" | applied to data | reformedbaptist-4 |
| 13 | Statement 11 | "The church is the true Israel, heir to every promise…" | "There is one people of God across both testaments…" | applied to data | progressive-1 |
| 14 | Statement 12 | pretribulational rapture timing | "The church is a new body begun at Pentecost…" | applied to data | dispensational-1 |
| 15 | Statement 13 | "carry real authority, not just historical interest" | "carry an authority of their own, not only as faithful summaries…" | applied to data | survey-3 |
| 16 | Statement 18 | weekly communion as a liturgical marker | the church year | applied to data | churchofchrist-2 |
| 17-22 | Coordinates | Anglican, Catholic, Lutheran, Presbyterian (x2), Southern Baptist | re-derived; see section 4 | applied to data | anglican-1, catholic-1, lutheran-4, mockery-6, presbyterian-1, sbc-1 |
| 23-25 | Missing traditions | Churches of Christ, mainline Protestant, Reformed charismatic absent | added | applied to data | churchofchrist-1, progressive-2, reformedcharismatic-1 |
| 26 | Scope note | no note saying what the six axes do not measure | closest-traditions note rewritten | specified, not yet in code (page copy) | mockery-1, survey-2 |
| 27 | All-central sheets | all-Unsure returned "Wesleyan / Methodist 83%" | Wesleyan moved out of the centre (67.1 to 72.7 units; Voronoi cell 15.6% to 11.3%); suppression rule specified | half applied to data, half specified, not yet in code — **blocker still open**: an all-Unsure sheet now returns "Mainline Protestant 71%" | wesleyan-1 |
| 28 | Unscored midpoint | midpoint band named for one pole | midpoints relabelled on all six axes | applied to data | survey-1 |
| 29 | Share bar | bar reads as a score of the virtue named | eleven-slot position marker, bar first, new caption | specified, not yet in code — **blocker still open**, verified at `#r=000000` | mockery-5 |
| 29b | Match denominator | divides by 244.95, a distance no two traditions span | 198-unit denominator, 10-unit tie rule, 45-unit hedge | specified, not yet in code — the data file's `scoring` block now documents what the page actually runs | mockery-15, survey-24 |
| 29c | Permalink | base-32 encoder loses nine of thirteen reachable scores | base-13 encoder | specified, not yet in code | copy-7, survey-22 |
| 29d | Headline rule | middle bands print as convictions | middle-band exclusion | specified, not yet in code — the Kingdom bands were made adjectival in the data so the sentence problem is contained | survey-23, mockery-4 |
| 30-31 | Histories | Authority history 4:1 for tradition with no Reformation moment; Gifts history 4:2 for cessation with a 1,500-year gap | both rebalanced (section 3) | applied to data | historian-1, historian-2 |
| 32-42 | Remaining blockers are the duplicate band and label findings folded into rows 1-8 (anabaptist-2, charismatic-2, catholic-2 cluster) and the two general blockers on tradition coverage (charismatic-1, anabaptist-1), addressed by the coordinate work in section 4 and the scope note. | | | applied to data, except the scope note | |
| 43 | Kingdom pole label | `One people of God` (162.0px) clipped the share card's 64px gutter | `One people` (99.4px); the full phrase kept in the band and the summary | applied to data; re-measured in the browser, minimum card ink now x=77.9 | orthodox-15, mockery-4 |
| 44 | Authority pole label | `Scripture and tradition` (207.8px) started at x = -11 inside the result radar's viewBox | `Bible & tradition` (148.8px) | applied to data; no radar text bbox now starts below x=42.1 | copy-5, mockery-16 |

---

## 3. Major changes by axis

### Grace (poles unchanged: Monergist / Synergist)

The pole names stay. Three findings asked to rename them and each proposed name stranded somebody: "Effectual grace" excludes Lutheran monergists who confess resistible grace (anabaptist-4, sbc-11 accuracy), "Sovereign grace" is one pole's boast (anabaptist-4 fairness). Both are now glossed once at first mention instead (catholic-4), and mockery-36 lists the pair among the things not to touch.

- **Summary rewritten** so monergism is not defined by irresistible grace, since confessional Lutherans are coded "firmly monergist" and deny it (lutheran-2, historian-3, orthodox-6, progressive-4, scholar-4, wesleyan-5); a clause added that most Baptist synergists hold believers are kept to the end (sbc-9); a closing line names both vocabularies, Arminian/Wesleyan and synergy (wesleyan-4).
- **History 5 to 9 entries.** Cassian c. 428 and Trent 1547 give the synergist pole a pre-1610 ancestry (mockery-20, catholic-6, historian-5); the Formula of Concord 1577 gives Lutherans their third position (lutheran-16); the Synod of Jerusalem 1672 gives the East its own conciliar answer to Calvinism (orthodox-7); Orange is named as the *Second* council and its cooperation clause restored (historian-7, copy-14); the Wesley-Whitefield split is dated 1739-41 (historian-6, mockery-21, wesleyan-14).
- **Passages** now 4-4: Romans 8:28-30 added as the text both poles build on (scholar-2, anglican-21, presbyterian-23, reformedbaptist-28, reformedcharismatic-26), Acts 7:51 and Philippians 2:12-13 for the synergist clauses that had no verse (scholar-2, catholic-7, orthodox-8), Ephesians extended to 1:3-14 (scholar-3), Hebrews 6:4-6 removed as an apostasy text that cuts across the axis (sbc-10).
- **Reading lists**: Luther added on the left (lutheran-15); John of Damascus and Wesley added on the right, so the pole Catholics and Orthodox share is not described by two Protestant Arminians (orthodox-9, wesleyan-15).

### Table (poles unchanged: Sacramental / Memorial)

- **Statement 5 replaced** with a means-of-grace item, which is what fixes the blocker: the axis was scoring baptismal candidacy twice and never asked about efficacy (reformedbaptist-1, survey-9, mockery-18).
- **Summary** stops deriving infant baptism from sacramental efficacy and names both paedobaptist grounds (presbyterian-11, lutheran-13); the memorial half gains "and proclamation… until he comes" (sbc-15) and a sentence naming the mixed positions (churchofchrist-5, survey-29).
- **History 5 to 8 entries**: John of Damascus for the East (orthodox-21), Lateran IV corrected against Trent (catholic-10, historian-12, mockery-29), Zwingli's own argument (historian-9), Schleitheim folded into 1525-27 (anabaptist-17), Marburg now says what Luther held (lutheran-11, historian-11), and the English Baptists get the entry their absence had filed under Anabaptism (sbc-16, reformedbaptist-19).
- **Passages 6 to 10**: 1 Corinthians 10:16-17 (named by nine reviewers from both poles: anabaptist-13, anglican-20, catholic-12, lutheran-12, orthodox-22, presbyterian-13, reformedbaptist-18, scholar-6, wesleyan-17), Matthew 28:19-20, Acts 8:36-38 and 1 Peter 3:21 for the credobaptist side, John 6 widened to 6:51-63 so v.63 is in the same chip (scholar-5, scholar-6, historian-10).
- **Reading lists**: Ratzinger and Bromiley on the left (catholic-11, historian-13); Zwingli replaced by Hubmaier and a Baptist Supper title on the right (anabaptist-12).

### Gifts (renamed from "Spirit"; poles unchanged)

- **Axis renamed** because it was named with the left pole's key word (mockery-35). The key stays `spirit`, so tokens and statement ids are untouched.
- **Bands**: "undecided on the gifts" called a settled, named position indecision (anglican-12, copy-4, survey-28, mockery-13).
- **Summary**: cessationists are given what they affirm — God still heals and answers prayer (presbyterian-20, reformedbaptist-16, lutheran-21); continuationists are allowed to differ over how eagerly to seek the gifts (orthodox-11).
- **History 6 to 10 entries**, and the count is no longer 4:2 against continuation (historian-2): Irenaeus joins the Montanist line, Augustine's retraction is added, Westminster 1646 shows cessationism was confessional 260 years before Azusa (presbyterian-14, reformedbaptist-15), Wesley and the holiness movement explain where Pentecostalism came from (wesleyan-18), the third wave gets its entry (charismatic-11, reformedcharismatic-13), and "sign gifts" leaves Chrysostom's mouth (historian-14, mockery-10, pentecostal-15, survey-31, reformedcharismatic-27).
- **Passages** de-duplicated (Joel and Acts 2 are the same text; 13:8-12 sits inside 12-14) and rebalanced 3-3-1 with 2 Corinthians 12:12 and 1 Thessalonians 5:19-21 (scholar-7, copy-18).
- **Reading lists**: Fee for the pole Pentecostals defined, Gaffin in place of *Strange Fire*, which both cessationist reviewers disowned as their flagship (historian-15, mockery-8, pentecostal-3, presbyterian-15, reformedbaptist-17).

### Kingdom (left pole renamed)

- **"Covenantal" to "One people"** ("One people of God" in the first pass, shortened in the repair pass to fit the renderers) — nine findings, one a blocker, because the Reformed system's name was being stamped on Catholics, Orthodox, Lutherans, Anabaptists and Restorationists (orthodox-15, anabaptist-3, catholic-18, churchofchrist-8, lutheran-19, progressive-7, sbc-17, anglican-16, dispensational-2).
- **Summary** no longer equates the left pole with amillennialism, so historic premillennialists who hold one people of God have a home (charismatic-10, historian-20, sbc-18, reformedbaptist-24, reformedcharismatic-15, dispensational-3).
- **History 6 to 10 entries**: second-century chiliasm at the front, so dispensationalism does not appear from nowhere in 1830 (dispensational-4, orthodox-16, historian-17, mockery-22); Augsburg XVII so the left pole is not defined by Westminster alone (lutheran-20); the 1646 line reworded to the one-covenant claim (historian-19); Chafer and Ryrie (dispensational-18); Nostra Aetate and the mainline statements (progressive-11); "softens" replaced by progressive dispensationalism's own terms (dispensational-5).
- **Passages**: Genesis 17:7-8 for the dispensational foundation and Hebrews 8:6-13 for the covenantal one, in canonical order so the chips do not group by side (scholar-9, dispensational-6, presbyterian-27).
- **Reading list**: Horton (a paedobaptist covenant primer under a pole held by Baptists, Catholics and Orthodox) replaced by Ladd (anabaptist-26, sbc-21, orthodox-17, churchofchrist-10, reformedbaptist-22, reformedcharismatic-30, charismatic-14, dispensational-17, progressive-21).

### Authority (renamed from "Tradition"; left pole renamed)

- **Axis renamed "Authority"** and **left pole "With tradition" to "Bible & tradition"** (the repair pass shortened it from "Scripture and tradition", which overflowed both renderers; see section 2 row 44) — the old pole name was not parallel, broke the sentences the code builds ("70% toward With tradition") and removed the word Scripture from the side that says it holds both (copy-5, mockery-16, mockery-35).
- **Bands**: "Scripture-first" replaced by "Scripture over tradition" (catholic-23, presbyterian-10, reformedcharismatic-9), and the two left bands, left as tradition-only in the first pass, are now "rooted in Scripture and tradition" and "Scripture with tradition", so the headline no longer prints "Rooted in tradition" on a reader the summary describes as holding both (copy-5, mockery-16).
- **Summary**: "the church's teaching office" is Roman vocabulary the Orthodox do not use, and "tradition can be a valuable guide" described biblicism rather than confessional sola scriptura (orthodox-18, historian-22, mockery-24, presbyterian-9, lutheran-9, anglican-9, progressive-20, reformedbaptist-26).
- **History**: Basil and Second Nicaea for the East, Worms and the Formula of Concord for the Reformation, so the count moves from 4:1 to 5:3 (historian-1, orthodox-19, mockery-23, reformedbaptist-25, lutheran-10). The Newman line was dropped, as historian-1 offers, and Newman remains the first title in the reading list.
- **Passages**: Acts 15:6-29 and Galatians 1:8-9, alternating by pole (scholar-11).
- **Statements 13 and 15 rewritten**, which is what makes the top band reachable by confessional Protestants for the first time (survey-3, reformedbaptist-8, sbc-6, catholic-20, lutheran-7, mockery-17, presbyterian-7, sbc-7, survey-17).

### Worship (poles unchanged: Liturgical / Free)

- **Bands**: "flexible in worship" was the label a regulative-principle Presbyterian received (presbyterian-4), and "informal" judged manner rather than form (mockery-12, sbc-23, anabaptist-11, charismatic-18, reformedcharismatic-12).
- **Summary**: weekly Eucharist is no longer definitional (anglican-6); "sincerity" and "the participation of the whole congregation" are no longer claimed for one pole (catholic-24, historian-23, orthodox-23); the free pole now covers planned non-liturgical worship, which is the largest free-church practice in America (mockery-19, sbc-22, churchofchrist-4, reformedbaptist-14, anabaptist-10, reformedcharismatic-11, dispensational-13).
- **History 6 to 10 entries**: the Eastern and Western eucharistic prayers, Luther and Zwingli, the regulative principle correctly dated, Azusa Street, and Sacrosanctum Concilium (orthodox-24, mockery-32, lutheran-25, historian-26, presbyterian-28, anglican-19, pentecostal-13, catholic-26, progressive-12).
- **Reading list**: Frame, a Reformed defence of the regulative principle, was filed under a pole defined by the Spirit leading in the moment; replaced by Hayford, with Ratzinger added on the left (historian-24, presbyterian-16, catholic-27, mockery-27, pentecostal-12, charismatic-13).

---

## 4. Tradition coordinates

Order is grace / table / gifts / kingdom / authority / worship. Every value is derivable from the eighteen answer sheets in the `simulations` array of the data file: the "Answer sheet" column is what an informed adherent of that tradition scores when their eighteen answers, taken from the confessional sources named in the sheet, are run through the page's own formula. The entry is that sheet softened toward the typical adherent, and "Sheet to entry" is the distance between the two; the per-axis residual is in each sheet's `coordinate_minus_sheet`. Where a residual is 10 points or more it is a stated judgement call, not a derivation: Presbyterian worship (the sheet reaches 83 under the regulative principle, the entry sits at 67 because PCA and OPC congregations now keep Advent and Easter), Charismatic kingdom and authority, Southern Baptist (non-Calvinist) grace, and the four entries whose sheet reaches 100 on an axis where the entry stands at 90-95. The first pass claimed all fifty changed values had been re-derived while publishing no sheet; about thirty could not be checked. These are the sheets.

| Tradition | Pre-audit | Now | Answer sheet | Sheet to entry | Why |
|---|---|---|---|---|---|
| Catholic (Roman and Eastern) | 55 / 5 / 40 / 15 / 10 / 10 | 72 / 5 / 15 / 8 / 5 / 5 | 75 / 0 / 8 / 0 / 0 / 0 | 14 | Gifts 40 made a church that requires verified miracles for canonization look half cessationist; tradition/worship at 10 against Orthodoxy 5 sent a Catholic to the Orthodox entry. Kingdom and Gifts re-derived in the repair pass. (catholic-1, charismatic-21, catholic-31) |
| Eastern Orthodox | 65 / 5 / 35 / 15 / 5 / 5 | 90 / 5 / 20 / 8 / 5 / 5 | 100 / 0 / 17 / 0 / 0 / 0 | 15.7 | Grace 65 put the Orthodox on the monergist side of the Wesleyans although synergeia is their own word. Kingdom re-derived. (orthodox-10, catholic-30) |
| Lutheran (confessional) | 20 / 15 / 70 / 15 / 35 / 20 | 33 / 5 / 82 / 8 / 88 / 10 | 33 / 0 / 83 / 0 / 100 / 0 | 18.3 | Authority 35 placed the tradition that wrote "the only rule and norm" left of centre; Kingdom 15 was carried over although all three Kingdom statements were replaced. (lutheran-4, survey-30, lutheran-27) |
| Anglican (broad) | 40 / 25 / 45 / 20 / 30 / 20 | 42 / 5 / 35 / 22 / 65 / 5 | 42 / 0 / 33 / 17 / 67 / 0 | 9.1 | Table 25 was 17-25 points from where Articles XXVII-XXVIII put a Prayer Book Anglican. (anglican-1, anglican-2) |
| Presbyterian / Reformed (confessional) | 10 / 35 / 75 / 15 / 45 / 45 | 5 / 10 / 90 / 5 / 88 / 67 | 0 / 0 / 100 / 0 / 100 / 83 | 25.5 | Table 35 handed a PCA elder "Lutheran" first; Authority 78 and Worship 40 were unexplained and unreachable by the sheet. (presbyterian-1, mockery-6, lutheran-5) |
| Reformed Baptist (1689) | 10 / 70 / 80 / 30 / 55 / 65 | 5 / 50 / 95 / 5 / 90 / 88 | 0 / 58 / 100 / 0 / 100 / 100 | 19.6 | Kingdom 30 called covenantal Baptists dispensational-leaning; Authority 55 put the 1689 at "balanced". (reformedbaptist-5, sbc-30) |
| Reformed charismatic (Sovereign Grace, Newfrontiers) | — | 5 / 58 / 5 / 25 / 88 / 85 | 0 / 67 / 0 / 17 / 100 / 92 | 19.7 | Added: the monergist-continuationist quadrant was empty. Table and Worship re-derived in the repair pass. (reformedcharismatic-1, charismatic-4) |
| Southern Baptist (Calvinist) | — | 8 / 95 / 75 / 58 / 95 / 95 | 0 / 100 / 75 / 50 / 100 / 92 | 13.7 | Same finding; Kingdom re-derived in the repair pass because 72 was inherited from the undivided entry. (sbc-1) |
| Southern Baptist (non-Calvinist) | 45 / 85 / 75 / 70 / 85 / 70 | 80 / 95 / 75 / 72 / 95 / 95 | 92 / 100 / 75 / 67 / 100 / 92 | 15.1 | The single entry averaged two populations. (sbc-1, mockery-26) |
| National Baptist (NBC USA / historically Black Baptist) | — | 75 / 95 / 35 / 72 / 95 / 92 | 83 / 92 / 33 / 67 / 92 / 83 | 13.9 | Added: second-largest Baptist body in the country. (sbc-33) |
| Bible church (independent, dispensational) | 40 / 90 / 90 / 95 / 90 / 75 | 48 / 95 / 95 / 95 / 95 / 95 | 50 / 100 / 100 / 100 / 100 / 100 | 11.4 | No congregation calls itself a "Dispensational Bible church". (dispensational-16) |
| Calvary Chapel | — | 55 / 95 / 25 / 95 / 95 / 95 | 58 / 92 / 17 / 100 / 100 / 100 | 12.5 | Added: a Calvary Chapel profile was routed to Pentecostalism. Gifts re-derived in the repair pass. (dispensational-15) |
| Churches of Christ / Christian Churches | — | 95 / 58 / 95 / 30 / 95 / 95 | 100 / 58 / 100 / 33 / 100 / 100 | 10.4 | Added: about 2.5 million US adherents with no entry. Kingdom 10 was unreachable and re-derived in the repair pass. (churchofchrist-1) |
| Wesleyan / Methodist | 80 / 40 / 45 / 25 / 45 / 40 | 88 / 8 / 30 / 20 / 67 / 28 | 92 / 0 / 33 / 17 / 75 / 25 | 13.1 | Table 40 put the church of Articles XVII-XVIII halfway to memorialism; the entry sat nearest the six-dimensional centre. Fully re-derived in the repair pass. (wesleyan-2, mockery-25, wesleyan-1) |
| Mainline Protestant (PCUSA / ELCA / UMC) | — | 50 / 5 / 35 / 10 / 55 / 25 | 58 / 8 / 33 / 17 / 58 / 25 | 11.6 | Added: roughly a tenth of US adults; every Presbyterian, Lutheran and Methodist entry was coded at its confessional wing. (progressive-2) |
| Pentecostal (Assemblies of God, Church of God, COGIC) | 80 / 85 / 5 / 75 / 85 / 90 | 90 / 90 / 5 / 75 / 85 / 95 | 100 / 92 / 0 / 83 / 92 / 100 | 16.3 | The name omitted the largest Pentecostal body in the United States. (pentecostal-22) |
| Charismatic non-denominational | 70 / 80 / 5 / 60 / 85 / 90 | 75 / 90 / 5 / 55 / 80 / 92 | 83 / 92 / 0 / 42 / 92 / 100 | 21.7 | Kingdom 60 put Vineyard and Bethel on the dispensational side of a question their own theology answers the other way; separation from the Pentecostal entry rises from 18.7 to 25.7 units. (charismatic-3, charismatic-1) |
| Anabaptist / Mennonite (peace church) | 75 / 85 / 55 / 30 / 70 / 60 | 90 / 90 / 30 / 25 / 90 / 82 | 100 / 92 / 33 / 33 / 92 / 92 | 16.8 | Gifts 55 put Mennonites on the cessationist side of centre; the qualifier warns that no axis measures nonresistance. (anabaptist-14, anabaptist-1) |

Twelve coordinates changed in the first pass and ten were revised again in the repair pass; six entries were added (one of them by splitting the Southern Baptist entry). The closest pair on the map is Catholic / Eastern Orthodox at 18.7 units; the farthest is Eastern Orthodox / Bible church at 198.1, which is the span the proposed match denominator uses. The Pentecostal / charismatic separation is 25.7 units (the 18.7 figure quoted for the pre-audit pair is correct; the 25.5 quoted in the first pass was not).

All eighteen sheets land on their own entry first, and no entry is a twin of another: the smallest gap between two entries is the 18.7 units between Rome and Constantinople, which is the honest limit stated in section 1, and the next smallest is 27.3.

---

## 5. Simulation

Every row is computed from a published answer sheet, not from the coordinates read backwards. Each lens's eighteen answers are in the `simulations` array with the confessional sources they were read from; running them through `computeScores` and `nearest` reproduces this table exactly. Two columns are given for the match because the page and the audit disagree about the denominator: the page divides the distance by `sqrt(6 * 100^2)` = 244.95, and the proposed rule divides by 198.1, the longest distance between two entries on the map. Until the code change lands, the left figure is what a reader sees.

The first pass reported 96-98 per cent for these rows. That was the round trip of snapping each coordinate to the nearest reachable score vector and asking which tradition it was nearest to, which can only return the tradition it started from; it was not an independent answer sheet, and it was not reproducible. The honest numbers are lower and the ordering is unchanged.

| Lens | Answer sheet score | Nearest | Distance | Match (page, /245) | Match (proposed, /198) | Second nearest |
|---|---|---|---|---|---|---|
| Roman Catholic | 75 / 0 / 8 / 0 / 0 / 0 | **own entry** | 14 | 94% | 93% | Eastern Orthodox (22.5) |
| Eastern Orthodox | 100 / 0 / 17 / 0 / 0 / 0 | **own entry** | 15.7 | 94% | 92% | Catholic (Roman and Eastern) (30.4) |
| confessional Lutheran (LCMS / WELS) | 33 / 0 / 83 / 0 / 100 / 0 | **own entry** | 18.3 | 93% | 91% | Anglican (broad) (64.4) |
| Anglican (broad) | 42 / 0 / 33 / 17 / 67 / 0 | **own entry** | 9.1 | 96% | 95% | Mainline Protestant (PCUSA / ELCA / UMC) (30.2) |
| Presbyterian / Reformed | 0 / 0 / 100 / 0 / 100 / 83 | **own entry** | 25.5 | 90% | 87% | Reformed Baptist (1689) (52) |
| Reformed Baptist | 0 / 58 / 100 / 0 / 100 / 100 | **own entry** | 19.6 | 92% | 90% | Presbyterian / Reformed (confessional) (60.7) |
| Reformed charismatic | 0 / 67 / 0 / 17 / 100 / 92 | **own entry** | 19.7 | 92% | 90% | Charismatic non-denominational (89.6) |
| Southern Baptist (Calvinist) | 0 / 100 / 75 / 50 / 100 / 92 | **own entry** | 13.7 | 94% | 93% | Bible church (independent, dispensational) (69.2) |
| Southern Baptist | 92 / 100 / 75 / 67 / 100 / 92 | **own entry** | 15.1 | 94% | 92% | National Baptist (NBC USA / historically Black Baptist) (44.3) |
| National Baptist | 83 / 92 / 33 / 67 / 92 / 83 | **own entry** | 13.9 | 94% | 93% | Pentecostal (Assemblies of God, Church of God, COGIC) (33.1) |
| Dispensationalist | 50 / 100 / 100 / 100 / 100 / 100 | **own entry** | 11.4 | 95% | 94% | Southern Baptist (non-Calvinist) (48.8) |
| Calvary Chapel | 58 / 92 / 17 / 100 / 100 / 100 | **own entry** | 12.5 | 95% | 94% | National Baptist (NBC USA / historically Black Baptist) (38.7) |
| Churches of Christ | 100 / 58 / 100 / 33 / 100 / 100 | **own entry** | 10.4 | 96% | 95% | Southern Baptist (non-Calvinist) (63) |
| Wesleyan / Methodist | 92 / 0 / 33 / 17 / 75 / 25 | **own entry** | 13.1 | 95% | 93% | Mainline Protestant (PCUSA / ELCA / UMC) (47.3) |
| Progressive mainline | 58 / 8 / 33 / 17 / 58 / 25 | **own entry** | 11.6 | 95% | 94% | Anglican (broad) (27.3) |
| Pentecostal | 100 / 92 / 0 / 83 / 92 / 100 | **own entry** | 16.3 | 93% | 92% | Charismatic non-denominational (40.6) |
| Charismatic non-denominational | 83 / 92 / 0 / 42 / 92 / 100 | **own entry** | 21.7 | 91% | 89% | Pentecostal (Assemblies of God, Church of God, COGIC) (35.2) |
| Anabaptist / Mennonite | 100 / 92 / 33 / 33 / 92 / 92 | **own entry** | 16.8 | 93% | 92% | Charismatic non-denominational (45.2) |

All eighteen land on their own entry, at 9.1 to 25.5 units. The Presbyterian sheet is the worst fit at 25.5, all of it in the two axes where a Westminster subscriber is more absolute than a typical PCA member (worship and authority); the Charismatic sheet is next at 21.7, in kingdom and authority.

Two residual cases are documented rather than fixed: an Anglo-Catholic answer set still reads "Catholic (Roman and Eastern)" first, and a Molinist Catholic still reads "Eastern Orthodox" first. Both are consequences of a six-axis instrument that measures neither the papacy nor churchmanship, and both are explained by the broad-church line and the scope line in the closest-traditions note — which is itself a page-copy item not yet in the page (anglican-3, mockery-1, survey-2).

Three spot checks were run in the browser against the page produced by `node audit/apply.js audit/compass-data.revised.json`, so the reported behaviour is the page's own and not the script's: the Orthodox sheet returns Eastern Orthodox 93% then Catholic 88%, headline "Firmly synergist, sacramental, one-people-of-God"; the Lutheran sheet returns Lutheran (confessional) 92% then Anglican, headline "Sacramental, one-people-of-God, Scripture alone"; an all-central sheet returns "A theological centrist" and Mainline Protestant at 71%. (The permalink encoder shifts a reloaded score by up to 2 points, which is the copy-7 defect, so these run a point below the table.)

---

## 6. Disputed: kept findings not applied

Full text is in the `disputed` array of the revised data file — eleven entries. In brief:

1. **historian-21** (rename the Authority right pole "Scripture over tradition", top band "Bible-only"). The defect was in statements 13 and 15, both rewritten; a Book of Concord subscriber now reaches the top band. "Bible-only" would have been printed on Southern Baptist, Pentecostal and Restorationist respondents, who use "sola scriptura" of themselves. The half that stands on its own, band 3 as "Scripture over tradition", is applied.
2. **reformedbaptist-1 option (b)** (rename Table poles Sacrament / Ordinance). Option (a) was applied instead and closes the blocker; "memorial" survives the holders'-own-vocabulary test (BF&M 2000 "memorialize"; AG art. 6 "a memorial"), while "ordinance" is used by both poles (LBC 30.7; WLC 154) and would name neither.
3. **anabaptist-1, sbc-32, mockery-1, orthodox-26, survey-2, charismatic-1** (a seventh axis, or a seventh placement-only coordinate). The demo is fixed at six axes and eighteen statements, and a coordinate the respondent answers but never sees is worse than an honest omission. Applied instead: the Orthodox and Catholic coordinate corrections, the Pentecostal/charismatic separation, the "peace church" qualifier, and the scope note.
4. **survey-1** (sixth unscored option, per-axis minimums, mean-based scoring). The harm it names is removed by two smaller applied changes (suppression when all six axes are central; the relabelled midpoint). The rest is an instrument redesign.
5. **survey-21** (four to six items per axis). Correct and unfixable inside three items per axis; eighteen balanced candidates are supplied for v1.
6. **scholar-1** (split key_passages into left/right/both). Changes the data shape and needs a renderer change; the balance it asks for has been achieved inside the flat lists instead.
7. **copy-15** (reword the Newman history line). The entry was removed under historian-1's own alternative.
8. **dispensational-15** (add Independent Baptist as well as Calvary Chapel). It would sit 20 units from the Bible church entry and recreate the twin-tradition problem.
9. **historian-19** (add Calvin 1559 to the Kingdom history). The 1646 line was reworded to state the same claim in Westminster's own words.
10. **anglican-3** (add an Anglo-Catholic node). Only the broad-church note is applied; a third entry inside the Catholic/Orthodox/Anglican cluster would recreate the crowding two blockers complain about.
11. **copy-19** (typographic apostrophes throughout). A global pass over strings that live in both the data file and the hand-written page; doing it data-only would make the inconsistency more visible. Left for the v1 copy sweep.

433 finding ids appear in the changelog and the disputed array; 424 of them were verified kept. The nine-id difference cannot be reconciled from the deliverables, because `audit/findings/*.json` carry no verdict field: the three-lens verdicts live only in the workflow journal. Adding a `verdict` field to the findings files, so the kept/dropped split is checkable, is an open item.

---

## 7. Dropped findings

Verification dropped 98 of the 522 findings: 0 blockers, 21 majors, 77 minors. Three worth knowing about, because each shows a way a fairness complaint can be wrong:

- **catholic-9** — asked to rename the Table right pole "Memorial" to "Ordinance", since the Catholic Church calls the Eucharist a memorial in the anamnesis sense. Dropped because "memorial view" is what the right pole's own confessions say (BF&M 2000, AG art. 6), while "ordinance" is used by *both* poles, so the proposed fix would have left the axis with a right pole that names nothing. **Lesson: check that the replacement word still discriminates.**
- **pentecostal-1** — asked to replace statement 9 with the Pentecostal initial-evidence doctrine, since nothing separates the two Pentecostal entries. Dropped because scoring initial evidence on the Gifts axis would push Reformed and Third Wave continuationists a third of an axis toward "cessationist" — mis-scoring the very readers the fix was written to protect. **Lesson: simulate a proposed item against the other holders of the same pole.**
- **historian-8** — objected that "the Synod of Dort replies with five points" is a twentieth-century anachronism. Dropped because the Synod's own title is *de quinque doctrinae capitibus* and the Canons are arranged under five heads; only TULIP is modern, and the entry never mentions TULIP. **Lesson: a confident pedantic correction is still a claim, and it can be the thing that is wrong.**

---

## 8. For v1

**Items per axis.** Go to four (24 statements, about four minutes) or six, keyed 2/2 or 3/3. Acquiescence still produces a coherent profile: agreeing with everything yields 33/33/33/67/33/33, because three items per axis force 2:1 keying and five of six axes lean left (survey-21). Eighteen opposite-keyed candidates are in `candidate_statements`. The ones to take first, one per axis, are the ones that also close a gap a kept finding named:

- Grace: "Someone who has truly been born again can still fall away and be finally lost." (+1) — perseverance is invisible today although Hebrews 6:4-6 was in the passage list (wesleyan-20). Take with it "Whether a person comes to faith finally rests on their own free response to God's grace." (+1), the resistibility-free synergist item added in the repair pass: with four items the axis can separate "the sinner contributes nothing to conversion" from "grace can be finally refused", which is what currently costs the confessional Lutheran a third of the axis (lutheran-1, lutheran-2).
- Table: "In baptism God himself acts: he washes, seals, or joins the person to Christ." (-1) — a second efficacy item, so the axis is not two-thirds about subjects (survey-29).
- Gifts: "Every Christian should eagerly seek the gifts of the Spirit, including the more dramatic ones." (-1) — separates Pentecostal from open-but-cautious continuance (orthodox-11).
- Kingdom: "Ethnic Israel still has a distinct future role that the church has not taken over." (+1) — lets Romans 11 non-dispensationalists answer without the supersessionism trap (wesleyan-12, presbyterian-19).
- Authority: "What the apostles handed down by word of mouth carries the same authority as what they wrote." (-1) — the Trent/Dei Verbum claim in its holders' own words (survey-3).
- Worship: "The congregation should say or sing set responses, creeds, and prayers together each week." (-1) — tests set form without the prayer-book/fixed-order ambiguity (presbyterian-18).

Two further items belong in v1 as **placement-only tie-breaks**, scored for nearest-tradition matching but not shown on any axis, and labelled as such on the page: "The bishop of Rome has, by Christ's appointment, authority over the whole church" (survey-2, mockery-1, orthodox-26) and "Speaking in tongues is the initial physical evidence of baptism in the Holy Spirit" (charismatic-1, survey-2). They separate the only two pairs the six axes cannot.

**Traditions to add.** With about twenty entries the map can carry: Anglican (Anglo-Catholic) and Anglican (evangelical), since the broad entry is a centroid no wing occupies (anglican-3); Independent Baptist, once the Bible church entry is no longer its nearest twin (dispensational-15); a Free Will Baptist or Wesleyan-Holiness entry, since the Wesleyan entry currently has to cover both the UMC and the Nazarenes (wesleyan-2). State that Oneness Pentecostal bodies are not represented (pentecostal-22).

**Axes.** Two renames are already applied: Spirit to Gifts and Tradition to Authority (mockery-35). "Kingdom" stays: it is a topic name both poles claim, and the alternatives proposed (Israel; Continuity/Discontinuity) were rejected by all three verifiers as either narrowing or opaque (dispensational-2). A seventh axis is the real v1 question — church government (sbc-32), church and world (anabaptist-1), or hermeneutics (progressive-16) — and progressive-16's own warning should be honoured: a hermeneutics axis is the one most likely to be worded unfairly and should not ship without another round of this kind.

**Structure.** Split `key_passages` into left / right / both and render them as three labelled rows, as `read_more` already is; the page promises "the passages each side reaches for" and a flat chip list cannot show it (scholar-1). Consider also showing "N of 6 axes within one band of this tradition" beside the match percentage (survey-24).

---

## Repair pass

A second editor re-checked the two deliverables against the applied page and against the arithmetic. Seventeen problems were raised; all are answered below. Measurements were taken in the browser on the page produced by `node audit/apply.js audit/compass-data.revised.json`, served locally, and the map figures were recomputed over all 4,826,809 reachable score vectors.

**Blockers closed in the data**

1. **Pole labels that overflowed both renderers.** `Scripture and tradition` measures 207.8px at 18px Fraunces 700 and started at x = -11 inside the result radar's `viewBox="0 0 640 410"`, clipping its first characters; on the 1080px share card it painted from x = 19 against a 64px gutter, and `One people of God` (162.0px) from x = 41. Nothing containing both "Scripture" and "tradition" fits the 162px card budget, so the poles were shortened rather than the renderers patched: the Authority left pole is now **`Bible & tradition`** (148.8px) and the Kingdom left pole **`One people`** (99.4px). Re-measured on the applied page: no radar text bbox starts below x = 42.1, and the leftmost card label ink is x = 77.9 against the 64px gutter. The full phrases survive in the bands ("rooted in Scripture and tradition", "one-people-of-God") and in the first line of each summary. If longer poles are ever restored, the clamp is specified in `scoring_v1_proposed.renderer_label_clamp`.
2. **Kingdom bands were noun phrases.** `headline()` joins bands with commas, so a hand-scored Orthodox sheet read "Firmly synergist, sacramental, one people of God". The bands are now `one-people-of-God` / `one-people-leaning`, which read as tags beside the other five axes' adjectives. Verified live: the Orthodox sheet now reads "Firmly synergist, sacramental, one-people-of-God" and the Lutheran sheet "Sacramental, one-people-of-God, Scripture alone". The middle-band exclusion this row also needs is still code, and is marked as such.
3. **The scoring block documented rules the page does not run.** `scoring` is now reverted, verbatim, to what `theology-compass.html` computes today, and every proposed rule — middle-band exclusion, the new denominator, the tie rule, the hedge, all-central suppression, the base-13 permalink, the share bar, the lean text, the answer-scale label — has moved to a new `scoring_v1_proposed` key whose first field is a not-implemented status. The data file no longer contradicts the page.

**Blockers the data cannot close, now labelled as open**

4. **wesleyan-1 (an all-Unsure sheet is told it is Methodist).** Both halves were checked and both failed. The suppression rule existed only as prose in `scoring`, which `apply.js` does not regenerate, and the coordinate move had not worked: Wesleyan was still nearest the centre at 67.06 units and held 15.6 per cent of the reachable score space, more than twice the next entry. The Wesleyan entry has now been fully re-derived from its answer sheet — `88 / 8 / 30 / 20 / 67 / 28` — which puts it 72.7 units from the centre and cuts its Voronoi cell to 11.3 per cent; the largest cell is now 1.06x the next (Anglican 10.7 per cent, Mainline 10.2 per cent) rather than 2x. But the entry nearest the centre is now Mainline Protestant at 67.08 units, and the applied page hands an all-central sheet "Mainline Protestant, 71% match". No honest coordinate for a broad, centrally placed tradition sits further out — the Mainline answer sheet itself is 62.4 units from the centre — so the blocker stays open until the suppression rule is in `nearest()`/`renderResult()`. Sections 1 and 2 now say so.
5. **The share bar.** Verified at `#r=000000`: six consecutive lines of ten empty circles, ragged because the pole names run from 4 to 17 characters. Unchanged, and marked `specified, not yet in code`.

**Corrections to the report's own claims**

6. **Section 5 was circular and not reproducible.** The 96-98 per cent band was the round trip of snapping each coordinate to the nearest reachable vector, which can only return the tradition it started from. Section 5 is now computed from eighteen published answer sheets — one per tradition, each with the confessional documents it was read from — using the formula the shipped page runs, and reports the distance as well as both match percentages. The honest range is 9.1 to 25.5 units: 90 to 96 per cent on the page, 87 to 95 per cent under the proposed denominator. The two hand-derived sheets the repair editor supplied are in the array unchanged (Lutheran `33 / 0 / 83 / 0 / 100 / 0`, Orthodox `100 / 0 / 17 / 0 / 0 / 0`); their distances are now 18.3 and 15.7 rather than 22.2 and 20.2, because of item 7.
7. **Kingdom 15 on Catholic, Orthodox and Lutheran was carried over unchanged** although all three Kingdom statements had been replaced, and it was the largest single residual in both hand simulations (225 of 495 squared units for the Lutheran, 225 of 409 for the Orthodox). Re-derived to 8 on all three — 8 rather than 0, to leave room for the historic-premillennial and chiliast minorities the axis history names. This alone recovers about four match points for each.
8. **Coordinates with no rationale.** Ten entries were re-derived again in this pass: Catholic gifts and kingdom, Orthodox kingdom, Lutheran kingdom, Presbyterian authority and worship, Reformed charismatic table and worship, Southern Baptist (Calvinist) grace and kingdom, National Baptist grace, Calvary Chapel gifts, Churches of Christ kingdom, and Wesleyan across four axes. Two were plainly unreachable and are worth naming. **Presbyterian worship 40**: no PCA or OPC answer set can produce it on statements 16-18, since the regulative principle answers all three away from a fixed liturgy — the sheet reaches 83 and the entry now sits at 67. **Churches of Christ kingdom 10**: the Restoration plea teaches both that Christians are Abraham's heirs (Galatians 3:29, statement 11) and that the church began at Pentecost (Acts 2, statement 12), which is a mid-axis answer, not a left-pole one — the sheet answers 33 and the entry now sits at 30. Section 4 now carries each entry's sheet, the distance from sheet to entry, and a one-line pointer instead of per-axis prose; every residual of 10 points or more is named as a judgement call rather than as a derivation.
9. **Statement 2 against the Grace summary.** The item is kept — it is the only thing separating the Lutheran entry (grace 33) from the Reformed entries (grace 5), so replacing it would collapse the pair that lutheran-4 and presbyterian-1 were about — and the trade-off is now stated in the summary instead of hidden: this axis counts resistible grace toward the synergist side, which is why a confessional Lutheran lands in the monergist-leaning band rather than at the pole. A resistibility-free synergist item, "Whether a person comes to faith finally rests on their own free response to God's grace", is in `candidate_statements` for the four-item v1 axis.
10. **The verdict line** now says the data alone is not publishable, and section 2 carries a Status column on every row.

**Smaller corrections**

11. "ten kept findings" is now "eleven", which is what the `disputed` array and section 6 both hold.
12. The closing line of section 6 no longer claims that all 424 kept findings are cited by id: 433 ids appear in the changelog and disputed array, of which 424 were verified kept. The nine-id difference is not checkable from the deliverables, because `audit/findings/*.json` carry no verdict field; adding one is an open item.
13. The 1 Corinthians 10:16-17 claim and the three adjacent "and N others" claims now list their ids. Nine reviewers, not eight, name 1 Corinthians 10:16-17.
14. The Churches of Christ match figure was 93 in the changelog and 95 in section 5. It is now one number derived from the published sheet: 10.4 units, 96 per cent on the page, 95 per cent under the proposed rule.
15. The Pentecostal / charismatic separation is 25.7 units, not 25.5, in both places.
16. The Authority left bands are now "rooted in Scripture and tradition" and "Scripture with tradition", so the headline no longer prints "Rooted in tradition" on a reader whose summary says he holds both.
17. The Kingdom summary opens with the pole's own words, so the pole, the top band and the summary use one form of the phrase rather than three.
18. **The poor-fit hedge is calibrated.** 60 units was set by eye and fired for 71 per cent of the reachable space; an all-Strongly-agree sheet (33/33/33/67/33/33) sits 68.6 units from its nearest entry and would have been given one. The threshold is now 45 units, about 1.8x the worst distance any of the eighteen informed adherents reaches, with the derivation stored beside it in `scoring_v1_proposed.hedge_calibration`.

**Still open after this pass** — all of it code, none of it data: the all-central suppression (blocker), the share bar (blocker), the middle-band exclusion in `headline()` (blocker), the match denominator, the permalink encoder, the axis-lean text, the answer-scale label, the closest-traditions note and the footer. Nine changelog entries, all marked `specified, not yet in code`, plus the `verdict` field the findings files still lack.
