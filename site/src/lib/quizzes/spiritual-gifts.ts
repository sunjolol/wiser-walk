/**
 * What are your spiritual gifts?
 *
 * Nineteen gifts, three statements each — exactly one reverse-keyed and exactly one about
 * what other people bring you or say of you — scored by the same highest-category strategy
 * as the seven deadly sins draft. See QUIZ-BLUEPRINTS.md, quiz two, and
 * audit/new-quizzes/gifts-all-final.md for every statement with its provenance.
 *
 * What is real here and what is not:
 *   - The gifts, the passages and the cited acts are real. Every quotation below is verbatim
 *     from the World English Bible British Edition (WEBBE) held on disk at
 *     demos/sounds-like-scripture/work/verses-all.json (src "webbe"), and was checked as a
 *     substring of that file. Never retype one from memory. The exceptions are the lines that
 *     carry a pronoun for God (1 Corinthians 12:11 in the intro, 1 Corinthians 1:5 in a
 *     didYouKnow): those are the Berean Standard Bible's wording, which capitalises it, and
 *     say so. A lower-case "who" for God that the BSB also prints is kept outside the quotation
 *     marks, in the site's own words, rather than re-lettered inside them.
 *   - The statements came from two independent drafts and two adversarial critiques, then
 *     one editor, then five audit reviews (cessationist, Pentecostal, Catholic and Orthodox,
 *     psychometric, evidence) closed in audit/new-quizzes/AUDIT-LOG.md. The six gifts added
 *     on 2026-09-22 went through the same shape a second time — two drafts, two critics, an
 *     editor, four adversarial reviews and a closing editor — in gifts-all-final.md. That is
 *     still NOT the Compass's twenty-reviewer audit. The owner played it and released it on
 *     2026-09-20, so status is 'live'; no page may claim it was audited.
 *
 * All the gifts are in, by the OWNER'S DECISION of 2026-09-22: prophecy, healing, miracles,
 * tongues, interpreting tongues and the word of knowledge are measured, named and ranked
 * exactly like the other thirteen. Nothing marks them out anywhere — no badge, no chip, no
 * grouping, no separate section, no extra field on a row — because a mark is a verdict on
 * the reader who scores highest there. Three things are NOT scored (no page says so since the
 * owner's wish of 2026-09-24; giftsFrame.notScored keeps the words): apostles (1 Corinthians
 * 12:28; Ephesians 4:11), the gift Paul names when he writes of remaining unmarried
 * (1 Corinthians 7:7), and the gift given with the laying
 * on of the hands of the elders (1 Timothy 4:14) — statements about what you do and what
 * has happened have nothing to say about any of the three. The disagreement about whether
 * the six are given today is DESCRIBED, in `notes.disputed`, and ruled on nowhere: the
 * argument itself belongs to the Theology Compass's Gifts axis, which sets it out in both
 * sides' own words, and this quiz links there rather than taking a side in either direction.
 *
 * For the engineer who wires this:
 *   - `giftSources`, `giftActs` and `giftsFrame` are exported beside the quiz on purpose and
 *     are NOT put in QuizGroup.history / QuizGroup.passages. HistoryTimeline is headed "How
 *     the argument unfolded" and PassagePills "Passages both sides argue from" with BSB text;
 *     both headings are false for a gift, and the quotations here are WEBBE, not BSB.
 *   - category.ts prints "leaned away", "a strong pull" and a bare one-word headline. Those
 *     words were written for vices. For a gift they read as a verdict ("leaned away" beside
 *     "Be hospitable to one another"), so this quiz needs its own strength words, a headline
 *     frame, the low-row sentence and flat-state copy in giftsFrame, and a share card that
 *     shows the top three only and never the bottom of the ranking.
 *   - Two gifts, `knowledge` and `interpretation`, carry `actsHeading`/`actsKicker`: the New
 *     Testament records no act of either, so the list under them is what Paul WRITES about
 *     it, and the page must not head three letters "3 recorded acts".
 */
import { category } from '../strategies/category';
import { groupHref } from '../engine/urls';
import { theologyCompass } from './theology-compass';
import type { Quiz, QuizGroup, QuizItem } from '../engine/types';

/**
 * The Compass axis where the disagreement this quiz describes but does not settle is set out
 * in both sides' own words. Resolved from the Compass's own group list through the URL
 * builder, so it cannot drift: that axis is keyed `spirit` and published at /gifts/, and a
 * href written from the key would 404. urls.ts rather than registry.ts, which would be a cycle.
 */
const giftsAxis = theologyCompass.groups.find(g => g.slug === 'gifts');
const giftsAxisHref = giftsAxis ? groupHref(theologyCompass, giftsAxis) : undefined;

/** The listing passage(s) for each gift. `text` is verbatim WEBBE, a substring of `ref`. */
export interface GiftSource {
  ref: string;
  text: string;
}

/** A recorded act from Acts or the letters. `what` describes what was done; it is not a quotation. */
export interface GiftAct {
  ref: string;
  what: string;
}

const WEBBE = 'World English Bible British Edition';

export const giftSources: Record<string, GiftSource[]> = {
  serving: [
    { ref: 'Romans 12:7', text: 'or service, let’s give ourselves to service' },
    { ref: '1 Corinthians 12:28', text: 'helps' }
  ],
  teaching: [{ ref: 'Romans 12:7', text: 'he who teaches, to his teaching' }],
  encouraging: [{ ref: 'Romans 12:8', text: 'he who exhorts, to his exhorting' }],
  giving: [{ ref: 'Romans 12:8', text: 'he who gives, let him do it with generosity' }],
  healing: [
    { ref: '1 Corinthians 12:9', text: 'and to another gifts of healings by the same Spirit' },
    { ref: '1 Corinthians 12:28', text: 'then gifts of healings' },
    { ref: '1 Corinthians 12:30', text: 'Do all have gifts of healings?' }
  ],
  leading: [{ ref: 'Romans 12:8', text: 'he who rules, with diligence' }],
  mercy: [{ ref: 'Romans 12:8', text: 'he who shows mercy, with cheerfulness' }],
  knowledge: [
    {
      ref: '1 Corinthians 12:8',
      text: 'and to another the word of knowledge according to the same Spirit'
    }
  ],
  administration: [{ ref: '1 Corinthians 12:28', text: 'governments' }],
  wisdom: [{ ref: '1 Corinthians 12:8', text: 'to one is given through the Spirit the word of wisdom' }],
  miracles: [
    { ref: '1 Corinthians 12:10', text: 'and to another workings of miracles' },
    { ref: '1 Corinthians 12:28', text: 'then miracle workers' },
    { ref: '1 Corinthians 12:29', text: 'Are all miracle workers?' }
  ],
  discernment: [{ ref: '1 Corinthians 12:10', text: 'to another discerning of spirits' }],
  faith: [{ ref: '1 Corinthians 12:9', text: 'to another faith by the same Spirit' }],
  prophecy: [
    { ref: '1 Corinthians 12:10', text: 'and to another prophecy' },
    { ref: 'Romans 12:6', text: 'if prophecy, let’s prophesy according to the proportion of our faith' }
  ],
  evangelism: [{ ref: 'Ephesians 4:11', text: 'and some, evangelists' }],
  shepherding: [{ ref: 'Ephesians 4:11', text: 'and some, shepherds and teachers' }],
  tongues: [
    { ref: '1 Corinthians 12:10', text: 'to another different kinds of languages' },
    { ref: '1 Corinthians 12:28', text: 'and various kinds of languages' },
    { ref: '1 Corinthians 12:30', text: 'Do all speak with various languages?' }
  ],
  hospitality: [
    {
      ref: '1 Peter 4:9-10',
      text:
        'Be hospitable to one another without grumbling. As each has received a gift, employ it ' +
        'in serving one another, as good managers of the grace of God in its various forms.'
    }
  ],
  interpretation: [
    { ref: '1 Corinthians 12:10', text: 'and to another the interpretation of languages' },
    { ref: '1 Corinthians 12:30', text: 'Do all interpret?' }
  ]
};

/**
 * The plain description that follows the quotation in each summary.
 *
 * EXPANDED 2026-09-21 for search. Nine of these were two dozen words, which made their pages
 * near-identical to one another and useless to anybody who had typed "what is the spiritual
 * gift of mercy" into a search box. Each one now answers the five questions such a reader
 * actually has: what it is in plain words, where the New Testament names it (with the
 * reference), what it looks like in an ordinary church in an ordinary week, how people tend
 * to notice it in themselves, and the neighbouring gift it is most often confused with.
 *
 * Nothing is invented. Every verse quoted is verbatim WEBBE (none of these carries a pronoun
 * for God), checked as a substring of
 * demos/sounds-like-scripture/work/verses-all.json; every Greek note carries its source in
 * the didYouKnow entry beside it. The honest notes on the six disputed gifts are untouched:
 * sentences were added after them, never in place of them.
 */
const PLAIN: Record<string, string> = {
  serving:
    'Romans says service and 1 Corinthians says helps, and this quiz treats them as one: doing the practical work that other people’s work depends on. Romans 12:7 puts it second in its list, straight after prophecy, and 1 Corinthians 12:28 slips it in between gifts of healings and governments. Peter divides the whole church into two kinds of gift, speaking and serving, and hands this one half of everything (1 Peter 4:11).\n\n' +
    'In an ordinary week it is unglamorous and constant. Somebody puts the chairs out before anyone arrives and stacks them after everyone has gone. Somebody drives the elderly member to a hospital appointment, cooks for the family with a new baby, fixes the boiler in the hall, fills in the form the regulator wants. None of it is announced and all of it is assumed.\n\n' +
    'People with this gift tend to notice it as an itch rather than as a calling. You have usually started before anyone asked. An unfinished job in a room is physically uncomfortable. When somebody says an errand needs running, yes is out of your mouth before you have thought about your evening.\n\n' +
    'The gift it is most often confused with is hospitality, and the difference is what each one is pointed at: serving is pointed at the job, hospitality at the person who has just walked in. It also gets mixed up with administration, which organises who does the work rather than doing it, and with mercy, which goes towards distress rather than towards a task. A church that cannot tell them apart asks its servers to run the rota and then wonders why the rota is late.',
  teaching:
    'Making a thing understood, and staying with a person until it is. Romans 12:7 names it in a single clause, 1 Corinthians 12:28 ranks teachers third in the church after apostles and prophets, and Ephesians 4:11 puts shepherds and teachers together in one phrase, which is why many churches speak of a pastor-teacher as one job rather than two.\n\n' +
    'In an ordinary week it looks like the person who takes the awkward question at the end of a service and draws the answer on the back of a notice sheet. It looks like the membership class, the Tuesday evening study that has run for eleven years, the parent who can say what a word like justification means without reaching for three more words nobody knows. Teaching is mostly repetition, and the gift is what makes repetition bearable.\n\n' +
    'You tend to notice it by where a conversation goes. People bring you a question wanting the short answer and leave with the long one, because you asked what they already thought. You check that somebody followed you before you move on. You would rather sit down with a person for twenty minutes than send them a good link.\n\n' +
    'It is most often confused with preaching and with the word of knowledge. A preacher may or may not have this gift, because teaching is measured by whether the other person now understands and not by whether the address was good. A word of knowledge is something said at a moment; teaching hands material over so that somebody else can hold it and pass it on, which is exactly the chain Paul describes to Timothy (2 Timothy 2:2). It is also confused with encouraging, and the shortest way to tell them apart is that an encourager wants you to move while a teacher wants you to see.',
  encouraging:
    'The translation quoted here says exhorting where many others say encouraging: speaking so that someone takes heart and keeps going. Romans 12:8 is the only gift list that names it, but the New Testament asks the same thing of everybody: “exhort one another day by day” (Hebrews 3:13), and again in Hebrews 10:25. Paul says a whole church prophesying one by one leaves everyone exhorted (1 Corinthians 14:31), so the gift and the ordinary duty sit very close together.\n\n' +
    'In an ordinary week it is a message on a Tuesday that lands on exactly the right day. It is the person who sits down beside the man who has come back after two years away and does not mention the two years. It is whoever talks the Sunday school volunteer out of resigning, and whoever tells a nervous eighteen-year-old to apply.\n\n' +
    'People notice it in themselves by what they cannot leave alone. Somebody hesitating in front of you is uncomfortable, and you say something. You tell people what you think they are capable of without waiting to be asked. Friends come to you when they already know what they should do and need a push to do it.\n\n' +
    'The gift it is most often mistaken for is mercy. Mercy goes towards pain and is willing to sit still in it; encouragement goes towards a stalled person and moves them, and the wrong one at the wrong moment does real harm. It is also mistaken for being nice. Paul’s word carries a push, and the New Testament uses it for the hard conversation as readily as for the kind one.',
  giving:
    'Letting money and possessions go where they are needed; nothing here counts how much. Romans 12:8 names it and adds one qualification only, that it be done with generosity, and the Greek behind that word means singleness before it means generosity: giving with no second motive folded in.\n\n' +
    'In an ordinary week nobody sees it happen. An electricity bill gets paid for a family that never asked. A teenager who could not afford the summer camp goes anyway and never finds out who covered it. Somebody hears that a person is going without and has found something by the end of the day. The quietness is usually preference rather than modesty: a giver who wants the credit has already bought something with the money.\n\n' +
    'People notice it in themselves by what they are willing to lose. You give away things you are still using. Friends bring you news of a need because they know what you will do with it. Something surplus in the house nags at you until it has gone somewhere.\n\n' +
    'It is most often confused with having money, and Paul goes out of his way to shut that down: the churches he holds up as the example were in “deep poverty” and gave beyond what they could manage (2 Corinthians 8:1-5). He tells the Corinthians that a gift is measured by what a person has, not by what they have not (2 Corinthians 8:12). The other common mix-up is with mercy. Mercy goes towards the person in trouble and stays with them; giving releases the resource, and in most churches those are two different people.',
  healing:
    'The translation quoted here says gifts of healings, with both words in the plural, and Paul asks, “Do all have gifts of healings?” (1 Corinthians 12:30). These statements ask what has happened when you prayed for people who were ill, and whether people come to you because of it. They cannot tell this gift apart from an answer to prayer, and James asks that prayer of everyone: “pray for one another, that you may be healed” (James 5:16). Nothing here counts how much anyone prays. Whether what happened was this gift is for your church and those who lead it to say, not this page. Many Christians believe God still gives this gift today; many believe He gave it only for the time of the apostles. Both believe that God still heals and answers prayer.',
  leading:
    'The translation quoted here says rules where many others say leads: taking on the direction of a shared work and answering for it. Romans 12:8 is the only gift list that names it, and the same Greek verb turns up twice more for people doing the job: those who “are over you in the Lord” (1 Thessalonians 5:12) and “the elders who rule well” (1 Timothy 5:17). The word behind it means to stand in front of something, which is a fair description of where the blame lands.\n\n' +
    'In an ordinary week it is whoever says where the new congregation will meet and why, who makes the unpopular call about the building, who decides which of two good projects the church can actually afford this year. It is also whoever is still standing there afterwards when the decision turns out to have been wrong.\n\n' +
    'People notice it in themselves by accumulation. You get put in charge of things you did not ask to run. You find yourself answering for parts of a job other people did. A room that will not reach a decision makes you restless, and you open your mouth.\n\n' +
    'The gift it is most often confused with is administration. Leading decides where a thing is going; administration keeps it running once that is settled. Plenty of people have both, and a church that cannot tell them apart puts its decider in charge of a spreadsheet and then wonders why the spreadsheet is a mess. It is also confused with shepherding, which is care of the same people over years rather than direction of a work, and with simply being the loudest person present. The one quality Romans attaches to this gift is diligence, which is a word about effort.',
  // Not "staying, with nothing to fix": both cited acts are practical relief (Tabitha made
  // garments, Onesiphorus sought Paul out and refreshed him).
  mercy:
    'Going towards people in distress and doing what eases it. Romans 12:8 names it last in its list of seven, and the one thing it asks is that mercy be shown with cheerfulness, so that help does not arrive with a sigh attached.\n\n' +
    'In an ordinary week this is the person who sits with the widow for a whole afternoon and does not look at the clock. It is whoever visits in the third week, once the first rush of visitors has stopped and the ward has become boring. It is the one who takes the call at eleven at night, and the one who goes to the funeral of somebody they barely knew because the family will be thin on the ground.\n\n' +
    'People notice it in themselves by which way they move. When somebody starts crying you go closer instead of giving them room. People at their lowest come to you, including people who hardly know you, which is puzzling until you realise they can tell. You leave a conversation carrying somebody else’s weight, and it does not put you off going back.\n\n' +
    'It is most often confused with serving, and the difference is the target: serving answers a job, mercy answers a person, and mercy will sit in a room where there is nothing to fix. It is also confused with encouraging, which wants a stalled person moving again, while mercy is content to be still with somebody who cannot move yet. The everyday mix-up is with ordinary kindness, which is asked of every Christian. What is named here is the settled habit of going where distress is rather than away from it.',
  knowledge:
    'The passage names a word of knowledge, something said, and nowhere explains it, and Christians read it in more than one way. These statements ask about two things: having what the Bible and Christian teaching say ready when people need it, and knowing a fact about someone that nobody had told you. Two of the three ask about the first, so a reader with only the second will see this row fill less. They cannot see how you came to know anything. The New Testament calls no recorded act a word of knowledge, so the passages below are not acts: they are three places where Paul writes of knowledge in a church. Whether what happened was this gift is for your church and those who lead it to say, not this page. Many Christians believe God still gives this gift today; many believe He gave it only for the time of the apostles.\n\n' +
    'In an ordinary week the first reading looks like the person a group turns to when it is groping for a passage: they can say where it is, and what it meant where it stood. The second looks like a sentence said to somebody who had told you nothing, which turns out to be true of them. These statements ask about both and can see how neither came about.\n\n' +
    'It is most often confused with teaching and with the word of wisdom. Teaching hands material over so that another person can hold it and pass it on; a word of knowledge is something said at a moment. Wisdom answers what should be done, and knowledge answers what is so. Corinth prized this one enough for Paul to give it the flattest line in the letter: “Knowledge puffs up, but love builds up” (1 Corinthians 8:1).',
  administration:
    'The translation quoted here says governments where many others say administration or guidance: keeping the order that a shared work runs on. 1 Corinthians 12:28 names it once, tucked between helps and speaking in other languages, and then says nothing more about it. Paul shows it instead of defining it: he leaves Titus in Crete “to set in order the things that were lacking” (Titus 1:5), and he will not move a large collection without a second man, appointed by the churches, travelling with it (2 Corinthians 8:18-21).\n\n' +
    'In an ordinary week it is the rota that arrives on Thursday and works. It is knowing which key opens which door, when the insurance is due, who has been checked and who has not, and which of the four people who promised a pudding will actually bring one. It is the gift that turns somebody should into a name and a date.\n\n' +
    'People notice it in themselves by how loose ends feel. You write the plan down and send it round without being asked. People send you the details because they know you will still have them in March. An arrangement nobody has pinned down sits at the back of your mind until you pin it down.\n\n' +
    'It is most often confused with leading. Leading decides where a thing is going; administration makes it possible once that is decided, and the two land on the same person often enough to hide the difference. It is also confused with being tidy, and Paul’s word is not about neatness. It is about steering something that would otherwise drift, which is why it comes out of the vocabulary of ships rather than of housekeeping.',
  wisdom:
    'The passage names a word of wisdom, something said, and does not explain it. These statements can see only the everyday pattern of being brought hard choices and asked what to do. This is not the wisdom Catholic teaching counts among the seven gifts of the Holy Spirit (Isaiah 11:2); this page is about Paul’s list. Paul names this in the same sentence as healing, miracles and tongues (1 Corinthians 12:8-10), and Christians disagree about which of the gifts in that sentence God still gives today.\n\n' +
    'In an ordinary week it is the person a leadership meeting goes quiet for. It is the friend who asks the question that shows everybody what the argument was actually about. It is the elder who says not yet, and turns out two years later to have been right.\n\n' +
    'People notice it in themselves by what they are brought. Others come to you with decisions rather than with information. In an argument you find yourself naming the real disagreement instead of taking a side in the stated one. You are asked what to do more often than you are asked what is true.\n\n' +
    'The gift it is most often confused with is the word of knowledge, which is about what is so rather than about the next move, and with teaching, which hands material over. The everyday mix-up is with intelligence. Scripture ties wisdom to the fear of God rather than to cleverness, and James tells anyone short of it to ask God and promises it will be given (James 1:5), which is not a thing anybody says about being clever.',
  miracles:
    'The translation quoted here says workings of miracles, and later “miracle workers” (1 Corinthians 12:28). Luke writes that “God worked special miracles by the hands of Paul” (Acts 19:11). These statements ask what has happened when you prayed and what the people who were there called it. They call nothing a miracle themselves, and they cannot tell this gift apart from an answer to prayer. Whether what happened was this gift is for your church and those who lead it to say, not this page. Many Christians believe God still gives this gift today; many believe He gave it only for the time of the apostles.\n\n' +
    'It is most often confused with healing, which the same sentence lists separately: healing names a body made well, and this is the wider word. It is also confused with the gift of faith, which is about staying certain rather than about what happens next. Whatever else is true of it, the New Testament never shows it at anybody’s disposal. Every recorded instance sits inside prayer, and when Luke describes the most striking run of them he puts the working with God rather than with the apostle whose hands were involved: “God worked special miracles by the hands of Paul” (Acts 19:11).',
  discernment:
    'The passage names the discerning of spirits and does not explain it. Of prophets speaking in church Paul writes, “let the others discern” (1 Corinthians 14:29), and John writes, “test the spirits, whether they are of God” (1 John 4:1). These statements ask whether you look into what you are told before you accept it, and what has happened when you weighed something taught about God or said to be from Him. They say nothing about how you knew, and they are not about first impressions of people. Nor do they ask about telling what is moving your own thoughts and desires, which many Christians also call the discernment of spirits and take to a confessor or spiritual father. Paul names this in the same sentence as healing, miracles and tongues (1 Corinthians 12:8-10), and Christians disagree about which of the gifts in that sentence God still gives today.\n\n' +
    'In an ordinary week it is the person who reads the book everybody is quoting and comes back with the chapter that does not hold. It is whoever notices that a visiting speaker’s stories keep improving. It is the question asked in a meeting that changes the decision, and the person asking it is often not the most senior one in the room.\n\n' +
    'People notice it in themselves as a reflex. You look into where an idea came from before you accept it. You have stopped reading a writer you liked because of what they taught about God. The worries you raise turn out, often enough, to have been worth raising.\n\n' +
    'The gift it is most often confused with is suspicion, and the difference is where each of them starts. Suspicion begins with distrust and goes looking for evidence. Paul’s word begins with a test that can come out either way, and the instruction attached to it is to keep whatever passes: “Test all things, and hold firmly that which is good” (1 Thessalonians 5:21).',
  faith:
    'Listed as something given to some and not to others, so it is not about whether you believe. These statements look only for a habit of staying sure, and saying so, after other people have stopped expecting a thing to come right, and for people coming to ask whether you still are. Paul elsewhere writes of “all faith, so as to remove mountains” (1 Corinthians 13:2). Paul names this in the same sentence as healing, miracles and tongues (1 Corinthians 12:8-10), and Christians disagree about which of the gifts in that sentence God still gives today.\n\n' +
    'In an ordinary week it is whoever keeps praying for the building fund after the figures have said no. It is the person who says this one will come good about somebody everybody else has written off, and is still saying it three years later, and has been right often enough that people remember.\n\n' +
    'People notice it in themselves by what others ask them. When a thing has gone quiet, somebody comes and asks whether you still think it will happen. You find yourself saying so out loud in a room that has given up. You are rarely the first to say stop.\n\n' +
    'The two things it is most often confused with are saving faith, which every Christian has and which no list of gifts would single out, and optimism, which is a temperament rather than a gift and does not need a subject. Paul’s own measure is deliberately extreme and then deliberately deflated: all faith, enough to remove mountains, and without love it is nothing (1 Corinthians 13:2). The Romans list opens with the same warning against making any gift a rank, telling everyone to think of themselves reasonably, “as God has apportioned to each person a measure of faith” (Romans 12:3).',
  prophecy:
    'Paul says what it is for: “he who prophesies speaks to men for their edification, exhortation, and consolation” (1 Corinthians 14:3), that is, to build them up, encourage them and comfort them. He also writes, “let the others discern”, and, “if a revelation is made to another sitting by, let the first keep silent” (1 Corinthians 14:29-30). These statements ask whether you have said what you believed God gave you to say, and what people said afterwards. A preacher can agree with them, and so can a friend whose advice came at the right time; the statements cannot see more than that. 1 Corinthians 12:28 and Ephesians 4:11 also name prophets among the people given to the church; a result here names a pattern and says nothing about whether anybody is a prophet. Whether what happened was this gift is for your church and those who lead it to say, not this page. Many Christians believe God still gives this gift today; many believe He gave it only for the time of the apostles.',
  evangelism:
    'Telling the good news to people who have not heard it or do not hold it. Of the four gift lists only Ephesians 4:11 names it, and the noun itself turns up three times in the whole New Testament: Philip, whom Luke calls the evangelist (Acts 21:8), the list in Ephesians, and Paul’s instruction to Timothy to “do the work of an evangelist” (2 Timothy 4:5). Timothy, who is told to do the work, is never given the title.\n\n' +
    'In an ordinary week it is the conversation with the plumber that somehow got round to God. It is the person who brings a friend who has never been inside a church, and the one whose neighbours ask what Christians actually believe, because they have worked out that asking will not be awkward.\n\n' +
    'People notice it in themselves by where they keep ending up. You are in these conversations without having steered them there. People who do not go to church put their questions to you rather than to the vicar. You are aware of the times you kept quiet, in a way that other people are not.\n\n' +
    'The gift is most often confused with being extroverted, and Luke’s own example rules that out: Philip preaches to a city and then, on the same page, goes to one man in a chariot and starts from the passage the man happened to be reading (Acts 8:5-8, 26-35). It is also confused with teaching, which works with people who already hold the thing. Evangelism starts a long way further back, with somebody who may not want the conversation at all.',
  shepherding:
    'Many translations say pastors: watching over the same people for a long time. Ephesians 4:11 names people given to the church, and both passages below are addressed to elders; a result here names a pattern of care and says nothing about who should hold an office. The English word pastor is nothing more than the Latin for shepherd, which is why two Bibles print two different words at the same place.\n\n' +
    'In an ordinary week it is remembering that this week is the anniversary. It is noticing that a family has not been for three Sundays and ringing them before the fourth. It is the visit nine months after the funeral, when everybody else has assumed the person is fine by now, and the message on the morning of the hospital appointment.\n\n' +
    'People notice it in themselves by the length of the list. You keep following up with the same few people long after everyone else has moved on. People you helped years ago still come to you first when something goes wrong, and you are neither surprised nor particularly flattered.\n\n' +
    'It is most often confused with mercy, and the difference is duration. Mercy goes to whoever is in front of it; shepherding keeps a particular set of people and stays with them for years. It is also confused with holding a job. Ephesians 4:11 is about what Christ gives to His church rather than about who is paid by it, and some of the steadiest shepherding in any congregation is done by people with no title at all.',
  tongues:
    'The translation quoted here says different kinds of languages where many others say tongues: speaking or praying in a language the speaker has never learnt. At Pentecost “everyone heard them speaking in his own language” (Acts 2:6); to Corinth Paul writes that such a speaker “speaks not to men, but to God, for no one understands” (1 Corinthians 14:2). This page does not say whether those are the same thing. In a church Paul asks for an interpretation, and where nobody interprets he tells the speaker to “keep silent in the assembly, and let him speak to himself and to God” (1 Corinthians 14:27-28). Whether something was this gift is for a church and those who lead it to say, not this page. Many Christians believe God still gives this gift today; many believe He gave it only for the time of the apostles.',
  hospitality:
    'Peter asks hospitality of everyone and speaks of each person’s gift in the next sentence, so coming out low here releases nobody from the first. The word he uses means stranger-loving, and it is the exact opposite of the word English took for the fear of strangers. Paul asks the same of the Romans, “given to hospitality” (Romans 12:13), and Hebrews adds the reason most likely to make a reader open the door: “some have entertained angels without knowing it” (Hebrews 13:2).\n\n' +
    'In an ordinary week it is a place laid before anybody asked for it. It is the house the students end up at, the family who take the new couple home for lunch on their first Sunday, the person who sees a visitor standing alone with a coffee and is beside them within a minute.\n\n' +
    'People notice it by what a full house does to them. You add a seat for whoever turns up rather than keeping to the numbers you planned for. New people end up sitting with you without either of you arranging it. Where somebody else is counting chairs, you are counting how many more will fit.\n\n' +
    'It is most often confused with entertaining, and the difference is who the evening is about. Entertaining is about the host: the room, the food, whether it went well. Hospitality is about the stranger, and it survives a burnt dinner. It is also confused with serving, which is aimed at the job rather than at the person, and Peter adds the hardest clause in the verse for anybody who has both: without grumbling.',
  interpretation:
    'The translation quoted here says the interpretation of languages: giving a church the meaning of what was said in a language it does not know, so that, in Paul’s words, “the assembly may be built up” (1 Corinthians 14:5). Acts never shows anyone doing it; what the New Testament has is Paul’s instructions to Corinth, below. Whether something was this gift is for a church and those who lead it to say, not this page. Many Christians believe God still gives this gift today; many believe He gave it only for the time of the apostles.\n\n' +
    'Where it happens at all it happens in the seconds after somebody has spoken, and Paul sets the shape of it tightly: two speakers or at most three, in turn, and one person interpreting (1 Corinthians 14:27).\n\n' +
    'It is most often confused with the gift it depends on. Paul treats speaking and interpreting as two gifts and still tells the speaker to pray for the second one (1 Corinthians 14:13), which means he thought one person might hold both. It is also confused with translation. The Greek word is the root of the English word hermeneutics, the study of how texts are understood, and it means giving the sense of a thing rather than swapping one word for another.'
};

export const giftActs: Record<string, GiftAct[]> = {
  serving: [
    { ref: 'Acts 6:1-6', what: 'When the Hellenists complained that their widows were neglected in the daily service, the disciples chose seven men and set them before the apostles, who prayed and laid their hands on them.' },
    { ref: 'Romans 16:1-2', what: 'Paul commends Phoebe, a servant of the church at Cenchreae, and asks the Romans to assist her because she has been a helper of many, himself included.' }
  ],
  teaching: [
    { ref: 'Acts 18:24-26', what: 'Apollos taught accurately about Jesus but knew only the baptism of John; Priscilla and Aquila took him aside and explained the way of God to him more accurately.' },
    { ref: 'Acts 11:25-26', what: 'Barnabas fetched Saul from Tarsus to Antioch, where for a whole year the two met with the church and taught many people.' }
  ],
  encouraging: [
    { ref: 'Acts 4:36', what: 'The apostles called Joses of Cyprus Barnabas, which Luke translates as Son of Encouragement.' },
    { ref: 'Acts 11:22-23', what: 'Sent to Antioch, Barnabas saw what had happened there, was glad, and exhorted them all to remain near to the Lord with purpose of heart.' },
    { ref: 'Acts 15:30-32', what: 'After the letter from Jerusalem was read at Antioch, Judas and Silas, whom Luke calls prophets themselves, encouraged the brothers with many words and strengthened them.' }
  ],
  giving: [
    { ref: 'Acts 4:34-37', what: 'Owners of lands and houses sold them and laid the proceeds at the apostles’ feet, Barnabas among them with the price of a field, and distribution was made to each as anyone had need.' },
    { ref: '2 Corinthians 8:1-5', what: 'Paul reports that the churches of Macedonia, in deep poverty, gave of their own accord beyond their power and begged to share in the service to the saints.' }
  ],
  healing: [
    { ref: 'Acts 3:1-12', what: 'At the temple gate Peter told a man lame from birth that he had no silver or gold but would give what he had, and said, in the name of Jesus Christ of Nazareth, get up and walk; he took him by the right hand and raised him up, immediately his feet and ankle bones received strength, and he went into the temple walking, leaping and praising God; when the people ran together in wonder, Peter asked why they looked at him and John as though they had made the man walk by their own power or godliness.' },
    { ref: 'Acts 5:12-16', what: 'By the hands of the apostles many signs and wonders were done among the people, and more believers were added to the Lord; the sick were carried into the streets and laid on cots and mattresses so that Peter’s shadow might fall on some of them as he came by, and crowds from the cities around Jerusalem brought the sick and those tormented by unclean spirits, and they were all healed.' },
    { ref: 'Acts 9:17-18', what: 'Ananias entered the house and, laying his hands on Saul, told him that the Lord Who had appeared to him on the road had sent Ananias so that he might receive his sight and be filled with the Holy Spirit; immediately something like scales fell from Saul’s eyes and he received his sight, and he arose and was baptised.' },
    { ref: 'Acts 28:7-9', what: 'The father of Publius, the chief man of the island, lay sick with fever and dysentery; Paul went in to him, prayed, and laying his hands on him healed him, and then the rest on the island who had diseases came and were cured.' }
  ],
  leading: [
    { ref: 'Acts 15:13-29', what: 'At Jerusalem, once the others had fallen silent, James gave his judgement on what to ask of the Gentiles, and the apostles, elders and whole church sent it out in a letter.' },
    { ref: 'Acts 6:2-4', what: 'Faced with the neglected widows, the twelve set out how the work should be divided: seven men over that business, and themselves kept to prayer and the word.' }
  ],
  mercy: [
    { ref: 'Acts 9:36-39', what: 'Tabitha of Joppa, whom Luke describes as full of good works and acts of mercy, had made tunics and other garments, which the widows showed Peter, weeping, after she died.' },
    { ref: '2 Timothy 1:16-18', what: 'Paul writes that Onesiphorus often refreshed him, was not ashamed of his chain, and in Rome sought him diligently and found him.' }
  ],
  knowledge: [
    { ref: '1 Corinthians 1:4-7', what: 'Paul writes that he always thanks his God for the grace of God given to the Corinthians in Christ Jesus: that in everything they were enriched in Him, in all speech and all knowledge, even as the testimony of Christ was confirmed in them, so that they come behind in no gift, waiting for the revelation of our Lord Jesus Christ.' },
    { ref: '1 Corinthians 14:6', what: 'Paul asks what he would profit them if he came speaking with other languages, unless he spoke to them by way of revelation, or of knowledge, or of prophesying, or of teaching.' },
    { ref: 'Romans 15:14', what: 'Paul writes that he is persuaded the Christians at Rome are full of goodness, filled with all knowledge, and able also to admonish others.' }
  ],
  administration: [
    { ref: 'Titus 1:5', what: 'Paul left Titus in Crete to set in order the things that were lacking and to appoint elders in every city, as he had directed.' },
    { ref: '2 Corinthians 8:18-21', what: 'A brother appointed by the churches travelled with the collection, so that nobody could blame Paul’s company over the money they were administering.' }
  ],
  wisdom: [
    { ref: 'Acts 6:9-10', what: 'Men from several synagogues disputed with Stephen and were not able to withstand the wisdom and the Spirit by which he spoke.' },
    { ref: 'Acts 6:3', what: 'The twelve asked the disciples to select seven men of good report, full of the Holy Spirit and of wisdom.' }
  ],
  miracles: [
    { ref: 'Acts 9:40-42', what: 'At Joppa Peter sent them all out, knelt down and prayed, and turning to the body told Tabitha to get up; she opened her eyes and, seeing Peter, sat up; he gave her his hand, raised her up and presented her alive to the saints and widows, and it became known throughout all Joppa and many believed in the Lord.' },
    { ref: 'Acts 19:11-12', what: 'Luke writes that God worked special miracles by the hands of Paul, so that even handkerchiefs or aprons were carried away from his body to the sick, and the diseases departed from them and the evil spirits went out.' },
    { ref: 'Galatians 3:5', what: 'Paul asks the Galatians whether He Who supplies the Spirit to them and does miracles amongst them does it by the works of the law or by hearing of faith.' },
    { ref: '2 Corinthians 12:12', what: 'Paul writes to the Corinthians that truly the signs of an apostle were worked amongst them in all perseverance, in signs and wonders and mighty works.' }
  ],
  discernment: [
    { ref: 'Acts 8:18-23', what: 'When Simon offered money for the power to give the Holy Spirit, Peter told him his heart was not right before God and said what he saw in him.' },
    { ref: 'Acts 5:1-4', what: 'Ananias kept back part of a sale price and laid the rest at the apostles’ feet; Peter asked him why Satan had filled his heart to lie to the Holy Spirit and to keep back part of the price. Luke does not say how Peter knew.' },
    { ref: 'Acts 13:6-10', what: 'At Paphos they found a sorcerer, a false prophet, whose name was Bar Jesus, with the proconsul, who had summoned Barnabas and Saul to hear the word of God; the sorcerer, whose name Luke also gives as Elymas, withstood them, seeking to turn the proconsul away from the faith, and Paul, filled with the Holy Spirit, fastened his eyes on him and called him full of all deceit.' },
    { ref: 'Acts 17:11', what: 'The Jews of Beroea received the word with all readiness of mind and examined the Scriptures daily to see whether these things were so.' }
  ],
  faith: [
    { ref: 'Acts 27:21-25', what: 'In the storm, with those aboard long without food, Paul stood up and told them to cheer up: an angel had stood by him that night and said all aboard would live, and he said he believed God that it would be just as he had been told.' },
    { ref: 'Acts 6:5-8', what: 'Among the seven the disciples chose, Luke singles out Stephen as a man full of faith and of the Holy Spirit, and three verses later as full of faith and power, performing great wonders and signs among the people.' }
  ],
  prophecy: [
    { ref: 'Acts 11:27-30', what: 'Prophets came down from Jerusalem to Antioch, and one of them, Agabus, stood up and indicated by the Spirit that there would be a great famine all over the world, which Luke says happened in the days of Claudius; the disciples, each as he had plenty, determined to send relief to the brothers in Judea, and sent it to the elders by Barnabas and Saul.' },
    { ref: 'Acts 13:1-3', what: 'In the church at Antioch there were prophets and teachers; as they served the Lord and fasted, the Holy Spirit said to separate Barnabas and Saul for the work to which He had called them, and when they had fasted and prayed and laid their hands on them, they sent them away.' },
    { ref: 'Acts 21:8-14', what: 'At Caesarea Paul’s company stayed in the house of Philip the evangelist, one of the seven, who had four virgin daughters who prophesied; a prophet named Agabus came down from Judea, bound his own feet and hands with Paul’s belt, and said that the Holy Spirit says the Jews at Jerusalem will bind the man who owns the belt in this way and deliver him into the hands of the Gentiles; the company and the people of that place begged Paul not to go up to Jerusalem, he answered that he was ready not only to be bound but to die there for the name of the Lord Jesus, and when he would not be persuaded they ceased, saying that the Lord’s will be done.' },
    { ref: '1 Timothy 1:18', what: 'Paul commits his instruction to Timothy according to the prophecies which were given to him before, so that by them he may wage the good warfare.' }
  ],
  evangelism: [
    { ref: 'Acts 8:5-8', what: 'Philip proclaimed the Christ in the city of Samaria; the crowds listened when they heard and saw the signs he did, unclean spirits came out, many paralysed and lame were healed, and there was great joy in that city.' },
    { ref: 'Acts 8:26-35', what: 'Told by the Spirit to go near the chariot, Philip ran to the Ethiopian official, asked whether he understood what he was reading, and beginning from that Scripture told him about Jesus.' },
    { ref: 'Acts 21:8', what: 'Luke later calls him Philip the evangelist, and Paul’s company stayed at his house in Caesarea.' }
  ],
  shepherding: [
    { ref: 'Acts 20:28-31', what: 'Paul told the Ephesian elders to take heed to themselves and to all the flock, reminding them that for three years he had not ceased to admonish everyone night and day with tears.' },
    { ref: '1 Peter 5:1-3', what: 'Peter tells the elders to shepherd the flock willingly and not under compulsion, not lording it over those entrusted to them but as examples.' }
  ],
  tongues: [
    { ref: 'Acts 2:1-13', what: 'When the day of Pentecost had come there was a sound from the sky like the rushing of a mighty wind, tongues like fire appeared and one sat on each of them, and they were all filled with the Holy Spirit and began to speak with other languages as the Spirit gave them the ability; Jews from every nation, dwelling in Jerusalem, came together bewildered because everyone heard them speaking in his own language the mighty works of God, and others, mocking, said they were filled with new wine.' },
    { ref: 'Acts 10:44-46', what: 'While Peter was still speaking, the Holy Spirit fell on all who heard the word, and the circumcised believers who had come with Peter were amazed that the gift of the Holy Spirit was poured out on the Gentiles also, for they heard them speaking in other languages and magnifying God.' },
    { ref: 'Acts 19:1-7', what: 'At Ephesus Paul found certain disciples who said they had not even heard that there is a Holy Spirit and had been baptised into John’s baptism; they were baptised in the name of the Lord Jesus, and when Paul had laid his hands on them the Holy Spirit came on them and they spoke with other languages and prophesied; they were about twelve men in all.' },
    { ref: '1 Corinthians 14:18-19', what: 'Paul thanks God that he speaks with other languages more than all of them, and says that in the church he would rather speak five words with his understanding, to instruct others, than ten thousand words in another language.' }
  ],
  hospitality: [
    { ref: 'Acts 16:14-15', what: 'After Lydia and her household were baptised at Philippi, she begged Paul’s company to come into her house and stay, and persuaded them.' },
    { ref: 'Romans 16:23', what: 'Paul sends greetings from Gaius, whom he calls his host and host of the whole church.' }
  ],
  interpretation: [
    { ref: '1 Corinthians 14:5', what: 'Paul writes that he desires them all to speak with other languages, but even more to prophesy, for he who prophesies is greater than he who speaks with other languages, unless he interprets, so that the church may be built up.' },
    { ref: '1 Corinthians 14:13', what: 'Paul tells the one who speaks in another language to pray that he may interpret.' },
    { ref: '1 Corinthians 14:26-28', what: 'Paul writes that when they come together each one has a psalm, a teaching, a revelation, another language or an interpretation, and that all things are to be done to build each other up; if anyone speaks in another language it is to be two or at the most three, in turn, with one interpreting, and if there is no interpreter the speaker is to keep silent in the church and speak to himself and to God.' }
  ]
};

/*
 * The summary used to open with the listing verse, because there was nowhere else for it
 * to go. There is now: the group's `quoted` field, which the group page prints in the
 * passage's own words, above this sentence. Keeping both printed the same verse twice on
 * one screen, so the summary is the plain description alone — the quotation is not lost,
 * it is one block higher up and correctly attributed to its translation.
 */
const summaryOf = (key: string) => PLAIN[key]!;

/*
 * ---------------------------------------------------------------------------------------
 * THE SEARCH-FACING FIELDS (2026-09-21). Shared contract, design/seo/ROUND-2-BRIEF.md.
 *
 * Four generic, optional fields on any group — an axis or a gift — typed in engine/types.ts
 * and rendered once by pages/axis/[quiz]/[axis].astro. This file only supplies the data.
 *
 *   question    the question a person types, used as the heading over the answer block
 *   shortAnswer 40 to 50 words of visible text directly under the band, answering it
 *   whyItMatters what actually changes in a real church depending on the answer
 *   didYouKnow  up to three true, sourced, interesting details; `source` is printed small
 *
 * Every Greek note below was checked against a lexicon and every verse against the WEBBE
 * text on disk (demos/sounds-like-scripture/work/verses-all.json). The `source` string is
 * the working source note as well as the printed credit: if a claim cannot carry one, it
 * does not belong here. A quotation that carries a pronoun for God is the Berean Standard
 * Bible's wording instead, because the BSB capitalises it and the WEBBE's publisher asks
 * that altered text not be called the World English Bible; its `source` names the BSB, and
 * engine-test.mjs checks it against the BSB text (demos/sounds-like-scripture/work/
 * bsb-verses.json, from scripts/fetch-bsb-verses.mjs).
 * ---------------------------------------------------------------------------------------
 */
const WEB_SOURCE = 'World English Bible British Edition';
const BSB_SOURCE = 'Berean Standard Bible';

const QUESTION: Record<string, string> = {
  serving: 'What is the spiritual gift of serving?',
  teaching: 'What is the spiritual gift of teaching?',
  encouraging: 'What is the spiritual gift of encouragement?',
  giving: 'What is the spiritual gift of giving?',
  healing: 'What is the spiritual gift of healing?',
  leading: 'What is the spiritual gift of leadership?',
  mercy: 'What is the spiritual gift of mercy?',
  knowledge: 'What is the word of knowledge?',
  administration: 'What is the spiritual gift of administration?',
  wisdom: 'What is the word of wisdom?',
  miracles: 'What is the spiritual gift of miracles?',
  discernment: 'What is the spiritual gift of discernment?',
  faith: 'What is the spiritual gift of faith?',
  prophecy: 'What is the spiritual gift of prophecy?',
  evangelism: 'What is the spiritual gift of evangelism?',
  shepherding: 'What is the spiritual gift of shepherding, or pastoring?',
  tongues: 'What is the spiritual gift of tongues?',
  hospitality: 'What is the spiritual gift of hospitality?',
  interpretation: 'What is the gift of interpreting tongues?'
};

const SHORT_ANSWER: Record<string, string> = {
  serving:
    'Serving is the gift of doing the practical work everything else depends on: the chairs, the lift to hospital, the meal, the form filled in. Romans 12:7 calls it service and 1 Corinthians 12:28 calls it helps. It is the gift a church notices only when it stops.',
  teaching:
    'Teaching is the gift of making something understood and staying with a person until it is. Romans 12:7 names it, 1 Corinthians 12:28 ranks teachers third in the church after apostles and prophets, and Ephesians 4:11 pairs them with shepherds. It is patience with a question, not a platform.',
  encouraging:
    'Encouragement is the gift of saying the thing that makes a person take heart and carry on. Romans 12:8 names it; older translations say exhorting, which keeps the push in it. It is not flattery. It means telling someone what you think they can do before they believe it.',
  giving:
    'Giving is the gift of letting money and possessions go where they are needed, gladly and with no hook attached. Romans 12:8 names it and asks one thing only, that it be done with generosity. Nothing in the passage counts amounts, and the churches Paul praises for it were poor.',
  healing:
    'Healing is named twice by Paul and both times in the plural: gifts of healings (1 Corinthians 12:9 and 12:28). Christians disagree about whether it is given today. All agree God still heals and answers prayer, and James asks the prayer for the sick of every church.',
  leading:
    'Leadership is the gift of taking on the direction of a shared work and answering for how it goes. Romans 12:8 names it, and the Greek behind rules means standing in front of something. The quality the verse attaches is diligence, not charisma and not confidence.',
  mercy:
    'Mercy is the gift of going towards people in distress and doing what eases it. Romans 12:8 names it and adds one instruction: do it with cheerfulness. The gift is not feeling sorry for somebody. It is staying in the room, and then coming back next week.',
  knowledge:
    'The word of knowledge is named once, in 1 Corinthians 12:8, and never explained. Christians read it in two ways: having what Scripture and Christian teaching say ready at the moment it is needed, and knowing something about a person that nobody had told you.',
  administration:
    'Administration is the gift of keeping the order a shared work runs on: the rota, the list, the money, the diary. 1 Corinthians 12:28 names it, older translations say governments, and the Greek word behind it is the one for steering a ship.',
  wisdom:
    'The word of wisdom is named in 1 Corinthians 12:8 and never explained. In practice it is the gift of knowing what should be done when two good options are on the table and the right one is not obvious. Paul lists it first of the nine.',
  miracles:
    'Miracles is named in 1 Corinthians 12:10 and 12:28, and the Greek reads literally workings of powers. Christians disagree about whether it is given today. Those who believe it is do not claim it works to order; those who do not still believe God answers prayer.',
  discernment:
    'Discernment, or the discerning of spirits, is named in 1 Corinthians 12:10. It is the gift of telling what is behind a thing said or taught: whether it is true, and whether it is from God. Paul gives that job to a whole congregation, not to one person.',
  faith:
    'The gift of faith in 1 Corinthians 12:9 is not believing at all, which is asked of every Christian. It is listed as given to some and not to others: a settled certainty that God will do a particular thing, held after other people have stopped expecting it.',
  prophecy:
    'Prophecy is named in Romans 12:6 and 1 Corinthians 12:10, and Paul says what it is for: speaking to people for their building up, encouragement and comfort (1 Corinthians 14:3). Christians disagree about whether it is given today, and about how much weight it carries where it is.',
  evangelism:
    'Evangelism is the gift of telling the good news to people who have not heard it or do not hold it, and finding those conversations easy to start. Ephesians 4:11 names evangelists among the people Christ gave to His church. The word itself appears three times in the New Testament.',
  shepherding:
    'Shepherding is the gift of watching over the same people for a long time: knowing their situations, following up, staying once the crisis has passed. Ephesians 4:11 names shepherds, which most English Bibles render pastors, and pastor is simply the Latin word for shepherd.',
  tongues:
    'Tongues is speaking or praying in a language the speaker has never learnt. 1 Corinthians 12:10 names it, Acts 2 and 1 Corinthians 14 describe things that do not obviously match, and Christians disagree both about whether it is given today and about what it was.',
  hospitality:
    'Hospitality is the gift of making room, at a table, in a house, in a conversation, so that somebody who arrived a stranger does not leave as one. 1 Peter 4:9 asks it of everyone, one verse before Peter writes about gifts, and adds a clause: without grumbling.',
  interpretation:
    'Interpreting tongues is giving a church the meaning of what was said in a language nobody there knows, so that, in Paul’s words, the assembly may be built up. 1 Corinthians 12:10 names it, and Acts never shows anybody doing it.'
};

const WHY_IT_MATTERS: Record<string, string> = {
  serving:
    'Almost nothing a church does on a Sunday happens unless somebody did this first. The New Testament treats it as a gift of the Spirit rather than as the residue left over once the interesting jobs are taken, which is how it is usually treated in practice. Paul’s own picture is blunt about that: the parts of a body that seem weaker are the necessary ones (1 Corinthians 12:22).',
  teaching:
    'A church can only pass on what somebody has taken the trouble to explain, and the second generation is where that shows. The New Testament attaches a warning to this gift and to no other, which suggests its writers thought it carried unusual weight. Where teaching is weak people do not believe less; they believe things nobody can trace.',
  encouraging:
    'Most people leave a church quietly, and many of them leave at a point where one honest sentence would have held them. This is the gift that produces that sentence. It also keeps the other gifts working, because somebody has to tell the teacher, the server and the leader that the last nine months were worth it.',
  giving:
    'Every other gift on this list costs money to exercise at any scale, and somebody has to release it. A church with teaching, leading and mercy but no givers runs on the guilt of the same six households. Paul thought the money was worth asking for cheerfully rather than grimly, which changes what a church can honestly say from the front.',
  healing:
    'How a church answers this decides what happens when a member is diagnosed with something serious. In one church the elders are called, there is oil, and the prayer is specific. In another the same love arrives as meals, lifts and a steady visit every week. James asks for the first and never calls it a gift; the whole New Testament expects the second.',
  leading:
    'Somebody has to decide, and in a church nobody is obliged to obey, so the decision has to be one people will actually follow. That is why the quality Romans attaches is effort rather than authority. Where this gift is missing churches do not become gentler, they become slower, and the direction drifts to whoever is willing to be unpopular.',
  mercy:
    'Suffering in a church lasts far longer than the attention a church usually gives it, and this is the gift that covers the gap. A congregation with strong teaching and no mercy is a place where people learn a great deal and grieve alone. The cheerfulness clause matters too, because help offered grudgingly is remembered as a debt.',
  knowledge:
    'How a church reads this one decides who gets listened to. Read the first way it puts weight on people who have done the reading; read the second it puts weight on people who say they have been given something. Paul, who lists the gift, spends a chapter telling a church that prized it that knowledge without love comes to nothing.',
  administration:
    'Most church projects die of logistics rather than of conviction, and this is the gift that prevents it. It is also the gift that keeps a church honest with money, which is why Paul would not travel alone with a collection. Where it is missing everything depends on whoever has the best memory, and memories fail in June.',
  wisdom:
    'Churches rarely split over what is true. They split over what to do about it, and this is the gift that stops that second question being settled by whoever is angriest. Paul lists it first of the nine in 1 Corinthians 12, ahead of healing and miracles, which is worth noticing in any church that ranks the dramatic gifts highest.',
  miracles:
    'What a church believes here shapes what it is willing to ask for out loud. Some congregations pray in front of everyone for things that would be undeniable if they happened. Others would find that presumptuous and pray the same things quietly. Both are praying, and the difference is worth understanding before judging either.',
  discernment:
    'Churches are damaged far more often by a plausible teacher than by an obviously bad one, and this is the gift that catches the plausible. Paul puts the weighing in the hands of the room rather than of an office, so a congregation where questions are unwelcome has no defence at all. Used badly the same gift becomes a licence to distrust everybody, which is why the instruction ends in holding on to what is good.',
  faith:
    'Every worthwhile thing a church does passes through a stretch where the evidence says stop. This is the gift that keeps a few people asking anyway, and it is why some congregations attempt things that look reckless on paper. It is also easy to abuse, which is presumably why Paul puts it in a chapter about a body rather than about a hero.',
  prophecy:
    'This is the gift that decides what a church service can contain. Where it is believed to continue there is room for somebody to stand up and say something, and rules about who weighs it. Where it is believed to have ceased the same care shows up as careful preaching from a text anyone can check. Paul’s instructions assume both the speaking and the weighing.',
  evangelism:
    'A church grows by birth, by transfer or by this. Most Christians do not have the gift and are still asked to be ready with an answer when somebody asks (1 Peter 3:15), which is a much lower bar and a far commoner situation. The people who do have it are useful mostly because they show everybody else that the conversation is survivable.',
  shepherding:
    'Most pastoral need arrives long after the event that caused it, once the casseroles have stopped. This gift is what covers that stretch, and a church that only mobilises for crises is a church where people learn to get through things alone. It also protects the ordained: one paid pastor cannot know eighty families, and where this gift is recognised they do not have to.',
  tongues:
    'This is the gift that most visibly changes what a service looks like, which is why it is the one people argue about first. Paul does neither of the things churches usually do with it. He does not ban it and he does not let it run: his rule is that nothing happens in public which the room cannot follow, and the rest is between a person and God.',
  hospitality:
    'Nearly everyone who stays at a church stays because of a table they were invited to, not because of a sermon. This is the gift that produces the invitation, and it is the one most easily crowded out by the state of the kitchen. Peter puts it one verse before he starts writing about gifts, so nobody can read it as optional.',
  interpretation:
    'Paul makes this gift the gate on the other one. Where nobody can interpret, the speaker is to stay quiet in the meeting, so a church that practises tongues in public with nobody doing this is not following the instruction it thinks it is following. The reason is not tidiness. It is that a gathering exists to build people up, and nobody is built up by a sentence they cannot follow.'
};

const DID_YOU_KNOW: Record<string, Array<{ text: string; source: string }>> = {
  serving: [
    {
      text: 'The word behind “helps” in 1 Corinthians 12:28, antilepsis, appears nowhere else in the New Testament. Paul names the gift once and never explains it.',
      source: '1 Corinthians 12:28; antilepsis, Strong’s Greek 484'
    },
    {
      text: 'The Greek for “service” in Romans 12:7 is diakonia, which shares its root with the English word deacon. Luke never calls the seven men of Acts 6 deacons: he says they were appointed over the daily service, and the title arrives later, in 1 Timothy 3.',
      source: 'Romans 12:7; Acts 6:1-6; 1 Timothy 3:8-13'
    },
    {
      text: 'Paul uses the same word of a woman. He commends Phoebe, “a servant of the assembly that is at Cenchreae”, and asks the Roman church to give her whatever she needs.',
      source: `Romans 16:1-2, ${WEB_SOURCE}`
    }
  ],
  teaching: [
    {
      text: 'This is the only gift the New Testament attaches a warning to: “Let not many of you be teachers, my brothers, knowing that we will receive heavier judgement.”',
      source: `James 3:1, ${WEB_SOURCE}`
    },
    {
      text: 'Apollos was already an effective public speaker when a married couple took him aside and explained the way of God to him more accurately. Luke names Priscilla before her husband both times he describes what the two of them did.',
      source: `Acts 18:18, 18:24-26, ${WEB_SOURCE}`
    },
    {
      text: 'Paul describes teaching as a chain of four links: what Timothy heard from Paul, entrusted to faithful people, “who will be able to teach others also”.',
      source: `2 Timothy 2:2, ${WEB_SOURCE}`
    }
  ],
  encouraging: [
    {
      text: 'The apostles thought this was a man’s whole character and renamed him for it. Joses of Cyprus became Barnabas, which Luke translates “Son of Encouragement”. The Greek is paraklesis, the same root as parakletos, the word Jesus uses for the Holy Spirit in John 14:16.',
      source: 'Acts 4:36; John 14:16; paraklesis, Strong’s Greek 3874'
    },
    {
      text: 'Barnabas twice took a risk on somebody everyone else had written off: Saul, when the disciples in Jerusalem were still afraid of him, and John Mark, over an argument with Paul sharp enough to split the two of them up.',
      source: 'Acts 9:26-27; Acts 15:37-39'
    },
    {
      text: 'Hebrews asks encouragement of everybody and puts a clock on it: “exhort one another day by day, so long as it is called today”.',
      source: `Hebrews 3:13, ${WEB_SOURCE}`
    }
  ],
  giving: [
    {
      text: 'The word Romans attaches to giving, haplotes, means singleness or simplicity before it means generosity. Paul uses the same word of the Macedonians, who gave out of “deep poverty”.',
      source: 'Romans 12:8; 2 Corinthians 8:2; haplotes, Strong’s Greek 572'
    },
    {
      text: '“It is more blessed to give than to receive” is a saying of Jesus that appears in none of the Gospels. Paul quotes it to the Ephesian elders, and it is the only saying of His quoted anywhere in the New Testament outside them.',
      source: `Acts 20:35, ${WEB_SOURCE}`
    },
    {
      text: '“God loves a cheerful giver” (2 Corinthians 9:7). The Greek adjective there, hilaros, is the ancestor of the English word hilarious.',
      source: '2 Corinthians 9:7; hilaros, Strong’s Greek 2431'
    }
  ],
  healing: [
    {
      text: 'Paul never writes this one in the singular. Every time he names it both words are plural, “gifts of healings”, which many readers take to mean that each occasion is its own gift rather than a standing power somebody holds.',
      source: `1 Corinthians 12:9, 12:28, 12:30, ${WEB_SOURCE}`
    },
    {
      text: 'Paul expects the answer no to his own question, “Do all have gifts of healings?”, and the run of questions around it does the same for apostles, prophets, teachers and miracle workers.',
      source: `1 Corinthians 12:29-30, ${WEB_SOURCE}`
    },
    {
      text: 'James gives a church a procedure for illness and never calls it a gift: call the elders, let them pray and anoint with oil, and confess your sins to one another.',
      source: `James 5:14-16, ${WEB_SOURCE}`
    }
  ],
  leading: [
    {
      text: 'Romans attaches one word to this gift, spoude, translated diligence. In ordinary Greek it carries haste as well as earnestness. It is a word about getting on with it.',
      source: 'Romans 12:8; spoude, Strong’s Greek 4710'
    },
    {
      text: 'The first recorded act of leadership by the twelve was to give a job away. Faced with the neglected widows, they set out how the work should be divided and handed that part of it to seven other men.',
      source: 'Acts 6:1-6'
    },
    {
      text: 'At the council in Jerusalem the judgement is given by James rather than by Peter, and it goes out as a letter agreed by the apostles and the elders “with the whole assembly”.',
      source: `Acts 15:13-29, ${WEB_SOURCE}`
    }
  ],
  mercy: [
    {
      text: 'The word for cheerfulness in Romans 12:8, hilarotes, appears nowhere else in the New Testament. Its matching adjective is the one in “God loves a cheerful giver”.',
      source: 'Romans 12:8; 2 Corinthians 9:7; hilarotes, Strong’s Greek 2432'
    },
    {
      text: 'Paul’s word for mercy is the one the lawyer reaches for at the end of the good Samaritan, and he will not say “the Samaritan”. Asked which man was a neighbour, he answers, “He who showed mercy on him”, and Jesus replies, “Go and do likewise.”',
      source: `Luke 10:37, ${WEB_SOURCE}; Romans 12:8; eleeo and eleos, Strong’s Greek 1653 and 1656`
    },
    {
      text: 'Luke calls Tabitha of Joppa “full of good works and acts of mercy” and then says what they were: clothes, which the widows were still holding up to show Peter after she died.',
      source: `Acts 9:36-39, ${WEB_SOURCE}`
    }
  ],
  knowledge: [
    {
      text: 'Paul thanks God for the Corinthians because “in Him you have been enriched in every way, in all speech and all knowledge”, and twelve chapters later tells the same church that knowing all mysteries and all knowledge without love makes a person nothing.',
      source: `1 Corinthians 1:5, ${BSB_SOURCE}; 1 Corinthians 13:2`
    },
    {
      text: '“Knowledge puffs up, but love builds up” is Paul answering the Corinthians on their own favourite subject, four chapters before he lists it as a gift.',
      source: `1 Corinthians 8:1, ${WEB_SOURCE}`
    },
    {
      text: 'The New Testament calls no recorded act a word of knowledge. Every passage on this page is Paul writing about knowledge in a church, not Luke describing somebody using it.',
      source: '1 Corinthians 12:8; 1 Corinthians 14:6; Romans 15:14'
    }
  ],
  administration: [
    {
      text: 'The Greek in 1 Corinthians 12:28, kubernesis, appears nowhere else in the New Testament. In ordinary Greek it is what a helmsman does, and the related noun is the ship’s master of Acts 27:11 and Revelation 18:17. English “govern” comes down from the same word through Latin.',
      source: '1 Corinthians 12:28; Acts 27:11; Revelation 18:17; kubernesis, Strong’s Greek 2941'
    },
    {
      text: 'Paul sent a brother chosen by the churches to travel with the collection, so that nobody could blame his company over the money they were handling.',
      source: '2 Corinthians 8:18-21'
    },
    {
      text: 'Both the King James and the World English Bible read “governments” here, which is why some churches still speak of the gift of government rather than of administration. It is one Greek word either way.',
      source: '1 Corinthians 12:28, King James Version and World English Bible British Edition'
    }
  ],
  wisdom: [
    {
      text: 'When the twelve needed men to wait on tables, the qualification they asked for was a spiritual one: “seven men of good report, full of the Holy Spirit and of wisdom”.',
      source: `Acts 6:3, ${WEB_SOURCE}`
    },
    {
      text: 'James tells anyone short of wisdom to ask God, Who gives to everyone generously, and promises the answer: “it will be given to him”.',
      source: `James 1:5, ${WEB_SOURCE}`
    },
    {
      text: 'Paul sets this apart from the clever kind: “We speak wisdom, however, amongst those who are full grown, yet a wisdom not of this world nor of the rulers of this world who are coming to nothing.”',
      source: `1 Corinthians 2:6, ${WEB_SOURCE}`
    }
  ],
  miracles: [
    {
      text: 'The phrase in 1 Corinthians 12:10 is energemata dynameon, literally “workings of powers”. Dynamis is the ordinary Greek word for power, and both nouns are plural, exactly as with “gifts of healings” in the verse before.',
      source: '1 Corinthians 12:9-10; dynamis, Strong’s Greek 1411'
    },
    {
      text: 'Luke gives the credit away from the man whose hands were involved: “God worked special miracles by the hands of Paul.”',
      source: `Acts 19:11, ${WEB_SOURCE}`
    },
    {
      text: 'Paul asks the Galatians a question that takes miracles among them as a present fact: does He Who supplies the Spirit to you and works miracles among you do it by the works of the law, or by hearing of faith?',
      source: `Galatians 3:5, ${WEB_SOURCE}`
    }
  ],
  discernment: [
    {
      text: 'Paul gives the weighing of prophecy to the congregation rather than to an officeholder: “Let two or three of the prophets speak, and let the others discern.”',
      source: `1 Corinthians 14:29, ${WEB_SOURCE}`
    },
    {
      text: 'Hebrews treats this as trained rather than switched on. Solid food belongs to those “who by reason of use have their senses exercised to discern good and evil”.',
      source: `Hebrews 5:14, ${WEB_SOURCE}`
    },
    {
      text: 'The people Luke praises for checking were checking Paul. The Beroeans received the word readily and then examined the Scriptures daily “to see whether these things were so”, and Luke calls them more noble for it.',
      source: `Acts 17:11, ${WEB_SOURCE}`
    }
  ],
  faith: [
    {
      text: 'Paul’s own measure of this gift is deliberately extreme and then deliberately deflated: “if I have all faith, so as to remove mountains, but don’t have love, I am nothing”.',
      source: `1 Corinthians 13:2, ${WEB_SOURCE}`
    },
    {
      text: 'Luke describes Stephen twice within three verses, first as “full of faith and of the Holy Spirit” and then as “full of faith and power”.',
      source: `Acts 6:5 and 6:8, ${WEB_SOURCE}`
    },
    {
      text: 'The clearest picture of it in Acts is a man on a foundering ship telling everyone aboard to cheer up, on the strength of something said to him the night before.',
      source: 'Acts 27:21-25'
    }
  ],
  prophecy: [
    {
      text: 'Paul’s rule is that a prophet can be interrupted: “if a revelation is made to another sitting by, let the first keep silent”. Nobody in the room holds the floor by right.',
      source: `1 Corinthians 14:30, ${WEB_SOURCE}`
    },
    {
      text: 'Luke names four women as prophesying in a single sentence and quotes none of them: Philip the evangelist “had four virgin daughters who prophesied”.',
      source: `Acts 21:9, ${WEB_SOURCE}`
    },
    {
      text: 'Paul ends the argument with both halves of it in one line: “desire earnestly to prophesy, and don’t forbid speaking with other languages”.',
      source: `1 Corinthians 14:39, ${WEB_SOURCE}`
    }
  ],
  evangelism: [
    {
      text: 'The only man the New Testament calls an evangelist was first appointed to wait on tables. Philip is one of the seven chosen in Acts 6, and Luke gives him the title fifteen chapters later.',
      source: 'Acts 6:5; Acts 21:8'
    },
    {
      text: 'After the persecution in Jerusalem the good news spread through refugees rather than through the leadership. Everyone was scattered “except for the apostles”, and “those who were scattered abroad went around preaching the word”.',
      source: `Acts 8:1 and 8:4, ${WEB_SOURCE}`
    },
    {
      text: 'Paul tells Timothy to “do the work of an evangelist” without ever calling him one, which suggests the work can be asked of somebody who does not have the gift.',
      source: `2 Timothy 4:5, ${WEB_SOURCE}`
    }
  ],
  shepherding: [
    {
      text: 'The noun poimen appears eighteen times in the New Testament, and Ephesians 4:11 is the only one where it names a human church leader. Everywhere else it is a literal shepherd, or Christ, Who is called “the chief Shepherd”.',
      source: 'Ephesians 4:11; 1 Peter 5:4; poimen, Strong’s Greek 4166'
    },
    {
      text: 'Peter, who was told three times to feed Christ’s sheep, writes to elders as a fellow elder and tells them not to lord it over the flock.',
      source: 'John 21:15-17; 1 Peter 5:1-3'
    },
    {
      text: 'Paul measures his own shepherding at Ephesus in time and tears rather than in numbers: three years in which he did not cease “to admonish everyone night and day with tears”.',
      source: `Acts 20:31, ${WEB_SOURCE}`
    }
  ],
  tongues: [
    {
      text: 'Luke names fifteen peoples and places in the Pentecost crowd, from Parthians to Arabians, and what astonishes them is not the noise but the comprehension: “everyone heard them speaking in his own language”.',
      source: `Acts 2:6-11, ${WEB_SOURCE}`
    },
    {
      text: 'Paul says he speaks in other languages more than the whole Corinthian church, and then says that at church he would rather speak five words people can follow than ten thousand they cannot.',
      source: `1 Corinthians 14:18-19, ${WEB_SOURCE}`
    },
    {
      text: 'He does not call the private use worthless: “He who speaks in another language edifies himself, but he who prophesies edifies the assembly.” The whole argument is about what a gathering is for.',
      source: `1 Corinthians 14:4, ${WEB_SOURCE}`
    }
  ],
  hospitality: [
    {
      text: 'The Greek behind “hospitable” is philoxenos, literally stranger-loving. Its opposite is the word English borrowed for the fear of strangers.',
      source: '1 Peter 4:9; Romans 12:13; philoxenos, Strong’s Greek 5382'
    },
    {
      text: 'Paul signs off a letter from somebody else’s house: “Gaius, my host and host of the whole assembly, greets you.” One household was accommodating the entire church.',
      source: `Romans 16:23, ${WEB_SOURCE}`
    },
    {
      text: 'The first convert Luke names in Europe argued her way into hosting the missionaries. Lydia was baptised at Philippi, asked Paul’s company into her house, and Luke ends the scene, “So she persuaded us.”',
      source: `Acts 16:14-15, ${WEB_SOURCE}`
    }
  ],
  interpretation: [
    {
      text: 'The Greek is hermeneia, the root of the English word hermeneutics, which is the study of how texts are interpreted. It means giving the sense of something rather than translating word for word.',
      source: '1 Corinthians 12:10; hermeneia, Strong’s Greek 2058'
    },
    {
      text: 'Paul tells the person speaking to pray that he may interpret, so he did not assume the two gifts landed on two different people.',
      source: `1 Corinthians 14:13, ${WEB_SOURCE}`
    },
    {
      text: 'This is the gift that gates the other one: “if there is no interpreter, let him keep silent in the assembly, and let him speak to himself and to God”.',
      source: `1 Corinthians 14:28, ${WEB_SOURCE}`
    }
  ]
};

/**
 * Two gifts whose list below is NOT recorded acts.
 *
 * The New Testament calls no act a word of knowledge, and Acts never shows anyone
 * interpreting; both summaries say so. Printing "3 recorded acts, each cited" over three of
 * Paul's sentences would contradict the paragraph directly above it, which is why the
 * heading and the kicker are the group's own here and the page's default everywhere else.
 */
const WRITTEN_NOT_DONE = ['knowledge', 'interpretation'];

/** [key, slug, name]. Names are lower case, as in the sins quiz; the strategy capitalises. */
const GIFTS: Array<[string, string, string]> = [
  ['serving', 'serving', 'serving'],
  ['teaching', 'teaching', 'teaching'],
  ['encouraging', 'encouraging', 'encouraging'],
  ['giving', 'giving', 'giving'],
  ['healing', 'healing', 'healing'],
  ['leading', 'leading', 'leading'],
  ['mercy', 'mercy', 'showing mercy'],
  ['knowledge', 'knowledge', 'the word of knowledge'],
  ['administration', 'administration', 'administration'],
  // Not the bare word, for the reason "the gift of faith" is not: the verse names "the word
  // of wisdom" beside "the word of knowledge" (1 Corinthians 12:8), and a low row called
  // "wisdom" reads as "you are not wise". Key and slug are unchanged, so no URL moves.
  ['wisdom', 'wisdom', 'the word of wisdom'],
  ['miracles', 'miracles', 'miracles'],
  ['discernment', 'discernment', 'discernment'],
  // Not the bare word. A reader who comes out low on something called "faith" hears "you do
  // not believe", and the share text prints the name with no gloss beside it.
  ['faith', 'faith', 'the gift of faith'],
  ['prophecy', 'prophecy', 'prophecy'],
  ['evangelism', 'evangelism', 'evangelism'],
  ['shepherding', 'shepherding', 'shepherding'],
  ['hospitality', 'hospitality', 'hospitality']
];

/**
 * Taken out of the test on 2026-09-25, the owner's call: "their pages can stay up but they
 * won't be a result or any of the questions". Five of the fifty-seven statements were about
 * them, and he found that too many for gifts that anyone who has them already knows about.
 * Their pages are built from the same fields as every other gift's (Quiz.pageOnlyGroups).
 */
const PAGE_ONLY: Array<[string, string, string]> = [
  ['tongues', 'tongues', 'tongues'],
  ['interpretation', 'interpretation', 'interpreting tongues']
];

/**
 * `quoted` and `acts` are the engine's own group fields, wired 2026-09-19. They are NOT
 * `passages` and NOT `history`: PassagePills is headed "Passages both sides argue from"
 * and prints BSB text, and HistoryTimeline is headed "How the argument unfolded" — both
 * headings are false for a gift, and these quotations are WEBBE. The group page prints
 * `quoted` under "The passage it is named from" and `acts` under "What it has looked like".
 *
 * Nothing here is set on the six disputed gifts that is not set on the other thirteen. The
 * only per-group difference in the whole file is the acts heading on the two gifts the New
 * Testament records no act of, and it is about the LIST, not about the gift.
 */
/**
 * Each gift's own painting, across the band of its page and of a result that ranks it first, and
 * on that result's card on /me/ (the owner, 2026-09-25: "the header background should change
 * based on your result same as our other quizzes"). Public domain; credits in
 * public/img/CREDITS.md and printed in the band. Nothing violent and no nudity: that ruled out
 * every Judgment of Solomon, Good Samaritan and Prodigal Son found, and most healings.
 */
const BAND: Record<string, NonNullable<QuizGroup['band']>> = {
  serving: { src: "/img/gifts/serving.jpg", posM: "88% 50%", posD: "60% 50%",
    alt: "Tintoretto’s painting of Christ kneeling at a basin to wash Peter’s feet while the disciples take off their shoes across a wide tiled hall",
    credit: "Picture: The Washing of the Feet, Jacopo Tintoretto, about 1548–49. Museo del Prado, Madrid." },
  teaching: { src: "/img/gifts/teaching.jpg", posM: "68% 50%", posD: "50% 45%",
    alt: "Henryk Siemiradzki’s painting of Christ seated on a sunlit terrace, teaching Mary as she sits listening at His feet, while Martha stands in the doorway behind",
    credit: "Picture: Christ in the House of Martha and Mary, Henryk Siemiradzki, 1886. State Russian Museum, St Petersburg." },
  encouraging: { src: "/img/gifts/encouraging.jpg", posM: "80% 50%", posD: "50% 20%",
    alt: "Rembrandt’s painting of the aged apostle Paul in his prison cell, pen in hand and letters on his knee, lit by a shaft of light from the window",
    credit: "Picture: Saint Paul in Prison, Rembrandt, 1627. Staatsgalerie Stuttgart, Stuttgart." },
  giving: { src: "/img/gifts/giving.jpg", posM: "52% 60%", posD: "50% 62%",
    alt: "Paulus Lesire’s painting of a poor widow bending over the temple treasury to drop in her coins while Christ, in a red cloak, turns to point her out",
    credit: "Picture: The Widow’s Mite, Paulus Lesire, about 1628–32. Dordrechts Museum, Dordrecht." },
  healing: { src: "/img/gifts/healing.jpg", posM: "70% 50%", posD: "50% 62%",
    alt: "Nicolas Poussin’s painting of Christ touching the eyes of a kneeling blind man outside Jericho while a second blind man gropes toward Him",
    credit: "Picture: Christ Healing the Blind Men of Jericho, Nicolas Poussin, 1650. Musée du Louvre, Paris." },
  leading: { src: "/img/gifts/leading.jpg", posM: "43% 50%", posD: "45% 50%",
    alt: "Jacob de Wit’s painting of Moses standing with outstretched arms among the Israelites in the desert, choosing the seventy elders who will lead the people with him",
    credit: "Picture: Moses Choosing the Seventy Elders, Jacob de Wit, 1737. Royal Palace Amsterdam, Amsterdam." },
  mercy: { src: "/img/gifts/mercy.jpg", posM: "58% 60%", posD: "50% 90%",
    alt: "Nicolas Poussin’s painting of Christ, in a red cloak, pointing to His writing on the ground as the accusers turn away from the kneeling woman",
    credit: "Picture: Christ and the Woman Taken in Adultery, Nicolas Poussin, 1653. Musée du Louvre, Paris." },
  knowledge: { src: "/img/gifts/knowledge.jpg", posM: "80% 55%", posD: "50% 42%",
    alt: "Annibale Carracci’s painting of Christ seated by the well, speaking to the Samaritan woman who has come with her water jar, as the disciples return along the path",
    credit: "Picture: Christ and the Samaritan Woman, Annibale Carracci, about 1595–97. Museum of Fine Arts, Budapest." },
  administration: { src: "/img/gifts/administration.jpg", posM: "62% 50%", posD: "50% 50%",
    alt: "Giovanni Battista Tiepolo’s painting of an aged Pharaoh in a turban handing his signet ring to the young Joseph, in a red cloak, as trumpeters sound behind them",
    credit: "Picture: Joseph Receiving Pharaoh’s Ring, Giovanni Battista Tiepolo, about 1733–35. Dulwich Picture Gallery, London." },
  wisdom: { src: "/img/gifts/wisdom.jpg", posM: "80% 50%", posD: "50% 45%",
    alt: "William Holman Hunt’s painting of the twelve-year-old Jesus, in a striped violet robe, found by Mary among the teachers of the Temple, who sit with their scrolls",
    credit: "Picture: The Finding of the Saviour in the Temple, William Holman Hunt, 1854–60. Birmingham Museum and Art Gallery, Birmingham." },
  miracles: { src: "/img/gifts/miracles.jpg", posM: "50% 50%", posD: "50% 75%",
    alt: "Paolo Veronese’s painting of the wedding feast at Cana, Christ seated at the centre of the long table while servants pour from stone jars and musicians play in front",
    credit: "Picture: The Wedding at Cana, Paolo Veronese, 1562–63. Musée du Louvre, Paris." },
  discernment: { src: "/img/gifts/discernment.jpg", posM: "80% 50%", posD: "50% 26%",
    alt: "Peter Paul Rubens’s painting of Christ, in a red cloak, raising one hand as the Pharisees crowd in with the coin they hoped would trap Him",
    credit: "Picture: The Tribute Money, Peter Paul Rubens, about 1612. Fine Arts Museums of San Francisco, San Francisco." },
  faith: { src: "/img/gifts/faith.jpg", posM: "22% 40%", posD: "50% 30%",
    alt: "Paolo Veronese’s painting of a Roman centurion in armour kneeling before Christ, his soldiers behind him, asking Him only to say the word",
    credit: "Picture: Jesus and the Centurion, Paolo Veronese, about 1571. Museo del Prado, Madrid." },
  prophecy: { src: "/img/gifts/prophecy.jpg", posM: "70% 50%", posD: "50% 52%",
    alt: "Rembrandt’s painting of the old prophet Jeremiah resting his head on his hand in a cave while Jerusalem burns in the distance",
    credit: "Picture: Jeremiah Lamenting the Destruction of Jerusalem, Rembrandt, 1630. Rijksmuseum, Amsterdam." },
  evangelism: { src: "/img/gifts/evangelism.jpg", posM: "40% 50%", posD: "50% 39%",
    alt: "Rembrandt’s painting of Philip speaking over the Ethiopian official, who kneels in a white fur-lined cloak beside his chariot while a servant holds open his book",
    credit: "Picture: The Baptism of the Eunuch, Rembrandt, 1626. Museum Catharijneconvent, Utrecht." },
  shepherding: { src: "/img/gifts/shepherding.jpg", posM: "50% 50%", posD: "50% 50%",
    alt: "Bartolomé Esteban Murillo’s painting of the Christ Child as the Good Shepherd, seated on a rock with a crook, one arm around a lamb, His flock grazing behind",
    credit: "Picture: The Good Shepherd, Bartolomé Esteban Murillo, about 1660. Museo del Prado, Madrid." },
  hospitality: { src: "/img/gifts/hospitality.jpg", posM: "25% 50%", posD: "50% 28%",
    alt: "Francesco Guardi’s painting of Abraham serving bread to three angels at a table beneath a great tree, one angel pointing toward the tent where Sarah waits",
    credit: "Picture: Abraham Welcoming the Three Angels, Francesco Guardi, 1750s. Cleveland Museum of Art, Cleveland." }
};

const build = ([key, slug, name]: [string, string, string]): QuizGroup => ({
  key,
  slug,
  name,
  summary: summaryOf(key),
  // The shared search contract. Generic optional fields on any group, rendered once by
  // pages/axis/[quiz]/[axis].astro; this file only supplies the words. See the block above.
  question: QUESTION[key]!,
  shortAnswer: SHORT_ANSWER[key]!,
  whyItMatters: WHY_IT_MATTERS[key]!,
  didYouKnow: DID_YOU_KNOW[key]!,
  quoted: giftSources[key]!,
  quotedFrom: WEBBE,
  acts: giftActs[key]!,
  ...(BAND[key] ? { band: BAND[key] } : {}),
  ...(WRITTEN_NOT_DONE.includes(key)
    ? {
        actsHeading: 'What Paul writes about it',
        actsKicker: `${giftActs[key]!.length} passages, each cited`
      }
    : {})
});
const groups: QuizGroup[] = GIFTS.map(build);
const pageOnlyGroups: QuizGroup[] = PAGE_ONLY.map(build);

/**
 * Three per gift, in the order [key, text, direction, kind]. Direction was re-derived from the
 * final wording: +1 where agreeing describes the gift's pattern, -1 where agreeing describes
 * its absence. Provenance for every line is in audit/new-quizzes/gifts-all-final.md; four were
 * reworded plainly on 2026-09-25 at the owner's request (serving's and shepherding's reverse
 * statements, leading's "did", hospitality's "did"), each keeping its gift, kind and direction.
 *
 * Each gift has exactly one reverse-keyed item, exactly one statement about what other
 * people bring you or say of you, and one about what you do or what has happened. The
 * reverse-keyed item sits in a different slot from gift to gift so that the running order
 * below never produces a round that is all reverse items.
 */
/**
 * What each statement asks, and how much it counts (2026-09-25). The owner found too many
 * rows level on a quiz this long, and asked for numbers that rarely tie. Three statements a
 * gift cannot give fine numbers by themselves, so they are weighed, in whole units, by what
 * each can see: what other people bring you or say of you counts most, because the frame of
 * this whole quiz is that the people who watch you serve see more than you do; what you do or
 * what has happened comes next; the reverse-worded statement counts least, because readers
 * misread negatives more than anything else. 6 + 5 + 4 = 15 units a gift, so a gift's number
 * moves in steps of a sixtieth instead of a twelfth. The order of the rows barely changes;
 * what changes is that two gifts rarely land on the same number.
 */
type Kind = 'others' | 'did' | 'rev';
const WEIGHT: Record<Kind, number> = { others: 6, did: 5, rev: 4 };

const RAW: Array<[string, string, 1 | -1, Kind]> = [
  ['serving', 'When something practical needs doing, I have usually started before anyone asked me to.', 1, 'did'],
  ['serving', 'After a meal or an event, I usually leave the tidying up to other people.', -1, 'rev'],
  ['serving', 'People ask me when an errand needs running or a form needs filling in, and I usually say yes.', 1, 'others'],

  ['teaching', 'People come to me to have something explained, even when they only wanted the short answer.', 1, 'others'],
  ['teaching', 'I check whether the other person actually followed me before I move on.', 1, 'did'],
  ['teaching', 'I would rather send somebody a good link than sit down and walk them through it.', -1, 'rev'],

  ['encouraging', 'When a friend is hesitating, I leave them to decide rather than press them.', -1, 'rev'],
  ['encouraging', 'People come to me when they need a push to do the thing they are avoiding.', 1, 'others'],
  ['encouraging', 'I tell people what I think they are capable of, even when they have not asked.', 1, 'did'],

  ['giving', 'I give away things I am still using when somebody needs them more than I do.', 1, 'did'],
  ['giving', 'Even when I can afford it, I look for a way to help other than money.', -1, 'rev'],
  ['giving', 'People tell me when someone they know is going without, and I usually find something to give.', 1, 'others'],

  ['healing', 'People have asked me to pray for them because someone they know got better after I prayed.', 1, 'others'],
  ['healing', 'When somebody is ill, I am more likely to bring them a meal than to pray with them.', -1, 'rev'],
  ['healing', 'More than once, someone I prayed for has recovered when the people around them did not expect it.', 1, 'did'],

  ['leading', 'People have put me in charge of things I did not ask to run.', 1, 'others'],
  ['leading', 'When a group has no clear direction, I am usually the one who sets it.', 1, 'did'],
  ['leading', 'I would rather be told where we are going than be the one to decide it.', -1, 'rev'],

  ['mercy', 'I keep my distance from people in distress until I know how to help.', -1, 'rev'],
  ['mercy', 'When somebody starts crying, I move closer rather than give them room.', 1, 'did'],
  ['mercy', 'People turn to me when they are at their lowest, even people I do not know well.', 1, 'others'],

  ['knowledge', 'In a discussion I end up quoting the part of the Bible people were trying to remember.', 1, 'did'],
  ['knowledge', 'People have asked me how I knew something about them that nobody had told me.', 1, 'others'],
  ['knowledge', 'When a question about what Christians believe comes up, I am the one asking rather than answering.', -1, 'rev'],

  ['administration', 'When plans are loose, I write them down and send them round without being asked.', 1, 'did'],
  ['administration', 'When a group makes plans, I leave it to someone else to keep the list.', -1, 'rev'],
  ['administration', 'People send me the details because they know I will keep track of them.', 1, 'others'],

  ['wisdom', 'When two good options are on the table, people ask me which one to take.', 1, 'others'],
  ['wisdom', 'In an argument I end up saying what I think the disagreement is actually about.', 1, 'did'],
  ['wisdom', 'When a friend asks my advice, I tell them what I would do myself.', -1, 'rev'],

  ['miracles', 'People who were there have used the word miracle for something that happened when I prayed.', 1, 'others'],
  ['miracles', 'Remarkable answers to prayer are things I hear about from others, not things I have been part of.', -1, 'rev'],
  ['miracles', 'I have prayed for something the others there thought impossible, and it happened.', 1, 'did'],

  ['discernment', 'I take a new idea as it sounds rather than look into where it came from.', -1, 'rev'],
  ['discernment', 'I have stopped listening to a speaker or writer I liked because of what they taught about God.', 1, 'did'],
  ['discernment', 'I have raised a worry about something said to be from God, and the people I took it to later agreed.', 1, 'others'],

  ['faith', 'I keep telling people a thing will come right after they have stopped expecting it.', 1, 'did'],
  ['faith', 'When the odds look bad, I am among the first to say we should stop.', -1, 'rev'],
  ['faith', 'When everyone else has given up on something, people ask me whether I still think it will happen.', 1, 'others'],

  ['prophecy', 'I leave it to others to say what they believe God is saying.', -1, 'rev'],
  ['prophecy', 'People have told me that something I said to them was what God wanted them to hear.', 1, 'others'],
  ['prophecy', 'I have said something at church that I believed God had given me to say.', 1, 'did'],

  ['evangelism', 'I end up talking about God with people I have only just met.', 1, 'did'],
  ['evangelism', 'People who do not go to church ask me questions about God.', 1, 'others'],
  ['evangelism', 'I keep what I believe to myself unless somebody asks me directly.', -1, 'rev'],

  ['shepherding', 'Once I have helped someone through a hard patch, I rarely check in on them again.', -1, 'rev'],
  ['shepherding', 'I keep following up with the same few people long after everybody else has moved on.', 1, 'did'],
  ['shepherding', 'People I helped years ago still come back to me when something goes wrong.', 1, 'others'],

  ['hospitality', 'I often have people round for a meal, including people I have only just met.', 1, 'did'],
  ['hospitality', 'I would rather meet people somewhere out than have them in my home.', -1, 'rev'],
  ['hospitality', 'When someone new turns up, they usually end up sitting with me.', 1, 'others']
];

const keys = groups.map(g => g.key);
const PER = 3;

/**
 * The running order. A reader meets one statement at a time, and three in a row about the
 * same gift would announce the gift, so the instrument runs in three rounds of seventeen:
 * round r takes each gift's r-th statement, and each round walks the gifts from a different
 * start with a different stride (17 is prime, so every stride visits every gift once). No two
 * statements from one gift are ever adjacent, and the pairs a reader would read as one
 * question asked twice never sit side by side: prophecy with knowledge, wisdom, discernment
 * or encouraging; knowledge with wisdom, discernment or teaching; healing with miracles,
 * faith or mercy; miracles with faith or mercy — and the nine pairs the first edit kept
 * apart. The last statement is not one of the four disputed gifts, so nobody
 * finishes on the contested ground. engine-test.mjs asserts all of it.
 */
const ROUNDS: Array<[start: number, stride: number]> = [[0, 1], [1, 5], [4, 12]];

const ordered: Array<[string, string, 1 | -1, Kind]> = ROUNDS.flatMap(([start, stride], r) =>
  keys.map((_, k) => RAW[((start + k * stride) % keys.length) * PER + r]!)
);

const items: QuizItem[] = ordered.map(([key, text, direction, kind], i) => ({
  n: i + 1,
  text,
  group: keys.indexOf(key),
  direction,
  weight: WEIGHT[kind]
}));

/**
 * The honest frame. The blueprint requires it on the intro and on the result. The Quiz type
 * has no slot for it yet, so it is exported for the engineer to place.
 *
 * The blueprint's own wording is "for the common good"; the translation on disk says "for the
 * profit of all" (1 Corinthians 12:7), and this site quotes the text on disk. One quotation in
 * the intro is NOT the WEBBE's: 1 Corinthians 12:11 carries a pronoun for the Spirit, so it is
 * the Berean Standard Bible's wording, which capitalises it ("as He determines").
 */
export const giftsFrame = {
  translation: WEBBE,
  /** The one quotation above that is not from `translation`. */
  alsoQuoted: { ref: '1 Corinthians 12:11', translation: BSB_SOURCE },
  intro:
    'Scripture gives lists of gifts. It gives no test for finding which are yours. It says the ' +
    'Spirit gives them “to each one as He determines” (1 Corinthians 12:11), and that each ' +
    'is given “for the profit of all” (1 Corinthians 12:7). So this is a ' +
    'conversation starter, not a verdict: fifty-one statements cannot see your last ten ' +
    'years, and the people who have watched you serve can. If you know the lists you will ' +
    'sometimes see which gift a statement is about, and with a few, such as healing and ' +
    'miracles, there is no honest way to ask without showing it. That is one more reason to ' +
    'take the result to your pastor or priest and to one or two people who have served ' +
    'alongside you, and ask them whether it is true. Catholic readers usually call the gifts ' +
    'in these lists charisms, and keep “the gifts of the Holy Spirit” for the seven that ' +
    'Catholic teaching draws from Isaiah 11:2; this page is about the first.',
  /** The one line for above the start button on a phone, if the full intro sits below it. */
  introShort:
    'Scripture lists gifts and gives no test for finding which are yours; ask your pastor or priest and the people who have watched you serve.',
  result:
    'This is where your answers pointed, not a measure of what God has given you. It is here ' +
    'to show you something you may not have noticed. Take it to your pastor or priest, or to ' +
    'someone who has served beside you, and ask whether it matches what they have seen.',
  /** What a low row means. Must print wherever a gift is shown below the line. */
  low:
    'A low row is something these statements did not find, not a verdict on you.',
  /** Replaces the strategy's flat-state summary for this quiz. */
  flat:
    '“As each has received a gift, employ it in serving one another” (1 Peter 4:10). ' +
    'None of your answers leaned far enough toward one gift to name it. Ask the people who ' +
    'have watched you serve.',
  /** A headline frame, so the largest type on the page is not a bare one-word verdict. */
  headlineLead: 'Your answers pointed most to',
  /*
   * What is NOT scored, and why. It carries no link on purpose: the three things named here
   * are left out because statements of this kind have nothing to say about them, which is a
   * fact about the instrument and not a disagreement between Christians. The disagreement
   * has its own note, `disputed`, and that one carries the link.
   */
  notScored:
    'Not scored here: apostles (“first apostles”, 1 Corinthians 12:28; also Ephesians 4:11), ' +
    'the gift Paul names when he writes of remaining unmarried (“each man has his own gift ' +
    'from God”, 1 Corinthians 7:7), and the gift Paul tells Timothy was “given to you by ' +
    'prophecy with the laying on of the hands of the elders” (1 Timothy 4:14). Statements ' +
    'about what you do, what has happened and what people bring you have nothing to say about ' +
    'any of the three. Leaving them unscored says nothing about their rank, and nothing about ' +
    'whether they are given today. The same two lists name prophets beside apostles: prophecy ' +
    'is scored here, and whether anybody is a prophet is not.',
  /*
   * The disagreement, described and not settled, on the intro and on the result alike. It
   * reads truly in both places, which is why it is one string and not two.
   */
  disputed:
    'Christians disagree about whether prophecy, healing, miracles and the word of knowledge ' +
    'are given today. This test takes no side: it asks what has happened and what people have ' +
    'said, not what any of it was.',
  /** Link this to the Compass axis with groupHref(): its slug is `gifts`, its key is `spirit`. */
  disputedLink:
    'The Theology Compass sets that disagreement out in both sides’ own words.',
  /**
   * The line above the answer scale. It must not send a reader to "Unsure / neither": that
   * answer on the event statements, with "disagree" on the reverse items, scores 67 on all
   * six of the disputed rows, which is a fact about the keying and not about the reader.
   */
  scale:
    'If a sentence says a thing has happened and it never has, disagree is an honest answer.'
} as const;

export const spiritualGifts: Quiz = {
  slug: 'spiritual-gifts',
  title: 'What are your spiritual gifts?',
  tagline: 'Fifty-one statements, seventeen gifts, and a conversation to have afterwards.',
  menu: 'Which of the New Testament’s gifts are yours?',
  description:
    'Seventeen gifts the New Testament names, prophecy, healing and miracles among them, each ' +
    'in its passage’s own words. Fifty-one plain statements about what you do and what has ' +
    'happened. Scripture gives no test for gifts, so take the result to your pastor or priest ' +
    'and to people who know you.',
  /* The third sentence of the search line is said again, in the quiz's own words, in the
     note directly under the band (notes.introShort). Once is enough. */
  intro:
    'Seventeen gifts the New Testament names, prophecy, healing and miracles among them, each ' +
    'in its passage’s own words. Fifty-one plain statements about what you do and what has ' +
    'happened.',
  icon: 'scroll',
  minutes: 10,
  status: 'live',
  /*
   * Kept, and no longer printed anywhere: only a quiz with status 'draft' prints this. It
   * stays as the record of what this quiz has and has not been through, so that nothing has
   * to be rewritten if it ever goes back into draft. What it must never become is a line on
   * a live page claiming an audit this quiz has not had.
   */
  draftNote:
    'This one is a draft. Its statements have had adversarial reviews, not the full ' +
    'fairness audit the Theology Compass went through. Every gift is quoted from the World ' +
    'English Bible British Edition. Treat the result as a conversation starter, not a verdict.',
  items,
  groups,
  pageOnlyGroups,
  // The highest-category strategy ranks the groups themselves; it reads no outcomes.
  outcomes: [],
  strategy: category,
  /** A gift, not a category: the hub counts "19 gifts" wherever it counts groups in words. */
  groupNoun: 'gift',
  groupNounPlural: 'gifts',
  config: {
    // Three weighted statements a gift, 6 + 5 + 4 = 15 units: raw runs -30..+30, so 61
    // reachable scores a gift, a sixtieth apart (registry.ts checks 15 * 4 + 1). 61^17 is far
    // past the safe-integer limit, so makeCodec hands this quiz the wide (BigInt) codec.
    radix: 61,
    // Named from 75 up, as before the weights: net agreement worth half of everything a gift's
    // three statements can give. Agreeing with every statement scores 62 on every gift, and
    // strongly agreeing with every one 73, so neither names anything. Every row named must
    // clear it itself.
    namingFloor: 24,
    // Level means the same number (2026-09-25): the numbers are printed now, and two rows a
    // point apart cannot be "level" beside two different numbers.
    tieSteps: 0
  },
  shareTitle: 'Where my answers pointed: spiritual gifts',
  codePrefix: 'SG',
  shortLinks: true,
  // Before 2026-09-25: nineteen gifts, three unweighted statements each (radix 13). Those
  // codes are sixteen characters and today's twenty-two, so the two cannot be confused; an
  // old link, short link or saved result opens with tongues and interpreting dropped.
  legacyCodes: [{
    prefix: 'SG',
    radix: 13,
    keys: [
      'serving', 'teaching', 'encouraging', 'giving', 'healing', 'leading', 'mercy', 'knowledge',
      'administration', 'wisdom', 'miracles', 'discernment', 'faith', 'prophecy', 'evangelism',
      'shepherding', 'tongues', 'hospitality', 'interpretation'
    ]
  }],
  // The big letters are the gift ("Evangelism and the word of knowledge"), with "Your answers
  // pointed most to" above them, on the page, its title, the share text and /me/ (leadFor).
  headlineLeadsWithOutcome: true,
  // Each row opens to its gift's short answer, as the sins' rows do.
  rankRowsOpen: true,

  /**
   * The honest frame, in the engine's generic slots: the intro before a reader starts, the
   * line above the answer scale, the result under the ranking, the low-row sentence wherever
   * a gift comes out below, the disagreement with a link to the Compass axis that sets it
   * out, and what is not scored at all.
   */
  notes: {
    intro: giftsFrame.intro,
    introShort: giftsFrame.introShort,
    scale: giftsFrame.scale,
    result: giftsFrame.result,
    low: giftsFrame.low,
    disputed: {
      text: giftsFrame.disputed,
      linkText: giftsFrame.disputedLink,
      // Built from the axis's SLUG through the URL builder. The Compass's Gifts axis is
      // keyed `spirit` and published at /gifts/, so a href written from the key would 404.
      href: giftsAxisHref
    }
    // No `omitted`: the owner had the "Not scored here" paragraph taken off the quiz page and the
    // result (2026-09-24). giftsFrame.notScored keeps the words, and the three still go unscored.
  },

  // No sentence travels with the disputed gifts' names any more (the owner, 2026-09-26: it
  // stood at the top of the result, and the disagreement is already said once, in "How to read
  // this result"). notes.disputed carries it there.
  /**
   * The strategy's own words were written for VICES. "Leaned away" beside "Be hospitable to
   * one another" reads as a verdict on the reader, and a bare one-word headline reads as
   * one too, so this quiz supplies its own; the seven-deadly-sins draft keeps the defaults.
   */
  unipolarCopy: {
    strength: {
      // Short enough to sit on one line beside the name on a phone, and about the
      // INSTRUMENT rather than the reader: what these statements found, not what you are.
      below: 'not found here',
      level: 'nothing either way',
      // Not "the most here": the top word prints at 92 AND 100, so two rows could both
      // claim a rank. These are levels, and the words must be levels too.
      above: ['a little', 'some of this', 'a lot of this', 'nearly all of this']
    },
    headlineLead: giftsFrame.headlineLead,
    flat: giftsFrame.flat,
    // Two names at most in the big letters; a crowd level with them is counted and listed.
    headlineMost: 2,
    // Each row's number beside its words: the owner asked for numbers that rarely tie.
    showNumbers: true,
    // The top three only. The bottom of a gifts ranking is the part a reader would least
    // want pasted into a group chat, and the caveat that travels with a low row on the page
    // cannot travel with a bar in a text message.
    shareTop: 3
  }
};
