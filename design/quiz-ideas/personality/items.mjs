// The Personality Quiz: every question, written by the main session from the sources (2026-09-23).
// Source of truth for the questions. results.mjs holds the result text; score.mjs scores; model.mjs builds quiz.json.
//
// FORMAT. Almost every item is two-sided: side A and side B are two real ways of being, each with a cost, and the
// person answers on 7 points (-3 = very much A ... 0 = both or neither ... +3 = very much B). `a` names the pole that
// side A belongs to, so A is not always the left pole (position bias). Two items (body) are "pick up to two".
//
// RULES the items keep: plain everyday words; nothing that points at Scripture or faith (except the two Body items,
// which ask what work draws you); both sides something a decent person would own; each side taken from what the
// source says that kind of person does or feels. `src` names the source for the maintainers, never shown to readers.

// ---------------------------------------------------------------------------------------------------------------
// SCALES. Every scale runs from its left pole (-1) to its right pole (+1).
// ---------------------------------------------------------------------------------------------------------------
export const SCALES = {
  // The three that decide the type (4 questions each). `mood` is also the eighteenth leaning.
  mood:     { left: 'Light-hearted', right: 'Heavy-hearted', group: 'type', label: 'Mood',
              src: 'Moralia XXIX.45 (cheerful / morose); Pastoral Rule III.3; Nazianzen Or. 2.28 (sanguine / despondent)' },
  nerve:    { left: 'Confident', right: 'Careful', group: 'type', label: 'Nerve',
              src: 'Moralia XXIX.45 (proud / timid); Pastoral Rule III.36; Nazianzen Or. 2.28 (courageous / cowardly)' },
  makeup:   { left: 'Restless mind', right: 'Quiet mind', group: 'type', label: 'Make-up',
              src: 'Moralia VI.57-58 (restless / tranquil compositions of souls)' },

  // The other seventeen leanings (2 questions each). Grouped for the report.
  talk:     { left: 'Speaks up', right: 'Keeps it in', group: 'speak', label: 'Talk', src: 'Pastoral Rule III.14; Moralia VII.57-61' },
  candour:  { left: 'Says it plainly', right: 'Chooses what to show', group: 'speak', label: 'Candour', src: 'Pastoral Rule III.11; Moralia X.48, I.2' },
  wronged:  { left: 'Lets them know', right: 'Lets it go', group: 'wronged', label: 'When wronged', src: 'Pastoral Rule III.9; Moralia V.79-81' },
  temper:   { left: 'Fiery', right: 'Gentle', group: 'wronged', label: 'Temper', src: 'Pastoral Rule III.16; Moralia XXXII.45, V.82-83' },
  strife:   { left: 'Takes a stand', right: 'Keeps the peace', group: 'wronged', label: 'Disagreements', src: 'Pastoral Rule III.22-23; Moralia XXXII.45' },
  pace:     { left: 'Rushes in', right: 'Puts it off', group: 'work', label: 'Pace', src: 'Pastoral Rule III.15, II.9; Nazianzen Or. 2.30; Moralia XXXII.45' },
  through:  { left: 'Hard to start', right: 'Hard to finish', group: 'work', label: 'Follow-through', src: 'Pastoral Rule III.34; Moralia XXX.51' },
  small:    { left: 'Careful with little things', right: 'Easy on little things', group: 'work', label: 'Little things', src: 'Pastoral Rule III.33; Moralia XXXI.87, XXXIV.45' },
  work:     { left: 'Sure of your work', right: 'Hard on yourself', group: 'self', label: 'Your own work', src: 'Pastoral Rule III.8; Nazianzen Or. 2.32; Moralia XXXI.59' },
  critic:   { left: 'Say it straight', right: 'A hint is enough', group: 'self', label: 'Correction', src: 'Pastoral Rule III.7; Nazianzen Or. 2.31; Moralia II.28' },
  room:     { left: 'Takes up room', right: 'Makes yourself small', group: 'self', label: 'Room', src: 'Pastoral Rule III.17; Moralia XXXIV.51-52' },
  mind:     { left: 'Holds firm', right: 'Easily swayed', group: 'self', label: 'Your mind', src: 'Pastoral Rule III.18; Moralia XXXII.45-46' },
  wins:     { left: 'Simply glad', right: 'Feels the sting', group: 'others', label: "Others' wins", src: 'Pastoral Rule III.10; Moralia V.84-86' },
  seen:     { left: 'Better in public', right: 'Better in private', group: 'others', label: 'Seen and unseen', src: 'Pastoral Rule III.35; Chrysostom, On the Priesthood III.14, V.4' },
  after:    { left: 'Dwells on a mistake', right: 'Moves on', group: 'others', label: 'After a mistake', src: 'Pastoral Rule III.29-30; Moralia X.28, XXXI.93' },
  having:   { left: 'Open-handed', right: 'Careful with what you have', group: 'having', label: 'Having', src: 'Pastoral Rule III.20-21; Moralia XV.30, XXXII.45; Cassian Inst. VII.7' },
  comforts: { left: 'Enjoys comforts', right: 'Keeps a tight rein', group: 'having', label: 'Comforts', src: 'Pastoral Rule III.19; Moralia XXX.60, XXIX.45' },

  // The two grids (1 question per axis).
  catch:    { left: 'Catches fast', right: 'Catches slowly', group: 'anger', label: 'How fast anger comes', src: 'Moralia V.80' },
  hold:     { left: 'Lets go fast', right: 'Holds on', group: 'anger', label: 'How long anger stays', src: 'Moralia V.80; Cassian Conf. 5.11' },
  ease:     { left: 'Words come easily', right: 'Words come hard', group: 'speaker', label: 'Words', src: 'Moralia VIII.58' },
  weight:   { left: 'Speaks, then thinks', right: 'Thinks, then speaks', group: 'speaker', label: 'Thought', src: 'Moralia VIII.58, III.23' },

  // What helps you (1 question each). These feed the help card.
  h_show:   { left: 'Explain why', right: 'Show me', group: 'help', src: 'Nazianzen Or. 2.30 (led by doctrine / trained by example); Pastoral Rule III.6' },
  h_spur:   { left: 'Push me', right: 'Slow me down', group: 'help', src: 'Nazianzen Or. 2.30 (the spur / the curb)' },
  h_praise: { left: 'Tell me I did well', right: 'Tell me I can do better', group: 'help', src: 'Nazianzen Or. 2.31 (praise / blame)' },
  h_watch:  { left: 'Point out everything', right: 'Pick the one thing', group: 'help', src: 'Nazianzen Or. 2.32 (close watch / seeing not to see)' },
  h_public: { left: 'Hear it from a few people', right: 'Hear it in private', group: 'help', src: 'Nazianzen Or. 2.31 (public / private correction); Pastoral Rule III.7' },
  h_win:    { left: 'Win the argument', right: 'Give me time', group: 'help', src: 'Nazianzen Or. 2.32 (some to conquer, by others to be overcome)' },
  h_ask:    { left: 'Tell me plainly', right: 'Ask for my help', group: 'help', src: 'Pastoral Rule III.17 (Moses and Hobab: the proud moved by being asked)' },
};

// The eight thoughts (Cassian's order). Scored from twelve head-to-head questions: each thought meets three others,
// so the page can say which "holds the chief place" now (Cassian Conf. 5.13-14), plus small signals from the leanings.
export const THOUGHTS = ['gluttony', 'lust', 'greed', 'anger', 'sadness', 'listlessness', 'vainglory', 'pride'];

// Cassian's lines of the practical life (Conference 14.4), for "your line in the Body".
export const LINES = ['watcher', 'shepherd', 'host', 'caregiver', 'advocate', 'teacher', 'giver'];

// ---------------------------------------------------------------------------------------------------------------
// THE QUESTIONS, in the order they are asked. Layers are spread through the quiz; the pairs that decide the type
// come early (people answer more carefully at the start). Seventy-two in all.
// ---------------------------------------------------------------------------------------------------------------
const I = [];
const q = (id, scale, a, stem, A, B, src, extra = {}) => I.push({ id, kind: 'two', scale, a, stem, A, B, src, ...extra });

// Opening block: the type, then the easiest everyday pairs.
q('k1', 'makeup', 'Restless mind', 'A weekend with nothing planned feels…',
  '…restless. I’ll have found something to do by noon.', '…like a gift.', 'Moralia VI.57: the restless "have only the worse labour" at rest');
q('m1', 'mood', 'Light-hearted', 'On an ordinary day, your mood is…',
  '…on the light side.', '…on the serious side.', 'Pastoral Rule III.3: joyful or sad "by temperament"');
q('n1', 'nerve', 'Confident', 'Before something new and big, you mostly think about…',
  '…how well it could go.', '…what could go wrong.', 'Moralia XXX.51: the fearful "place many things before their eyes"; XXIX.45');
q('t1', 'talk', 'Speaks up', 'In a group, you’re usually…',
  '…one of the people doing the talking.', '…one of the people doing the listening.', 'Pastoral Rule III.14');
q('w1', 'wronged', 'Lets them know', 'Someone is rude to you. In the moment, you…',
  '…let them know.', '…let it go.', 'Pastoral Rule III.9');
q('p1', 'pace', 'Rushes in', 'Looking back, more of your regrets are about…',
  '…things I rushed into.', '…things I never got round to.', 'Pastoral Rule III.15: the hasty see afterwards; the slothful put off');
q('wk1', 'work', 'Sure of your work', 'You’ve just finished something you worked hard on. Your first thought is…',
  '“That’s pretty good.”', '“It’s not good enough.”', 'Pastoral Rule III.8: "singularly eminent" / "exceedingly despised"');
q('k2', 'makeup', 'Quiet mind', 'When work suddenly piles up, you…',
  '…feel buried before I’ve even started.', '…come alive. I like being busy.', 'Moralia VI.57: the tranquil "give way at the very beginning"');
q('s1', 'strife', 'Takes a stand', 'Friends start arguing about something that matters. You…',
  '…say where you stand.', '…try to calm things down.', 'Pastoral Rule III.22');
q('m2', 'mood', 'Heavy-hearted', 'The music you put on when you’re alone is usually…',
  '…slow and a little sad.', '…upbeat.', 'Moralia XXIX.45: a cheerful or a morose "character"');
q('c1', 'critic', 'Say it straight', 'Which is more like you?',
  'I don’t always notice I’ve upset someone until they tell me.', 'One raised eyebrow can stay with me all day.',
  'Pastoral Rule III.7: the impudent "do not know that they are in fault" unless rebuked by many');
q('n2', 'nerve', 'Careful', 'Which moves you more?',
  'The fear of letting people down.', 'The chance to shine.', 'Moralia XXIX.45: the timid "dread punishments"; the proud are "elated with praises"');
q('t2', 'talk', 'Keeps it in', 'Which is more like you?',
  'I have whole conversations in my head that never happen.', 'I work things out by saying them out loud.',
  'Moralia VII.59-60: much talk scatters the mind; over-silence makes "much talking in the heart"');
q('an1', 'catch', 'Catches fast', 'How quickly do you get angry?',
  'Fast. It flares up.', 'Slowly. It takes a lot.', 'Moralia V.80');
q('f1', 'temper', 'Fiery', 'When you see something done badly or unfairly, you…',
  '…feel the heat rise.', '…assume there’s a reason and give people room.', 'Pastoral Rule III.16');
q('he1', 'h_show', 'Explain why', 'When you’re learning something new, what works better?',
  'Explain why it works.', 'Show me someone doing it.', 'Nazianzen Or. 2.30; Pastoral Rule III.6');
q('wi1', 'wins', 'Simply glad', 'A friend pulls off something impressive. You feel…',
  '…nothing but glad for them.', '…glad for them, with a little sting.', 'Pastoral Rule III.10');

// Middle block.
q('k3', 'makeup', 'Restless mind', 'When you have nothing to do, your thoughts…',
  '…get worse. I’m better off busy.', '…settle. That’s when I think best.', 'Moralia VI.57: "worse tumults of mind" at rest');
q('r1', 'room', 'Takes up room', 'When you disagree with someone in charge, you…',
  '…tell them. Someone has to.', '…keep it to yourself. It’s not my place.',
  'Pastoral Rule III.17; Moralia XXXIV.51: silent "through fear" thought humility, speech "from the impatience of pride" thought freedom');
q('h1', 'through', 'Hard to start', 'When something doesn’t get done, it’s usually because…',
  '…I never got started.', '…I started and lost steam.', 'Pastoral Rule III.34');
q('w2', 'wronged', 'Lets it go', 'Which happens to you more?',
  'Hours later, I think of what I should have said.', 'I snap, and wish I hadn’t.',
  'Pastoral Rule III.9; Moralia V.79: anger "pent up within the heart from silence"');
q('ca1', 'candour', 'Says it plainly', 'You’ve made a mistake at work. You…',
  '…own it straight away, even if it costs me.', '…think carefully about how to put it first.', 'Pastoral Rule III.11 (the urchin rolling up)');
q('hv1', 'having', 'Careful with what you have', 'A friend asks to borrow money. Your gut says…',
  '“Let me think.” I need to know I’ll be okay.', '“Of course.” I’ll sort out my own needs later.',
  'Moralia XV.30: avarice "from apprehension"; Pastoral Rule III.20: over-giving, then want');
q('p2', 'pace', 'Puts it off', 'A decision needs making. You tend to…',
  '…wait until you’re sure, sometimes too long.', '…decide fast and fix it later.',
  'Pastoral Rule II.9: "tardiness for the deliberation of seriousness", "precipitate action ... for promptness"');
q('mi1', 'mind', 'Holds firm', 'Once you’ve made up your mind, you…',
  '…rarely change it.', '…can be talked out of it fairly easily.', 'Pastoral Rule III.18');
q('an2', 'hold', 'Holds on', 'Once you’re angry, how long does it last?',
  'A long time. It can last for days.', 'Not long. It’s gone in minutes.', 'Moralia V.80; Cassian Conf. 5.11');
q('se1', 'seen', 'Better in public', 'Who usually gets the best of you?',
  'People I’ve just met.', 'The people I live with.', 'Chrysostom, On the Priesthood III.14 (the athlete at home); Pastoral Rule III.35');
q('n3', 'nerve', 'Confident', 'You’re asked to take on a big new role. Your first thought is…',
  '“I can do that.”', '“What if I can’t?”', 'Pastoral Rule I.7 and Nazianzen Or. 2.114: Isaiah volunteers, Jeremiah pleads');
q('he2', 'h_spur', 'Slow me down', 'What do you need more from the people around you?',
  'Someone to slow me down.', 'A push to get going.', 'Nazianzen Or. 2.30');
q('cm1', 'comforts', 'Enjoys comforts', 'After a hard day, you’re more likely to…',
  '…treat yourself. You earned it.', '…hold back. You don’t want to go soft.', 'Pastoral Rule III.19');
q('af1', 'after', 'Dwells on a mistake', 'After you’ve done something wrong, you…',
  '…feel bad about it for a long time.', '…fix what you can and move on.', 'Pastoral Rule III.29-30');
q('sp1', 'ease', 'Words come easily', 'When you speak, the words…',
  '…come easily.', '…come hard, even when I know what I mean.', 'Moralia VIII.58');
q('sm1', 'small', 'Careful with little things', 'Which is more like you?',
  'I’m careful about small things, like being on time and keeping my word.', 'I let small things slide and save my care for big ones.',
  'Pastoral Rule III.33');
q('k4', 'makeup', 'Quiet mind', 'Which would wear you out faster?',
  'A week of back-to-back people and plans.', 'A week at home with nothing to do.', 'Moralia VI.57');
q('f2', 'temper', 'Gentle', 'Which is more like you?',
  'I let things slide that I probably shouldn’t.', 'My anger usually feels justified.',
  'Moralia XXXII.45: anger "believed to be" righteous zeal; remissness "regarded as gentleness"');
q('he3', 'h_praise', 'Tell me I did well', 'What makes you try harder?',
  'Being told I did well.', 'Being told I can do better.', 'Nazianzen Or. 2.31');
q('s2', 'strife', 'Keeps the peace', 'Which is harder for you?',
  'Telling a friend something they won’t want to hear.', 'Letting an argument go when I know I’m right.',
  'Pastoral Rule III.16, III.22');
q('wk2', 'work', 'Hard on yourself', 'When someone praises your work, you…',
  '…think they’re just being kind.', '…agree, quietly. I know it’s good.', 'Pastoral Rule III.8');

// Later block.
q('m3', 'mood', 'Light-hearted', 'When good news comes, you…',
  '…enjoy it straight away.', '…half wait for the catch.', 'Pastoral Rule III.3; Moralia XXIX.45');
q('ca2', 'candour', 'Chooses what to show', 'Which is more like you?',
  'I’m careful about what I let people see of me.', 'I say what I think, and sometimes at the wrong moment.',
  'Pastoral Rule III.11: the simple must learn "to be silent about what is true"; the insincere guard themselves');
q('c2', 'critic', 'A hint is enough', 'Someone needs to point out your mistake. What works better on you?',
  'Say it gently. I’ll get it the first time.', 'Say it straight. I can take it.',
  'Pastoral Rule III.7: "hard rebuke" for the impudent, "a modest exhortation" for the bashful');
q('mi2', 'mind', 'Easily swayed', 'When a friend thinks your plan is a mistake, you…',
  '…often end up changing it.', '…usually go ahead anyway.',
  'Pastoral Rule III.18: the fickle "undervalue" themselves; the obstinate "do not acquiesce in the counsels of others"');
q('he4', 'h_watch', 'Pick the one thing', 'When someone is helping you improve, which is better?',
  'Pick the one thing that matters most.', 'Point out everything. I’d rather know.',
  'Nazianzen Or. 2.32');
q('r2', 'room', 'Makes yourself small', 'In a new group, you…',
  '…stay near the edge until you’re sure you’re welcome.', '…find your place in the middle quickly.', 'Pastoral Rule III.17');
q('hv2', 'having', 'Open-handed', 'Which is more like you?',
  'I give on impulse, and sometimes regret it later.', 'I keep a little back, just in case.',
  'Pastoral Rule III.20-21; Cassian Inst. VII.7');
q('wi2', 'wins', 'Feels the sting', 'Which is more like you?',
  'I notice quickly when someone is doing better than me.', 'I admire lots of people I never try to be like.',
  'Moralia V.84: we envy only those we think better; Pastoral Rule III.10: "eager backers, but inert spectators"');
q('sp2', 'weight', 'Thinks, then speaks', 'Which is more true of you?',
  'I rarely say anything I haven’t turned over first.', 'I sometimes say things before I’ve really thought them through.',
  'Moralia VIII.58, III.23');
q('h2', 'through', 'Hard to finish', 'Which is harder for you?',
  'The last ten percent.', 'The first step.', 'Pastoral Rule III.34');
q('se2', 'seen', 'Better in private', 'Which is more like you?',
  'I don’t much mind what people think, maybe too little.', 'I care what people think of me, maybe too much.',
  'Pastoral Rule III.35; Chrysostom, On the Priesthood V.4');
q('he5', 'h_public', 'Hear it in private', 'Someone needs to tell you that you got something wrong. What gets through to you?',
  'Hearing it from one person, in private.', 'Hearing it from a few people. One person’s opinion I can shrug off.',
  'Nazianzen Or. 2.31');
q('m4', 'mood', 'Heavy-hearted', 'Which is more like you?',
  'Most things stay with me for a while.', 'I can laugh off most things.', 'Pastoral Rule III.3');
q('cm2', 'comforts', 'Keeps a tight rein', 'Which is more like you?',
  'I notice when other people overindulge.', 'I enjoy a good meal and don’t think twice about it.',
  'Pastoral Rule III.19: the abstinent tempted to judge "him that eats"');
q('af2', 'after', 'Moves on', 'Which is more like you?',
  'I stop doing it, but I’m not one for saying sorry.', 'I’m quick to say sorry, and sometimes do it again anyway.',
  'Pastoral Rule III.30: those who lament but do not forsake, and those who forsake but do not lament');
q('he6', 'h_win', 'Win the argument', 'When someone wants to change your mind, what works?',
  'A strong argument. Win it fairly and I’ll come round.', 'Don’t push. I come round in my own time.',
  'Nazianzen Or. 2.32');
q('sm2', 'small', 'Easy on little things', 'Your worst mistakes tend to be…',
  '…small ones, but they add up.', '…rare, but big when they come.', 'Pastoral Rule III.33; Moralia XXXI.87');
q('n4', 'nerve', 'Careful', 'Which stays with you longer?',
  'A criticism.', 'A compliment.', 'Moralia XXIX.45; Chrysostom, On the Priesthood V.4');
q('he7', 'h_ask', 'Ask for my help', 'Someone needs you to do something. Which works better on you?',
  'Ask for my help with it.', 'Tell me plainly what to do.', 'Pastoral Rule III.17 (Moses and Hobab)');

// PRIVATE BLOCK: where the fight is for you now (Cassian Conf. 5.13-14). Asked as "how often", one thought per
// statement, so someone who feels neither pull can honestly score low on both. Introduced by PRIVATE_NOTE.
const f = (id, thought, text, src) => I.push({ id, kind: 'freq', scale: 'thought', thought, text, src, block: 'private' });
f('y1', 'gluttony', 'I eat or drink to take the edge off a hard day.', 'Cassian Inst. V; Conf. 5.11, 5.16 (surfeiting and drunkenness)');
f('y2', 'lust', 'I let my eyes, or my thoughts, linger where they shouldn’t.', 'Cassian Inst. IX.6; Conf. 5.11 (Matthew 5:28)');
f('y3', 'greed', 'When I have enough, I still find it hard to give some away.', 'Cassian Inst. VII.7, VII.21-22; Moralia XV.30');
f('y4', 'anger', 'I replay what someone did to me, and what I’d say back.', 'Moralia V.79; Cassian Conf. 5.11 (anger that lasts for days)');
f('y5', 'vainglory', 'I like people to know about the good I’ve done.', 'Cassian Inst. XI.3; Pastoral Rule III.35');
f('y6', 'sadness', 'A heaviness comes over me, and even people I love feel like hard work.', 'Cassian Inst. IX.4; Conf. 5.11');
f('y7', 'pride', 'I find it hard to take correction, even when it’s fair.', 'Cassian Inst. XII.29');
f('y8', 'listlessness', 'I can’t settle to what I’m meant to be doing, and I’d rather be anywhere else.', 'Cassian Inst. X.2; Conf. 5.11 (the kind that makes you flee)');
f('y9', 'lust', 'When I’m lonely or tired, my mind drifts to someone I shouldn’t think about that way.', 'Cassian Inst. IX.6; Moralia XXXI.88');
f('y10', 'vainglory', 'I picture people being impressed with me.', 'Cassian Inst. XI.14; Praktikos 13');
f('y11', 'listlessness', 'I put off the one thing that matters most.', 'Cassian Inst. X.2-5 (the kind that sends you to sleep)');
f('y12', 'pride', 'Deep down, I think I’d do most things better than the people around me.', 'Cassian Inst. XII.29; Praktikos 14');

// Closing block: your line in the Body (Cassian Conf. 14.4; Abba Nastir: "if thy soul desireth it, that do").
I.push({ id: 'b1', kind: 'pick', max: 2, scale: 'lines', stem: 'Which would you most gladly do for someone this week? Pick up to two.',
  options: [
    { line: 'watcher',   text: 'Pray for them every day, without telling them.' },
    { line: 'host',      text: 'Have them over and cook them a meal.' },
    { line: 'caregiver', text: 'Sit with them at the hospital, or through a bad night.' },
    { line: 'advocate',  text: 'Stand up for them when they’re treated unfairly.' },
    { line: 'teacher',   text: 'Explain something until they finally understand it.' },
    { line: 'giver',     text: 'Quietly pay for something they can’t afford.' },
    { line: 'shepherd',  text: 'Organise the group so no one gets left out.' },
  ], src: 'Cassian Conf. 14.4; Budge, Paradise II, no. 605 (Abba Nastir)' });
I.push({ id: 'b2', kind: 'pick', max: 2, scale: 'lines', stem: 'What do people usually come to you for? Pick up to two.',
  options: [
    { line: 'watcher',   text: 'To ask me to pray for them.' },
    { line: 'host',      text: 'A place to stay, or a meal.' },
    { line: 'caregiver', text: 'Someone to be with them when it’s hard.' },
    { line: 'advocate',  text: 'Someone to fight their corner.' },
    { line: 'teacher',   text: 'Something explained or taught.' },
    { line: 'giver',     text: 'Money, or something they need.' },
    { line: 'shepherd',  text: 'Someone to take charge and sort things out.' },
  ], src: 'Cassian Conf. 14.5: "the line which he has chosen as the grace which he has received"' });
q('b3', 'front', 'Out in front', 'Where are you most useful?',
  'Out in front, where people can see.', 'Behind the scenes, where nobody notices.', 'Matthew 6:3-4 for the giver; Cassian Conf. 14.4');

export const ITEMS = I;

export const PRIVATE_NOTE = 'The next twelve are only for you. Nobody sees these answers, and they never go on your share card. Answer as you really are, not as you would like to be.';
export const FREQ = { low: 'Never', mid: 'Sometimes', high: 'All the time' };

// Sanity: 72 items; every two-sided scale item names a real scale pole.
if (I.length !== 72) throw new Error('expected 72 items, got ' + I.length);
for (const it of I) {
  if (it.kind !== 'two' || it.scale === 'front') continue;
  const s = SCALES[it.scale];
  if (!s) throw new Error('unknown scale ' + it.scale + ' in ' + it.id);
  if (it.a !== s.left && it.a !== s.right) throw new Error('item ' + it.id + ' side A pole "' + it.a + '" is not a pole of ' + it.scale);
}
