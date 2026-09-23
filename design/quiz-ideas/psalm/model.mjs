// Draft 5 of the Psalm quiz: generic, uniform questions; the specific situation emerges from the combination.
// The owner (2026-09-23) on draft 2: question 1 funnels into a negative answer; answers feel scattered and random
// rather than running evenly from negative through neutral to positive; some options are hyper-specific boxes.
// "The answers should be sneakier and more generic so they apply to more people, while still actually fitting the
// end result, even if we need a few more questions/answers to narrow it down."
// Draft 3 did that; draft 4 is draft 3 after 48 simulated people took it (people-test-1.json): 35/48 said yes to
// the first line, 43/48 within three, but the in-between band managed only 4/14, and people kept reaching for words
// the options did not have (ashamed, anxious, lonely, hurt, bitter, unsure; "I've drifted"; "I'm not sure He's
// there"; "Show me the way"; "Something hard just happened"). Feel and people now take up to two picks.
//
// Shape: seven CORE questions everyone answers (each ordered hard -> neutral -> good), then FOLLOW-UPS asked only
// when an earlier answer calls for them. Each outcome is one situation Athanasius named (texts from draft 2's
// tree.json, checked against his Greek, plus the additions below, each with its TLG line). An outcome is ELIGIBLE
// only when the answers meet its `need` (his defining condition; alternatives allowed) and eligible outcomes are
// RANKED by need facets (2 points each) plus like facets (1 point each). The person confirms at "Does this sound
// like you?"; "Not quite" offers the next; after three refusals the honest page says the letter doesn't name it.
//
// node design/quiz-ideas/psalm/model.mjs  -> writes quiz.json beside it.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const v2 = JSON.parse(readFileSync(resolve(here, 'tree.json'), 'utf8'));

const core = [
  { id: 'season', q: 'How would you sum up this stretch of your life?', options: [
    ['vhard', 'Really hard'], ['hard', "Hard, but I'm getting by"], ['mixed', 'Up and down'],
    ['inside', 'Fine on the outside, not on the inside'], ['busy', 'Busy, but fine'], ['ordinary', 'Quiet and ordinary'],
    ['good', 'Good'], ['vgood', 'Really good']] },
  { id: 'trend', q: 'And lately?', options: [
    ['worse', 'Getting worse'], ['sudden', 'Something hard just happened'], ['same', 'About the same'],
    ['better', 'Getting better'], ['over', 'Something hard is finally over'], ['new', 'Something new is starting']] },
  { id: 'feel', q: 'Pick the words that fit you best right now.', max: 2, words: true, options: [
    ['afraid', 'Afraid'], ['anxious', 'Anxious'], ['heavy', 'Sad'], ['lonely', 'Lonely'], ['hurt', 'Hurt'],
    ['ashamed', 'Ashamed'], ['angry', 'Angry'], ['bitter', 'Bitter'], ['tired', 'Worn out'], ['numb', 'Numb'],
    ['restless', 'Restless'], ['unsure', 'Unsure'], ['curious', 'Curious'], ['calm', 'At peace'],
    ['hopeful', 'Hopeful'], ['grateful', 'Grateful'], ['happy', 'Happy']] },
  { id: 'focus', q: "What's been on your mind the most?", options: [
    ['people', 'People in my life'], ['self', "Something I've done"], ['body', 'My health'],
    ['work', 'Work or school'], ['money', 'Money'], ['future', "What's next for me"],
    ['loved', 'Someone I love'], ['loss', "Someone or something I've lost"], ['world', 'The way the world is'],
    ['god', 'God, and my faith'], ['nothing', 'Nothing in particular']] },
  { id: 'people', q: 'How have the people around you been lately?', max: 2, options: [
    ['against', 'Against me'], ['one', 'One person has turned on me'], ['talking', 'Talking about me'],
    ['mocking', 'Making fun of me'], ['upset', 'Upset with me, and with reason'], ['hard', 'Hard to be around'],
    ['gone', 'Far away, or gone'], ['fine', 'Fine'], ['kind', 'Kind to me'], ['gift', 'A real gift']] },
  { id: 'god', q: 'And God, right now, feels…', options: [
    ['far', 'Far away'], ['displeased', 'Displeased with me'], ['silent', 'Silent. I pray and nothing changes'],
    ['doubt', "I'm not sure He's there"], ['drift', "I've drifted from Him"], ['background', 'Just there, in the background'],
    ['quiet', 'Near, but quiet'], ['close', 'Close'], ['working', 'Clearly at work']] },
  { id: 'say', q: 'If you could say one thing to Him right now, it would be…', short: true, options: [
    ['howlong', 'How long?'], ['why', 'Why?'], ['help', 'Help.'], ['tired', "I'm so tired."], ['sorry', "I'm sorry."],
    ['clear', 'Clear my name.'], ['unfair', "It isn't fair."], ['nothing', 'Nothing, really.'], ['there', 'Are You there?'], ['stay', 'Stay with me.'],
    ['miss', 'I miss You.'], ['way', 'Show me the way.'], ['become', 'Make me who You want me to be.'],
    ['thanks', 'Thank You.'], ['praise', 'How great You are.']] }
];

const TROUBLE = ['against', 'one', 'talking', 'mocking'];
const follow = [
  { id: 'who', q: 'Who are they, mostly?', when: [{ people: TROUBLE }, { ended: ['people'] }], options: [
    ['family', 'Family, or the people closest to me'], ['friends', 'Friends, or people I trusted'],
    ['work', 'People at work or school'], ['boss', 'People with power over me'],
    ['crowd', 'A whole group of people'], ['strangers', 'People I barely know'], ['danger', 'People who could really hurt me']] },
  { id: 'faith', q: 'Is your faith part of it?', when: [{ people: TROUBLE }], options: [
    ['yes', "Yes, it's because of what I believe"], ['partly', 'Partly'], ['no', 'No']] },
  { id: 'what', q: "What's the hardest part?", when: [{ people: TROUBLE }], options: [
    ['words', "What they're saying about me"], ['plans', 'What they might be planning'],
    ['fear', "Not knowing what they'll do next"], ['cornered', 'Feeling trapped'], ['doubt', 'That they might be right'],
    ['drags', "That it won't stop"], ['growing', 'That it keeps growing'], ['pushed', 'Being pushed out']] },
  { id: 'self', q: "What's weighing on you most?", when: [{ focus: ['self'] }, { say: ['sorry'] }, { god: ['displeased'] }, { people: ['upset'] }, { feel: ['ashamed'] }], options: [
    ['did', 'Something I did wrong'], ['mistake', 'A mistake I made'], ['habit', 'Something I keep going back to'], ['thoughts', 'Where my thoughts have taken me'],
    ['trying', 'Trying to change, and finding it harder'], ['warned', 'A sense that God is warning me'],
    ['none', "It's not something I did. I just feel it."]] },
  { id: 'world', q: 'What gets to you most?', when: [{ focus: ['world'] }, { say: ['unfair'] }], options: [
    ['prosper', 'Bad people doing well'], ['bully', 'The strong pushing the weak around'],
    ['nogood', 'How little goodness is left'], ['mock', 'People mocking God'],
    ['persecuted', 'Christians suffering for their faith'], ['personal', 'Something that happened to me']] },
  { id: 'loved', q: "What's happening with them?", when: [{ focus: ['loved'] }], options: [
    ['comfort', "They're suffering, and I want to be there for them"], ['danger', "They're ill, or in danger"],
    ['need', "They're in need"], ['losing', "I'm losing them"], ['mending', "We're finding our way back to each other"], ['newlife', "They're new in my life"],
    ['well', "They're doing well, and I'm thankful"]] },
  { id: 'ended', q: 'What was it?', when: [{ trend: ['over'] }], options: [
    ['people', 'People who were against me'], ['trouble', 'Trouble on every side'], ['sick', 'An illness, or a scare'],
    ['wait', 'A long wait'], ['rift', 'A falling-out'], ['test', 'A real test of my faith'],
    ['god', 'A time God felt against me'], ['self', "Something I'd done"]] },
  { id: 'how', q: 'How did it end?', when: [{ trend: ['over'] }], options: [
    ['answered', 'I prayed, and He answered'], ['rescued', 'He got me out'], ['wits', 'I kept my head and got away'],
    ['refuge', 'I ran to Him, and He kept me safe'], ['settled', 'I left it with Him, and He set it right'],
    ['peace', 'We made peace'], ['mercy', 'He corrected me, gently'], ['passed', 'It just passed']] },
  { id: 'good', q: "What's behind the good?", when: [
      { season: ['good', 'vgood'], trend: ['worse', 'sudden', 'same', 'better', 'new'] },
      { feel: ['grateful', 'happy', 'hopeful'], trend: ['worse', 'sudden', 'same', 'better', 'new'] },
      { trend: ['new'] }], options: [
    ['led', 'I can see Him leading me'], ['beauty', 'How good and well-made everything is'],
    ['kind', 'His kindness, to me and to everyone'], ['answered', 'An answered prayer'],
    ['growing', "I'm growing"], ['home', 'A new home, or a new family'], ['faith', 'Coming to faith, mine or someone else\'s'],
    ['back', 'Coming back to Him'], ['chapter', 'A chapter ending well'], ['all', 'Everything, really'],
    ['unsure', "I'm not sure yet"]] }
];

// need: an object (all facets must match) or an array of such objects (any one will do).
const rules = {
  P3:   { need: { who: ['family'], people: ['against', 'talking', 'one'] }, like: { what: ['growing'], trend: ['worse'], feel: ['hurt', 'heavy', 'afraid'], say: ['help', 'why'] } },
  P55:  { need: { who: ['friends'], people: ['talking', 'one', 'against'] }, like: { what: ['words'], feel: ['hurt', 'heavy'] } },
  P31:  { need: { who: ['family', 'friends'], faith: ['yes'] }, like: { people: ['against', 'mocking'], feel: ['lonely', 'hurt'] } },
  P42:  { need: { faith: ['yes', 'partly'], people: ['mocking', 'against', 'talking'] }, like: { say: ['miss', 'there'], god: ['far', 'doubt', 'silent'] } },
  P52:  { need: { who: ['boss'], what: ['words'] }, like: { feel: ['angry', 'hurt'], say: ['clear'] } },
  P54:  { need: { who: ['boss', 'work'], what: ['plans'] }, like: { feel: ['afraid', 'anxious'] } },
  P7:   { need: { what: ['plans'] }, like: { trend: ['worse', 'sudden'], who: ['friends', 'crowd', 'work'] } },
  P11:  { need: { what: ['fear'] }, like: { people: ['one'], feel: ['afraid', 'anxious'], say: ['help'] } },
  P64:  { need: { what: ['fear'] }, like: { who: ['crowd', 'work', 'strangers', 'danger'], feel: ['afraid'] } },
  P57:  { need: { what: ['cornered'] }, like: { feel: ['afraid'], say: ['help'], who: ['danger'] } },
  P27:  { need: { what: ['growing'] }, like: { who: ['crowd', 'boss', 'work'], trend: ['worse'], feel: ['afraid'] } },
  P63:  { need: { what: ['pushed'] }, like: { people: ['gone'], feel: ['lonely', 'afraid'] } },
  P13:  { need: [{ what: ['drags'], god: ['far', 'silent', 'doubt'] }, { what: ['drags'], say: ['howlong', 'why', 'there'] }], like: { god: ['far', 'silent'], say: ['howlong'], trend: ['same'] } },
  P26:  { need: { people: ['against', 'one', 'talking'], say: ['clear'] }, like: { feel: ['angry', 'bitter', 'hurt'], what: ['words', 'drags'] } },
  P28:  { need: { people: ['against', 'one', 'talking'], feel: ['restless', 'bitter'] }, like: { what: ['drags', 'words'] } },
  P40:  { need: { people: ['against', 'one'], what: ['drags'] }, like: { feel: ['tired'], say: ['howlong', 'stay', 'tired'], god: ['quiet', 'close'] } },
  P62:  { need: { people: ['against', 'one'], feel: ['calm'] }, like: { god: ['quiet', 'close'] } },
  P51:  { need: { self: ['did', 'habit'] }, like: { say: ['sorry'], god: ['displeased'], feel: ['ashamed', 'heavy'] } },
  P6:   { need: [{ god: ['displeased'] }, { self: ['warned'] }], like: { self: ['warned'], feel: ['afraid', 'anxious'], say: ['sorry', 'help'] } },
  P137: { need: { self: ['thoughts'] }, like: { say: ['sorry'], feel: ['ashamed'] } },
  P39:  { need: { self: ['trying'] }, like: { feel: ['restless', 'tired'] } },
  P73S: { need: [{ god: ['doubt'], feel: ['unsure', 'afraid', 'anxious'] }, { god: ['doubt'], say: ['there', 'why'] }, { what: ['doubt'] }, { self: ['habit'], say: ['help'] }], like: { focus: ['god'], say: ['there', 'why'], feel: ['unsure', 'afraid', 'anxious'] } },
  P102: { need: { feel: ['tired', 'numb'], season: ['vhard', 'hard', 'mixed', 'inside'] }, like: { focus: ['work', 'money', 'body', 'nothing', 'loss'], say: ['tired', 'help'], season: ['vhard', 'hard', 'inside'] } },
  P42S: { need: { feel: ['heavy', 'anxious', 'lonely', 'hurt', 'restless'] }, like: { focus: ['loss', 'body', 'nothing', 'future', 'loved'], god: ['far', 'silent'], season: ['inside'] } },
  P118: { need: { feel: ['afraid'] }, like: { god: ['far', 'silent', 'displeased'], say: ['help', 'stay'] } },
  P91:  { need: { feel: ['afraid', 'anxious'], god: ['close', 'quiet', 'working'] }, like: { say: ['thanks', 'praise', 'stay'], feel: ['hopeful'] } },
  P84:  { need: [{ say: ['miss'], god: ['far', 'silent', 'quiet'] }, { focus: ['god'], god: ['far'] }], like: { god: ['far', 'quiet', 'silent', 'drift'], people: ['fine', 'kind'] } },
  P103D:{ need: { god: ['drift', 'background'] }, like: { say: ['miss', 'thanks', 'become'], season: ['busy', 'ordinary', 'good', 'mixed'], feel: ['calm', 'numb', 'restless'] } },
  P143W:{ need: { say: ['way'] }, like: { focus: ['future', 'work', 'money', 'loved'], feel: ['unsure', 'anxious'] } },
  P73:  { need: { world: ['prosper'] }, like: { say: ['unfair', 'why'], feel: ['angry', 'bitter'] } },
  P37:  { need: { world: ['bully'] }, like: { feel: ['angry', 'bitter'] } },
  P12:  { need: { world: ['nogood'] }, like: { feel: ['heavy'] } },
  P14:  { need: [{ world: ['mock'] }, { people: ['mocking'], god: ['doubt'] }, { what: ['doubt'] }], like: { feel: ['unsure'] } },
  P79:  { need: { world: ['persecuted'] }, like: { feel: ['heavy', 'angry', 'hurt'] } },
  P20:  { need: { loved: ['comfort'] }, like: {} },
  P5:   { need: { loved: ['danger'] }, like: { say: ['help'], feel: ['afraid', 'anxious'] } },
  P41:  { need: { loved: ['need'] }, like: {} },
  P4:   { need: { ended: ['people'], how: ['answered'], who: ['family'] }, like: { say: ['thanks'] } },
  P18:  { need: { ended: ['people'], how: ['rescued', 'settled'] }, like: { say: ['thanks'] } },
  P34:  { need: { ended: ['people'], how: ['wits'] }, like: { say: ['thanks'] } },
  P46:  { need: [{ ended: ['trouble', 'sick', 'wait'] }, { how: ['refuge'] }], like: { say: ['thanks', 'praise'], how: ['answered', 'refuge'] } },
  P139: { need: { ended: ['test'] }, like: { say: ['thanks'] } },
  P85:  { need: { ended: ['god'] }, like: { how: ['passed'], say: ['thanks'] } },
  P101: { need: [{ how: ['mercy'] }, { ended: ['self'] }, { good: ['back'] }], like: { say: ['thanks'] } },
  P23:  { need: { good: ['led'] }, like: { god: ['close', 'working'] } },
  P19:  { need: [{ good: ['beauty'] }, { feel: ['curious'], focus: ['world', 'god', 'nothing'] }], like: { say: ['praise'], feel: ['curious'] } },
  P103: { need: [{ good: ['all', 'chapter'] }, { loved: ['well', 'mending'] }, { how: ['peace'] }, { ended: ['rift'] }, { say: ['thanks'] }], like: { feel: ['grateful'], season: ['ordinary', 'busy', 'mixed', 'good', 'vgood'] } },
  P145: { need: [{ good: ['kind', 'answered'] }], like: { say: ['praise', 'thanks'] } },
  P120: { need: { good: ['growing'] }, like: { trend: ['better', 'new'] } },
  P30:  { need: [{ good: ['home'] }, { loved: ['newlife'] }], like: {} },
  P32:  { need: { good: ['faith'] }, like: { say: ['thanks', 'praise'] } },
  P93:  { need: { say: ['praise'] }, like: { feel: ['happy'] } },
  P15:  { need: { say: ['become'] }, like: { season: ['ordinary', 'good', 'mixed', 'busy'], trend: ['same', 'better', 'new'] } }
};

// Situations draft 2 did not use, or used in another way, each read in the Greek (research.json recon.entries; TLG line).
const added = {
  P79: { psalm: 79, also: [], sec: '21', seen: "Christians are being killed and their churches destroyed, and it's tearing at you.",
    reason: "When enemies break in, defile God's house, kill His saints and leave their bodies to the birds, don't let their cruelty cow you. Suffer with those who suffer, and plead with God in the words of Psalm 79.",
    names: '79:1', turn: '79:9', hard: '79:6', greek: '[00415]' },
  P93: { psalm: 93, also: [98], sec: '25', seen: 'You just want to sing to God.',
    reason: 'When you simply want to sing to the Lord, you have Psalms 93 and 98.', names: '93:1', turn: null, greek: '[00486]-[00487]' },
  P15: { psalm: 15, also: [], sec: '16', seen: 'You want to become the kind of person who belongs with God.',
    reason: 'When you want to learn what kind of person is a citizen of the kingdom of heaven, sing Psalm 15.', names: '15:1', turn: null, greek: '[00340]' },
  P73S: { psalm: 73, also: [], sec: '28', seen: "You've come close to losing your footing, and you're honest enough to admit it.",
    reason: "Sing the Psalms, and whatever in you has slipped comes to admit it, as you say with Psalm 73: \"my feet had almost stumbled; my steps had nearly slipped.\"",
    names: '73:2', turn: '73:23', greek: '[00547]-[00548]' },
  P103D: { psalm: 103, also: [104], sec: '24', seen: 'God has slipped into the background, and you want to wake your soul up to Him again.',
    reason: 'Because we ought to give thanks to God through everything and in everything, when you want to bless Him you can stir up your own soul with Psalms 103 and 104: "Bless the LORD, O my soul."',
    names: '103:1', turn: '103:2', greek: '[00463]' },
  P143W: { psalm: 143, also: [5], sec: '25', seen: "There's something you can't work out on your own, and you want to lay it before God.",
    reason: 'When you want to plead with God and pray, you have Psalms 5 and 143.', names: '143:8', turn: '143:10', greek: '[00481]-[00482]' }
};

// Seen lines reworded after the people test, where the situation is unchanged but the words missed people.
const reseen = {
  P42S: 'Something in you is weighed down or uneasy, and it won\'t settle.',
  P102: 'Life has worn you down until you feel empty and listless, and you need comfort.',
  P30: 'Something new has begun in your home, and you want to give it, and yourself, to God with thanks.',
  P32: "You've seen someone made new, maybe yourself, and you're amazed at how much God loves us.",
  P46: 'You ran to God, He brought you through, and you want to tell people what He did.'
};

const outcomes = {};
for (const [id, r] of Object.entries(rules)) {
  const text = added[id] || v2.outcomes[id];
  if (!text) throw new Error(`no text for ${id}`);
  outcomes[id] = { ...text, ...(reseen[id] ? { seen: reseen[id] } : {}), need: Array.isArray(r.need) ? r.need : [r.need], like: r.like };
}
const unused = Object.keys(v2.outcomes).filter(id => !rules[id]);

const notes = {
  body: "Athanasius wrote this letter to a friend who was just getting over an illness, but he names no psalm for sickness itself. He does name one for what it is doing to you.",
  loss: "Athanasius names no psalm for a death or for something ending. He does name one for what grief does to you."
};
const none = {
  lead: "Athanasius's letter doesn't name what you're going through, and we won't pretend it does. But he does name psalms for what it's doing to you.",
  options: [['P102', "It's grinding me down."], ['P42S', "It's weighing on me, or it won't let me settle."], ['P118', "It's making me afraid."], ['P143W', 'I need to bring it to God, and I don\'t know how.']]
};

// Points per NEED facet met: a direct follow-up answer, or the one sentence a person would say to God, is a stronger
// signal than a broad feeling word; people test 2 put the broad matches (Psalms 42, 102, 118) first too often.
const weights = { default: 2, say: 3, who: 3, faith: 3, what: 3, self: 3, world: 4, loved: 4, ended: 4, how: 3, good: 4 };

// Lines people in test 2 said could wound, with a quiet note shown under the psalm. `when` limits a note to people
// whose answers make the line a risk (a promise of life read by someone watching a loved one die).
const lineNotes = {
  P102: { ref: '102:10', text: "These are the psalmist's words from inside his distress. The psalm does not say your exhaustion is God's anger; it turns, a few lines on, to the God who will not despise the prayer of the destitute." },
  P118: { ref: '118:17', when: { focus: ['body', 'loved', 'loss'] }, text: 'This is thanksgiving from someone who was rescued. It is a song to sing with him, not a promise about how your own story ends.' },
  P91: { ref: '91:10', when: { focus: ['body', 'loved', 'loss'] }, text: 'Athanasius gave this psalm for taking heart and becoming unafraid, not as a promise that nothing will ever go wrong.' }
};
for (const [id, n] of Object.entries(lineNotes)) outcomes[id].lineNote = n;

// The one result written out in full, Psalm 3 (the preview's "See a finished result"). Quotations are checked verbatim
// against the BSB by site/scripts/build-data.mjs, which refuses to write the site's copy if one has drifted.
const full = {
  P3: {
    story: [
      { t: "The heading puts it in David's worst days. His son Absalom had spent years winning the people over, until " },
      { q: 'the conspiracy gained strength, and Absalom’s following kept increasing', ref: '2 Samuel 15:12' },
      { t: '. David left Jerusalem on foot, ' },
      { q: 'weeping as he went up. His head was covered, and he was walking barefoot', ref: '2 Samuel 15:30' },
      { t: '. The psalm opens on that same word: how my foes have increased.' }
    ],
    own: 'Athanasius adds that people sing this psalm with their own troubles in view, and find its words are their own (§12).',
    night: '3:5'
  }
};
const quotes = {
  '2 Samuel 15:12': 'While Absalom was offering the sacrifices, he sent for Ahithophel the Gilonite, David’s counselor, to come from his hometown of Giloh. So the conspiracy gained strength, and Absalom’s following kept increasing.',
  '2 Samuel 15:30': 'But David continued up the Mount of Olives, weeping as he went up. His head was covered, and he was walking barefoot. And all the people with him covered their heads and went up, weeping as they went.'
};
for (const part of full.P3.story) if (part.q && !quotes[part.ref].includes(part.q)) throw new Error(`not verbatim: ${part.ref}`);

writeFileSync(resolve(here, 'quiz.json'), JSON.stringify({ draft: 5, weights, core, follow, outcomes, notes, none, full, unused }, null, 1));
console.log('quiz.json: draft 5,', core.length, 'core questions,', follow.length, 'follow-ups,', Object.keys(outcomes).length, 'outcomes; unused from draft 2:', unused.join(', ') || 'none');
