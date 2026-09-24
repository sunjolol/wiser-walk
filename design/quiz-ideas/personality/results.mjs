// The Personality Quiz: every piece of result text, written by the main session from the sources (2026-09-23).
// Every quotation is wrapped in Q(text, cite) and machine-checked by check-quotes.mjs against the saved source texts.
// Plain short sentences; no section numbers shown to readers; capitals for every pronoun for God inside quotations.

export const Q = (text, cite) => ({ q: text, cite });

const GREGORY_M = 'St Gregory the Great, Moralia on Job';
const GREGORY_PR = 'St Gregory the Great, Pastoral Rule';
const NAZ = 'St Gregory the Theologian, Oration 2';
const CASSIAN = 'St John Cassian';

// ---------------------------------------------------------------------------------------------------------------
// DISPOSITIONS (Moralia XXIX.45) and the trap set for each.
// ---------------------------------------------------------------------------------------------------------------
// The report follows this with all four, the reader's own last, in Gregory's words for each temper (`trapWho`):
// "For the cheerful it's pleasure. For the gloomy it's a quarrel. For the proud it's praise. For the careful, it's fear."
export const TRAP_LEAD = 'Gregory says the tempter studies each person first, then sets the trap right next door.';

// Shown when the reader's own answers say their first trap has little pull (score.mjs `trapSwapped`). {own} is that
// trap, {second} the other disposition they also lean to; the heading above then names the second one's trap.
// Shown when that pull is weak in the reader and there is no second leaning to turn to (score.mjs `trapQuiet`).
export const TRAP_QUIET = 'Your own answers say this pull is weak in you right now. That is good. Keep an eye on it anyway: this is where Gregory says the trap is laid for your temper.';

export const TRAP_SWAP = 'But your answers say {own} has little pull on you. You also lean {second}, and Gregory’s trap for that may matter more:';

export const DISPOSITIONS = {
  cheerful: { word: 'Cheerful', gregory: 'cheerful', trapWho: 'the cheerful',
    trap: { name: 'pleasure',
      quote: Q('pleasure borders on mirth', GREGORY_M),
      plain: 'So your temptation rarely looks like temptation. It looks like a good time: one more helping, one more episode, one more thing you enjoy a little too much.' },
    bring: ['You make hard things feel lighter.', 'People relax around you.'],
    cost: ['You can skip past what is wrong.'], trapCost: 'Pleasure can quietly become the point.',
    grace: { text: 'Your gladness is a gift. Kept close to God, it becomes the joy Christ promised, the kind nobody can take from you.',
      quote: Q('I will see you again, and your heart shall rejoice, and your joy no man shall take from you', 'Christ, quoted by Gregory in the Pastoral Rule') } },
  serious: { word: 'Serious', gregory: 'morose', trapWho: 'the gloomy',
    trap: { name: 'a quarrel',
      quote: Q('And because moroseness easily slides into anger, he offers the cup of discord for the morose.', GREGORY_M),
      plain: 'So your temptation rarely looks like temptation. It looks like being right about how badly you have been treated.' },
    bring: ['You take people and things seriously.', 'You are honest about sorrow.'],
    cost: ['Hurts go deep and stay.'], trapCost: 'Heaviness can turn into irritation.',
    grace: { text: 'Your seriousness is not a flaw to be fixed. Gregory says even the anger that can grow from it is not wasted. Held under reason, it becomes holy zeal.',
      quote: Q('For some are possessed by anger, but while they submit this to reason, they convert it into service rendered to holy zeal.', GREGORY_M) } },
  careful: { word: 'Careful', gregory: 'timid', trapWho: 'the careful',
    trap: { name: 'fear',
      quote: Q('Because the timid dread punishments, he threatens terrors to the fearful.', GREGORY_M),
      plain: 'So your temptation rarely looks like temptation. It looks like worry. What if they are upset? What if it goes wrong? What if I say it, and it costs me?' },
    bring: ['You see risks others miss.', 'People trust you to be careful with them.'],
    cost: ['You wait to be sure, and the moment can pass.'], trapCost: 'Worry can pass for wisdom.',
    grace: { text: 'Your care is a gift. Gregory says the fearful should not stay in fear. Fed by love, they should grow until love does what fear used to do.',
      quote: Q('grow up by the nursing of charity to the grace of love', GREGORY_PR) } },
  confident: { word: 'Confident', gregory: 'proud', trapWho: 'the proud',
    trap: { name: 'praise',
      quote: Q('And because he beholds the proud elated with praises, he draws them on to whatever he pleases, by flattering applause.', GREGORY_M),
      plain: 'So your temptation rarely looks like temptation. It looks like applause. Whoever praises you can steer you.' },
    bring: ['You step up when others hang back.', 'You are hard to rattle.'],
    cost: ['It can be hard for anyone to correct you.'], trapCost: 'Praise can steer you.',
    grace: { text: 'Your confidence is not a flaw to be crushed. Bowed before God, it becomes the courage to speak up for what is right.',
      quote: Q('Some are lifted up by pride. But whilst they bow down the mind to the fear of God, they change this into the free tone of unrestrained authority in defence of justice.', GREGORY_M) } },
};

export const MAKEUPS = {
  quiet: { word: 'Quiet', gregory: 'tranquil', bring: 'You think best in quiet.', cost: 'A crowded week wears you down fast.',
    text: 'Gregory says some minds are so quiet that a sudden pile of business buries them before they start. They should not overload themselves. But quiet can hide faults as well as heal them, so they still need people.',
    quote: Q('there are some of such inactivity of mind, that, if the labours of business fall upon them, they give way at the very beginning of their work', GREGORY_M) },
  restless: { word: 'Restless', gregory: 'restless', bring: 'You get things done.', cost: 'Rest can feel like losing.',
    text: 'Gregory says some minds are so restless that time off only makes their thoughts worse. They should work hard, and not force themselves into long stretches of stillness.',
    quote: Q('there be some so restless, that if they have cessation from labour, they have only the worse labour', GREGORY_M) },
};

// ---------------------------------------------------------------------------------------------------------------
// THE EIGHT TYPES (disposition x make-up). Names are drafts the owner approved in principle.
// Kindred only where a source records the temper; `partial` marks a partial match; none is ever guessed.
// ---------------------------------------------------------------------------------------------------------------
export const TYPES = {
  hearth: { ink: '#E3A55B', art: 'hearth', name: 'The Hearth', disposition: 'cheerful', makeup: 'quiet', opposite: 'forge',
    tagline: 'Light-hearted, and at your best when life is quiet.',
    portrait: 'Your mood runs light, and you are at your best when life is quiet. You enjoy things as they come: a meal, a long talk, an evening at home.',
    kindred: [
      { who: 'St Antony the Great', img: 'antony-the-great', text: 'He spent twenty years alone in the desert. When he came out, Athanasius says, his friends were amazed at how settled he was, and his face was cheerful because his soul was at peace.', src: 'Athanasius, Life of Antony' },
      // Cuthbert and Guthlac added 2026-09-24 (the owner asked for at least two saints per type); each checked by a
      // skeptic against the fetched public-domain text and Latin, both halves recorded as their nature.
      { who: 'St Cuthbert', img: 'cuthbert-of-lindisfarne', text: 'Bede says he was “affable and pleasant in his character”, and spoke “with cheerful and soothing language, as he was accustomed”. He had long wanted “the secrecy of solitude”, and at last he lived alone on the island of Farne. Made a bishop, he went back after two years to “his much-loved solitude”.', src: 'Bede, Life of St Cuthbert' },
      { who: 'St Guthlac', img: 'guthlac-of-crowland', text: 'He led a war band for nine years, then became a monk and began “to long for the wilderness”. He spent his last fifteen years as a hermit in the fens, and “evermore sweetness was in his temper”. When two visiting monks hid their ale under a turf, he knew, and asked them “with merry countenance and laughing words” why they had not brought it along.', src: 'Felix, Life of St Guthlac' },
    ],
    kindredNote: 'Scripture records joyful moments more often than joyful people, so no Bible figure is named here.' },

  spark: { ink: '#EE7F5E', art: 'spark', name: 'The Spark', disposition: 'cheerful', makeup: 'restless', opposite: 'deepwell',
    tagline: 'Light-hearted, and at your best when there is something to do.',
    portrait: 'Your mood runs light, and you are at your best with something to do. A quiet week makes you restless, and a full one suits you. People catch your energy.',
    kindred: [
      { who: 'St Augustine, as a young man', img: 'augustine-of-hippo', text: 'Before his conversion he loved talk, jokes, reading together and friendly arguments. In his Confessions he calls it “a restless youthfulness”. He is honest there, too, about where his love of pleasure had led him.', src: 'Augustine, Confessions' },
      // Added 2026-09-24, checked by a skeptic against Bacci's Life (Antrobus, 1902).
      { who: 'St Philip Neri', img: 'philip-neri', text: 'His biographer says he had “a very lively temperament, and without the least tendency to melancholy”. Philip hated idleness so much “that no one ever found him unemployed”. His door was always open, and his room became known as “the Shelter of Christian Mirth”.', src: 'Pietro Giacomo Bacci, Life of St Philip Neri' },
    ] },

  deepwell: { ink: '#4F7FB5', art: 'deepwell', name: 'The Deep Well', disposition: 'serious', makeup: 'quiet', opposite: 'spark',
    tagline: 'Serious by nature, and at your best when life is quiet.',
    portrait: 'You are serious by nature, and you are at your best when life is quiet. You feel things deeply and think them through. People come to you when something really matters.',
    kindred: [
      { who: 'St Gregory the Great', img: 'gregory-the-great', text: 'The man whose book this test is built on. His Dialogues begin with him sitting alone in a quiet place. He says it suited “a sad and melancholy disposition”. He also wrote that he loved the quiet life and had the busy one forced on him.', src: 'Gregory, Dialogues; Letters' },
      { who: 'Elijah', img: 'elijah', text: 'After his great victory on Carmel he ran into the wilderness and sat under a tree. “I have had enough, LORD,” he said. The desert fathers remembered him as the one who “loved silence”.', src: '1 Kings 19:4; Abba Nastir' },
    ] },

  forge: { ink: '#C9553B', art: 'forge', name: 'The Forge', disposition: 'serious', makeup: 'restless', opposite: 'hearth',
    tagline: 'Serious by nature, and at your best when there is something to do.',
    portrait: 'You are serious by nature, and you are at your best with something to do. You feel things deeply, and you would rather act on them than sit with them. Gregory says minds like yours find rest harder than work.',
    kindred: [
      { who: 'St John Chrysostom', img: 'john-chrysostom', text: 'A friend from his youth called him irritable, and an admiring historian says it was his nature to rebuke wrongdoing. He preached so hard against the powerful that he died in exile.', src: 'Socrates and Sozomen, Church Histories' },
      { who: 'St Jerome', img: 'jerome', text: 'The great translator of the Bible was a fighter by his own account. He wrote that in an argument he threw himself into the thick of it.', src: 'Jerome, Letter 48' },
    ] },

  stillwater: { ink: '#4FA3BC', art: 'stillwater', name: 'The Still Water', disposition: 'careful', makeup: 'quiet', opposite: 'herald',
    tagline: 'Careful by nature, and at your best when life is quiet.',
    portrait: 'You are careful by nature, and you are at your best when life is quiet. You like to know what is coming.',
    kindred: [
      { who: 'St Gregory the Theologian', img: 'gregory-of-nazianzus', text: 'He loved “calm and retirement” from his youth, and ran away when they made him a priest. When his best friend Basil called him lazy, he wrote back: “My greatest business always is to keep free from business.” Near the end he said, “I am weary of being charged with my gentleness.”', src: 'Oration 2; Letter 49; Oration 42' },
      { who: 'Jeremiah', img: 'jeremiah', text: 'When God called him, he pleaded that he was too young to speak. Gregory says he held back out of love: he longed to stay close to God in quiet.', src: 'Jeremiah 1:6; Gregory, Pastoral Rule' },
      { who: 'Abba Arsenius', img: 'arsenius', text: 'A desert monk who fled the world to pray. In an old story he is seen sailing in silence, with the Spirit of God beside him.', src: 'The Sayings of the Desert Fathers' },
    ] },

  lookout: { ink: '#6F9E5C', art: 'lookout', name: 'The Lookout', disposition: 'careful', makeup: 'restless', opposite: 'oak',
    tagline: 'Careful by nature, and at your best when there is something to do.',
    portrait: 'You are careful by nature, and you are at your best with something to do. When you spot a problem, you would rather fix it than sit and worry.',
    kindred: [
      { who: 'Moses', img: 'moses', text: 'When God called him he said, “I am slow of speech and tongue,” and begged God to send someone else. Then he led a whole people through the desert for forty years.', src: 'Exodus 4:10-13' },
      { who: 'Gideon', img: 'gideon', text: '“My clan is the weakest in Manasseh, and I am the youngest in my father’s house,” he said. He obeyed God, but he did it at night, because he was afraid.', src: 'Judges 6:15, 27' },
    ] },

  oak: { ink: '#8C7A4F', art: 'oak', name: 'The Oak', disposition: 'confident', makeup: 'quiet', opposite: 'lookout',
    tagline: 'Sure of yourself, and at your best when life is quiet.',
    portrait: 'You are sure of yourself, and you are at your best when life is quiet. You do not need the room’s attention.',
    // Added 2026-09-24 after the owner, an Oak himself, asked whether no saint truly fits. Each was checked by a skeptic
    // against the fetched public-domain text; both halves are recorded in the source, the confident one as settled
    // steadiness and authority (never pride), which Gregory's grace line for this temper describes.
    kindred: [
      { who: 'St Martin of Tours', img: 'martin-of-tours', text: 'At court everyone flattered the emperor, and the bishops gave way. But “in Martin alone, apostolic authority continued to assert itself.” No one ever saw him angry or excited: “he was always one and the same.” When crowds of visitors grew too much for him, he moved to a hidden cell outside the city.', src: 'Sulpicius Severus, Life of St Martin' },
      { who: 'St Benedict', img: 'benedict-of-nursia', text: 'As a young man he ran from praise and lived three years alone in a cave. When his own monks tried to poison him, he faced them “with a mild countenance and quiet mind”. When a raging Goth shouted at him to get up, the Goth ended at his feet, and Benedict “rose not up from his reading”.', src: 'St Gregory the Great, Dialogues' },
      { who: 'St John the Baptist', img: 'john-the-baptist', text: 'He lived in the wilderness until the day he began to preach. Jesus asked the crowds if they had gone out to see “a reed swaying in the wind”. St Gregory says a reed bends to praise or blame, but “no variety of circumstance bent him from his uprightness”.', src: 'Luke 1:80; Matthew 11:7; St Gregory the Great, Homilies on the Gospels' },
    ] },

  herald: { ink: '#D19A22', art: 'herald', name: 'The Herald', disposition: 'confident', makeup: 'restless', opposite: 'stillwater',
    tagline: 'Sure of yourself, and at your best when there is something to do.',
    portrait: 'You are sure of yourself, and you are at your best with something to do. You like to be where things are happening.',
    kindred: [
      { who: 'Isaiah', img: 'isaiah', text: 'When God asked, “Whom shall I send?”, he did not wait to be asked twice: “Here am I. Send me!”', src: 'Isaiah 6:8' },
      { who: 'St Peter', img: 'peter', text: '“Even if all fall away on account of You, I never will,” he said. That same night he denied Christ three times. Then he wept, came back, and led the Church.', src: 'Matthew 26:33, 75' },
      { who: 'St Basil the Great, as a young man', img: 'basil-the-great', text: 'His brother says Basil came home from university proud of his speaking. He looked down on the leading men of his town, until his sister Macrina turned him round.', src: 'Gregory of Nyssa, Life of Macrina' },
    ] },
};

// YOUR OPPOSITE: for each pair of opposite types, two real people who were opposites and are both saints, in one
// true episode that reads from either side. Keyed by the two type keys, sorted. `checks` holds every quotation in the
// story, for check-quotes.mjs (sources: scratchpad gregory/sources/opposites/, BSB and public-domain translations).
export const OPPOSITES = {
  'herald-stillwater': {
    people: { stillwater: { who: 'St Gregory the Theologian', img: 'gregory-of-nazianzus' }, herald: { who: 'St Basil the Great', img: 'basil-the-great' } },
    story: 'Gregory and Basil met as students in Athens. Gregory said they seemed to have “one soul, inhabiting two bodies”. Years later Basil, now an archbishop in a fight over churches, made Gregory bishop of a small town to hold the line. Basil pushed. Gregory held back. He wrote to Basil, “Give me before all things quiet.” Both are saints.',
    src: 'St Gregory the Theologian, Oration 43 and Letter 48',
    checks: [Q('one soul, inhabiting two bodies', 'Gregory the Theologian, Oration 43'), Q('Give me before all things quiet.', 'Gregory the Theologian, Letter 48')] },
  'lookout-oak': {
    people: { lookout: { who: 'St Martha', img: 'martha' }, oak: { who: 'St Mary of Bethany', img: 'mary-bethany' } },
    story: 'When Jesus came to their home, Martha was busy with all the preparations. Her sister Mary sat at His feet and listened. Martha asked Him to tell Mary to help. He said, “you are worried and upset about many things,” and that Mary “has chosen the good portion”. When their brother died, it was Martha who went out to meet Him, while Mary stayed at home. John writes, “Now Jesus loved Martha and her sister and Lazarus.” Both are saints.',
    src: 'Luke 10:38-42; John 11:5, 20',
    checks: [Q('you are worried and upset about many things', 'Luke 10:41'), Q('has chosen the good portion', 'Luke 10:42'), Q('Now Jesus loved Martha and her sister and Lazarus.', 'John 11:5')] },
  'forge-hearth': {
    people: { hearth: { who: 'St Barnabas', img: 'barnabas' }, forge: { who: 'St Paul', img: 'paul' } },
    story: 'When the church in Jerusalem was still afraid of Saul, Barnabas, the “Son of Encouragement”, brought him to the apostles. Later the two fell out over young Mark, who had once left them. Barnabas wanted to give him a second chance. Paul would not. “Their disagreement was so sharp that they parted company.” Years later Paul wrote, “Get Mark and bring him with you, because he is useful to me in the ministry.” Both are saints.',
    src: 'Acts 4:36; 9:27; 15:36-40; 2 Timothy 4:11',
    quote: Q('the one was more tender and indulgent, but this one more strict and austere', 'St John Chrysostom, on Barnabas and Paul, Homilies on Acts'),
    checks: [Q('Son of Encouragement', 'Acts 4:36'), Q('Their disagreement was so sharp that they parted company.', 'Acts 15:39'), Q('Get Mark and bring him with you, because he is useful to me in the ministry.', '2 Timothy 4:11')] },
  'deepwell-spark': {
    people: { spark: { who: 'St Augustine, as a young man', img: 'augustine-of-hippo' }, deepwell: { who: 'St Monica', img: 'monica' } },
    story: 'Young Augustine loved friends, jokes and talk. He calls it “a restless youthfulness”. His mother Monica wept and prayed for him for years. A bishop told her, “it is not possible that the son of these tears should perish.” Years later the two of them stood alone at a window in Ostia and talked together about God. Both are saints.',
    src: 'St Augustine, Confessions',
    checks: [Q('a restless youthfulness', 'Augustine, Confessions II'), Q('it is not possible that the son of these tears should perish', 'Augustine, Confessions III')] },
};

// The two boats (for every opposite pair).
export const BOATS = {
  text: 'The desert fathers saw it in a vision: two boats on a river. Abba Arsenius sailed in silence with the Spirit of God. Abba Moses the Ethiopian, who welcomed his guests, sailed with angels feeding him honey.',
  quote: Q('one fleeth from the world for Thy Name’s sake, and another receiveth and is gracious for Thy Name’s sake', 'The Sayings of the Desert Fathers'),
  body: Q('let all be eye or all head: will not the body perish?', 'St John Chrysostom, on 1 Corinthians'),
};

// ---------------------------------------------------------------------------------------------------------------
// THE EIGHTEEN LEANINGS. For each side: you (what people see), unseen (what you may not see), counsel.
// ---------------------------------------------------------------------------------------------------------------
export const LEANINGS = {
  mood: {
    left:  { you: 'Your mood is light. Things rarely get you down for long.',
             unseen: 'Gregory says pleasure sits right next door to cheerfulness. The pull you are least guarded against is the pull of a good time.',
             counsel: 'Enjoy what you are given. Keep an eye on what lives next door.' },
    right: { you: 'You feel things heavily, and they stay.',
             unseen: 'Gregory says heaviness slides easily into irritation, and from there into quarrels.',
             quote: Q('moroseness easily slides into anger', GREGORY_M),
             counsel: 'Watch for bitterness that calls itself honesty.' } },
  nerve: {
    left:  { you: 'You expect things to go well.',
             unseen: 'Gregory says the tempter leads the confident “by flattering applause”. Praise can steer you without your noticing.',
             counsel: 'Keep one friend who will tell you the truth, and thank them for it.' },
    right: { you: 'You see what could go wrong.',
             unseen: 'Some of what you call caution may be fear.',
             quote: Q('For feeble fear is often called, by men, cautious dispensation', GREGORY_M),
             counsel: 'Do the next right thing before you feel ready.' } },
  makeup: {
    left:  { you: 'You are better busy. Idle time makes your thoughts worse.',
             unseen: 'Gregory warns that a restless mind kept too long in stillness can think itself into trouble. It tries to work out more than it can grasp, and ends up believing wrong things.',
             counsel: 'Work hard. Keep short times of quiet, and do not force long ones.' },
    right: { you: 'You need quiet to think. A pile of busyness buries you.',
             unseen: 'Quiet can hide faults as well as heal them. Chrysostom admitted that his own calm came from loving solitude, not from virtue.',
             quote: Q('not by any innate virtue, but by my love of retirement', 'St John Chrysostom, On the Priesthood'),
             counsel: 'Do not overload yourself. But go out among people. That is where patience gets tested.' } },
  talk: {
    left:  { you: 'You think out loud, and you are easy to talk to.',
             unseen: 'Much talk scatters the mind, Gregory says, so it loses touch with itself. And idle talk slides, step by step, into talk about other people.',
             quote: Q('it has no power to turn back within to the knowledge of itself', GREGORY_M),
             counsel: 'Before you speak, ask whether it is needed, or kind.' },
    right: { you: 'You listen more than you talk.',
             unseen: 'Gregory says people who hold back their words too much often talk all the more inside. The thoughts churn where nobody can answer them.',
             quote: Q('more grievous loquacity in the heart', GREGORY_PR),
             counsel: 'Your mouth needs a door, not a wall: something that opens as well as shuts.' } },
  candour: {
    left:  { you: 'You say what you think.',
             unseen: 'Gregory tells the plain-spoken that truth at the wrong moment can hurt people. They must learn when to keep quiet about what is true.',
             quote: Q('to know how sometimes to be silent about what is true', GREGORY_PR),
             counsel: 'Keep your honesty. Choose your moment.' },
    right: { you: 'You are careful what people see of you.',
             unseen: 'Keeping up a guard is tiring work. Gregory says the plain truth is the safest thing there is.',
             quote: Q('there is nothing safer for defense than sincerity, nothing easier to say than truth', GREGORY_PR),
             counsel: 'Let one person see all of you.' } },
  wronged: {
    left:  { you: 'You deal with things on the spot.',
             unseen: 'Impatience, Gregory says, can wreck in one moment what took years to build.',
             quote: Q('overthrow under sudden impulse whatever they have haply long built up with provident toil', GREGORY_PR),
             counsel: 'Wait before you answer. Then say it, if it still needs saying.' },
    right: { you: 'You stay calm when you are wronged.',
             unseen: 'Gregory says the patient often feel little at the time. Later the memory comes back, and it burns. That is when patience can turn into a grudge.',
             quote: Q('when after a while they recall to memory these very same things that they have endured, they inflame themselves with the fire of vexation', GREGORY_PR),
             counsel: 'Staying calm was a real win. Guard your heart in the hours after it. If it still hurts, say so calmly, and soon.' } },
  temper: {
    left:  { you: 'When something is wrong, you feel the heat.',
             unseen: 'The hot-tempered, Gregory says, mistake their anger for righteousness.',
             quote: Q('they think the goad of their anger to be the zeal of righteousness', GREGORY_PR),
             counsel: 'Keep your fire. Let it follow your reason, not lead it.' },
    right: { you: 'You give people room.',
             unseen: 'Gregory warns that neglect often passes for gentleness. You may let a wrong go on when someone needed you to stop it.',
             quote: Q('Frequently negligent remissness is regarded as gentleness and forbearance', GREGORY_M),
             counsel: 'Be gentle and firm. Gregory reminds the gentle that the Spirit came as a dove, and also as fire.' } },
  strife: {
    left:  { you: 'You say where you stand.',
             unseen: 'Gregory says people often fall out through pride in something they do better than others. His examples are knowing more, and being stricter with themselves.',
             counsel: 'Win the point without losing the person.' },
    right: { you: 'You calm things down.',
             unseen: 'Gregory warns the peaceable not to love peace so much that they never tell anyone they are wrong.',
             quote: Q('Break outward peace with him, but guard in your heart’s core internal peace concerning him', GREGORY_PR),
             counsel: 'You can disagree with someone and still keep the peace inside you.' } },
  pace: {
    left:  { you: 'You decide fast and act.',
             unseen: 'The hasty, Gregory says, only see afterwards what they should not have done.',
             quote: Q('Let your eyelids go before your steps', 'Proverbs, as Gregory quotes it for the hasty'),
             counsel: 'Look where you are putting your foot before you step.' },
    right: { you: 'You wait until you are sure.',
             unseen: 'The slow, Gregory says, find a fear that sounds sensible. Then they treat it as a good reason to wait.',
             quote: Q('The sluggard would not plough by reason of the cold', 'Proverbs, as Gregory quotes it for the slow'),
             counsel: 'Do the good you can do now. Put it off, and later you may not be able to.' } },
  through: {
    left:  { you: 'The first step is the hardest part.',
             unseen: 'Gregory says people who never start are often held back by something else they love. Once they see it is not worth it, starting gets easier.',
             counsel: 'Name what is holding you back. Then take one step.' },
    right: { you: 'You start well, then fade.',
             unseen: 'Gregory says a soul is like a boat going upstream. Stop rowing and it does not stay put. It drifts back.',
             quote: Q('in the condition of a ship ascending against the stream of a river', GREGORY_PR),
             counsel: 'Finish one thing before you start the next.' } },
  small: {
    left:  { you: 'You keep the small rules.',
             unseen: 'Gregory warns that people careful in small things can grow proud of it. Then they fall in a big one. He applies Christ’s words to them: they strain out a gnat and swallow a camel.',
             counsel: 'Keep the small things. Just do not be proud of keeping them.' },
    right: { you: 'You save your care for the big things.',
             unseen: 'Small faults, Gregory says, work like rain. One drop seems like nothing. Enough of them fill a river.',
             quote: Q('deep gulphs of rivers are filled by small but innumerable drops of rain', GREGORY_PR),
             counsel: 'Do not ask how big each fault is. Ask how often it happens.' } },
  work: {
    left:  { you: 'You know when you have done well.',
             unseen: 'Gregory warns that people who are sure of their work can come to think all of it excellent. Then they stop looking for what could be better.',
             quote: Q('Those count all they do to be singularly eminent', GREGORY_PR),
             counsel: 'Ask someone you trust what could be better.' },
    right: { you: 'You rarely think your work is good enough.',
             unseen: 'The faint-hearted, Gregory says, think what they do is worthless, and sink into discouragement.',
             quote: Q('these think what they do to be exceedingly despised', GREGORY_PR),
             counsel: 'Hear the praise first. Then hear what to change.' } },
  critic: {
    left:  { you: 'You can take a hard word.',
             unseen: 'Gregory says the bold often do not see they are in the wrong until several people tell them.',
             quote: Q('Those do not know that they are in fault, unless they be rebuked even by many', GREGORY_PR),
             counsel: 'Ask. Do not wait for a crowd to tell you.' },
    right: { you: 'A gentle word is enough for you.',
             unseen: 'Hard words can shut you down. Another St Gregory, known as the Theologian, warned that too much correction can drive people to despair.',
             quote: Q('that we may not drive them to despair, under the depressing influence of repeated reproofs', NAZ),
             counsel: 'Tell people how to help you. Most do not know.' } },
  room: {
    left:  { you: 'You speak up to people in charge.',
             unseen: 'Some of it may be pride that thinks it is honesty.',
             quote: Q('so do some speak from the impatience of pride, and yet think that they are speaking with rightful freedom', GREGORY_M),
             counsel: 'Before you speak up, check what is driving it.' },
    right: { you: 'You keep to the edge until you are sure.',
             unseen: 'Some of it may be fear that thinks it is humility.',
             quote: Q('just as many are silent through fear, and yet consider that they are silent from humility', GREGORY_M),
             counsel: 'Humility does not mean silence. Say the true thing, kindly.' } },
  mind: {
    left:  { you: 'Once you decide, you stay decided.',
             unseen: 'Gregory says stubbornness often passes for constancy, and grows from thinking a little too much of our own judgment.',
             counsel: 'Take good advice, even when it was not your idea.' },
    right: { you: 'You can be talked round.',
             unseen: 'Gregory says the changeable do not trust their own judgment, because they think too little of themselves.',
             quote: Q('they undervalue and disregard themselves too much', GREGORY_PR),
             counsel: 'Trust your judgment a little more. It is better than you think.' } },
  wins: {
    left:  { you: 'You are glad when others do well.',
             unseen: 'Admiring is not the same as trying. Gregory warns about cheering from the stands.',
             quote: Q('eager backers, but inert spectators', GREGORY_PR),
             counsel: 'If you admire it, try it.' },
    right: { you: 'Someone else’s win stings a little.',
             unseen: 'We only envy people we think are better than us in some way. So the sting shows you where you think they are ahead of you.',
             quote: Q('it is impossible for us to envy any but those, whom we think to be better than ourselves in some respect', GREGORY_M),
             counsel: 'Love the good you see in them. Gregory says what we love in others becomes ours too.' } },
  seen: {
    left:  { you: 'People who have just met you get your best.',
             unseen: 'When praise is the reward, Gregory says, we sell something priceless cheap.',
             quote: Q('a thing worthy of eternal reward is sold for a mean price', GREGORY_PR),
             counsel: 'Give the people at home what strangers get.' },
    right: { you: 'You do good quietly, and do not much mind who notices.',
             unseen: 'Gregory says people are watching and learning from you. Hiding the good you do, or shrugging off a bad name, can mislead them.',
             counsel: 'Let your good be seen when it helps someone, not you.' } },
  after: {
    left:  { you: 'A mistake stays with you.',
             unseen: 'Regret can weigh on you so much that nothing changes. Gregory tells people grieving a wrong not to be crushed by it, but to build on God’s mercy.',
             quote: Q('build upon the mercy which they crave, lest they perish through the force of immoderate affliction', GREGORY_PR),
             counsel: 'Lean on mercy, not on regret. Then change one thing.' },
    right: { you: 'You fix it, and move on.',
             unseen: 'Stopping is not the same as settling it. A writer who stops writing has not rubbed out what he wrote.',
             quote: Q('neither has a writer, when he has ceased from writing, obliterated what he had written by reason of his having added no more', GREGORY_PR),
             counsel: 'Say sorry. Out loud.' } },
  having: {
    left:  { you: 'You give easily.',
             unseen: 'Gregory warns the generous against giving so much at once that they run short and start grumbling.',
             quote: Q('when the soul of the giver knows not how to endure want, then, in withdrawing much from himself, he seeks out against himself occasion of impatience', GREGORY_PR),
             counsel: 'Give steadily and cheerfully, and do not keep score.' },
    right: { you: 'You keep a little back.',
             unseen: 'Gregory warns that being tight-fisted can pass for thrift. He says grasping can also grow from fear of running short.',
             quote: Q('Tenacity is sometimes considered frugality', GREGORY_M),
             counsel: 'Keeping a little back can be wise. Just check whether it is wisdom or worry.' } },
  comforts: {
    left:  { you: 'You enjoy good things without guilt.',
             unseen: 'The fault is never in the food. It is in the wanting.',
             quote: Q('For it is not the food, but the desire that is in fault.', GREGORY_M),
             counsel: 'Enjoy it. Then notice when you reach for it to feel better.' },
    right: { you: 'You hold yourself back.',
             unseen: 'Gregory says the self-denying are not tempted by food. They are tempted by pride in going without, and by impatience with people who do not.',
             quote: Q('the pride of abstinence', GREGORY_M),
             counsel: 'Give away what you go without, and do not judge the one who eats.' } },
};

// ---------------------------------------------------------------------------------------------------------------
// "WHAT YOU MIGHT NOT HAVE NOTICED": links Gregory himself makes, printed only when BOTH answers lean that way.
// Each `when` names an item and the pole the person leaned to (at least "a bit").
// ---------------------------------------------------------------------------------------------------------------
export const LINKS = [
  { id: 'inner-talk', when: [['t1', 'Keeps it in'], ['t2', 'Keeps it in']],
    you: ['you listen more than you talk', 'you have whole conversations in your head that never happen'],
    text: 'Gregory says one can lead to the other. Hold your tongue too hard, and the talking moves inside. In there, nobody can answer back, so you always get the last word. That can leave you quietly judging people who never got to reply.',
    quote: Q('For his tongue he represses, his mind he exalts', GREGORY_PR) },
  { id: 'evening-after', when: [['w1', 'Lets it go'], ['w2', 'Lets it go']],
    you: ['you let rudeness go', 'hours later you think of what you should have said'],
    text: 'You win in the moment by staying calm. Then, on a quiet evening, it comes back bigger than it was. You can end up wishing you had been harsher than you would ever actually be. The hard part for you is not staying calm. It is the evening after.',
    quote: Q('blushes for having borne such things calmly, and is sorry that he did not return insults', GREGORY_PR) },
  { id: 'snap-regret', when: [['w1', 'Lets them know'], ['w2', 'Lets them know']],
    you: ['you let people know on the spot', 'you snap, and wish you had not'],
    text: 'Gregory saw this exactly. Anger drives you somewhere you never meant to go, and you only see it when it is over. It is not that you do not care. It is that the care arrives too late.',
    quote: Q('fury drives the mind whither desire draws it not', GREGORY_PR) },
  { id: 'fear-humility', when: [['r1', 'Makes yourself small'], ['wk1', 'Hard on yourself']],
    you: ['you keep your disagreements with people in charge to yourself', 'your first thought about your own work is that it is not good enough'],
    text: 'Both can feel like humility. Gregory warns that some of it may really be fear. Only you can tell which it is in you. But it is worth asking.',
    quote: Q('just as many are silent through fear, and yet consider that they are silent from humility', GREGORY_M) },
  { id: 'pride-frankness', strongOnly: true, when: [['r1', 'Takes up room'], ['f2', 'Fiery']],
    you: ['you tell people in charge when they are wrong', 'your anger usually feels justified'],
    text: 'Gregory warns about both. Pride can feel like honest speaking. Temper can feel like zeal for what is right. That does not mean you are wrong. It means feeling right is not proof that you are.',
    quote: Q('they think the goad of their anger to be the zeal of righteousness', GREGORY_PR) },
  { id: 'unaware-heat', strongOnly: true, when: [['c1', 'Say it straight'], ['f1', 'Fiery']],
    you: ['you do not always notice when you have upset someone', 'you feel the heat rise when things are done badly'],
    text: 'Put those two together. People may be more wary of your temper than you know. Gregory says the angry do not know what they are doing in their anger. So others often see it before you do.',
    quote: Q('they know not what they do in their anger, they know not what in their anger they suffer from themselves', GREGORY_PR) },
  { id: 'abstinent-judge', when: [['cm1', 'Keeps a tight rein'], ['cm2', 'Keeps a tight rein']],
    you: ['you hold back after a hard day', 'you notice when other people overindulge'],
    text: 'Gregory says self-denial has its own temptation, and it is not food. It is looking down on people who do not go without. Discipline is a gift. Judging the undisciplined is where it turns.',
    quote: Q('the pride of abstinence', GREGORY_M) },
  { id: 'lament-repeat', when: [['af1', 'Dwells on a mistake'], ['af2', 'Dwells on a mistake']],
    you: ['a mistake stays with you for a long time', 'you are quick to say sorry, and sometimes do it again anyway'],
    text: 'Gregory writes about people who are sorry for a wrong, and then do it again. He says their tears wash them, but they do not stay clean. You do not need to feel worse. You need one small change.', strongOnly: true },
  { id: 'stop-no-sorry', when: [['af1', 'Moves on'], ['af2', 'Moves on']],
    you: ['you fix things and move on', 'you stop doing the wrong thing, but you are not one for saying sorry'],
    text: 'Stopping is good. But Gregory says it does not undo what was done, any more than a debtor clears a debt by borrowing no more. Something still needs saying.',
    quote: Q('nor is a debtor absolved by not increasing his debt, unless he also pays what he has incurred', GREGORY_PR) },
  { id: 'gentle-slide', when: [['f2', 'Gentle'], ['s1', 'Keeps the peace']],
    you: ['you let things slide that you probably should not', 'you calm things down when friends argue'],
    text: 'Gregory says gentleness has a next-door neighbour, and it is letting things go that should not go. Keeping the peace can be love. It can also be the easier road.',
    quote: Q('Sloth is frequently looked upon as a maintenance of peace', GREGORY_M) },
  { id: 'heavy-anger', when: [['m4', 'Heavy-hearted'], ['an2', 'Holds on']],
    you: ['things stay with you for a while', 'once you are angry, it can last for days'],
    text: 'Gregory saw the link. A heavy heart slides easily into anger. Cassian saw the other half. He says one kind of sadness comes once anger dies down. So the two feed each other, and anger that lasts for days keeps it going.',
    quote: Q('And because moroseness easily slides into anger, he offers the cup of discord for the morose.', GREGORY_M) },
  { id: 'cold-plough', when: [['p1', 'Puts it off'], ['n1', 'Careful']],
    you: ['more of your regrets are things you never got round to', 'before something big you think about what could go wrong'],
    text: 'Those two go together. You picture the setbacks, and the picture keeps you still. Gregory quotes Proverbs about a farmer who would not plough because it was cold, and then had nothing to harvest.',
    quote: Q('The sluggard would not plough by reason of the cold', 'Proverbs, as Gregory quotes it') },
  { id: 'praise-public', strongOnly: true, when: [['se1', 'Better in public'], ['se2', 'Better in public']],
    you: ['people you have just met get your best', 'you care what people think of you'],
    text: 'Both can come from wanting to be well thought of. The good you do in public is real. But if applause is the reward, Gregory says, you are selling it cheap. The people at home are the test.',
    quote: Q('a thing worthy of eternal reward is sold for a mean price', GREGORY_PR) },
  { id: 'fear-want', when: [['hv1', 'Careful with what you have'], ['y3', 'greed']],
    you: ['your gut says “let me think” when a friend asks for money', 'you find it hard to let go of money or things'],
    text: 'Gregory says grasping grows from two roots. One is pride. The other is fear. Yours looks like fear. It is not wanting more. It is dreading having less.',
    quote: Q('avarice sometimes steals upon men from pride, and sometimes from apprehension', GREGORY_M) },
  { id: 'swayed-small', when: [['mi2', 'Easily swayed'], ['wk2', 'Hard on yourself']],
    you: ['you often change your plans when a friend doubts them', 'you think praise is people just being kind'],
    text: 'Gregory says the changeable are easily turned because they think too little of themselves. Your two answers point the same way. Trust your judgment a little more.',
    quote: Q('they undervalue and disregard themselves too much', GREGORY_PR) },
  { id: 'gnat-camel', when: [['sm1', 'Careful with little things'], ['sm2', 'Careful with little things']],
    you: ['you are careful about small things', 'your worst mistakes are rare, but big'],
    text: 'Gregory knew this pattern well. Being careful in small things can make us feel safe, and the feeling of safety is where the big fall comes from.',
    quote: Q('Straining out a gnat, but swallowing a camel', 'Christ, as Gregory quotes Him') },
  { id: 'drops', when: [['sm1', 'Easy on little things'], ['sm2', 'Easy on little things']],
    you: ['you let small things slide', 'your worst mistakes are small, but they add up'],
    text: 'Gregory says small faults are more dangerous than big ones in one way: nobody notices them, so nobody stops them. No single drop seems to matter. But enough of them flood a river.',
    quote: Q('deep gulphs of rivers are filled by small but innumerable drops of rain', GREGORY_PR) },
];

// ---------------------------------------------------------------------------------------------------------------
// THE ANGER GRID (Moralia V.80-81).
// ---------------------------------------------------------------------------------------------------------------
export const ANGER = {
  intro: Q('there be some, whom anger is somewhat prompt in inflaming, but quickly leaves them; while there are others whom it is slow in exciting, but the longer in retaining possession of', GREGORY_M),
  cells: {
    reeds: { name: 'Kindled reeds', catch: 'fast', hold: 'brief', short: 'A loud crackle, then ashes.',
      text: 'Your anger flares and fades. You would probably say you rarely hold a grudge. Ask someone close to you whether they agree. The danger is the first minute: what you say before it burns out.',
      quote: Q('like kindled reeds, while they clamour with their voices, give out something like a crackle at their kindling', GREGORY_M),
      cure: 'When someone wrongs you, remember your own faults first. It takes the heat out of the first minute.' },
    brief: { name: 'Slow and brief', catch: 'slow', hold: 'brief', short: 'Gregory: the nearest to peace of mind.',
      text: 'It takes a lot to anger you, and it does not last. Gregory says this is the one closest to peace of mind. It is worth checking. Ask someone close to you whether they agree.',
      cure: 'Keep it that way. When someone wrongs you, Gregory says, remember your own faults first.' },
    worst: { name: 'Quick and lasting', catch: 'fast', hold: 'long', short: 'Gregory calls this one the worst.',
      text: 'Your anger catches fast and stays long. Gregory did not soften it: of the four, he calls this the worst. But you only need to change one half. Slow the catch, or let go sooner, and you are out of the worst box.',
      quote: Q('Others again, and their conduct is the worst, are both quick in catching the flames of anger, and slow in letting them go', GREGORY_M),
      cure: 'Gregory gives two cures. Before the day starts, think through what might go wrong, so nothing catches you asleep. And when someone wrongs you, remember your own faults.' },
    wood: { name: 'Hard wood', catch: 'slow', hold: 'long', short: 'Slow to light. Hard to put out.',
      text: 'It takes a lot to make you angry. But once it is lit, it stays lit. It just burns where no one can see it.',
      quote: Q('others, like the heavier and harder kinds of wood, are slow in taking fire, but being once kindled, are with difficulty put out', GREGORY_M),
      cure: 'Do not let it burn in secret. Say the hurt calmly, and soon. And when you think about what they did, think about your own faults too.' },
  },
  speech: Q('The things that are done to thee cannot be borne patiently; nay rather, patiently to endure them is a sin; because if thou dost not withstand them with great indignation, they are afterwards heaped upon thee without measure.', 'Gregory, Moralia on Job, anger’s own speech'),
};

// THE SPEAKER GRID (Moralia VIII.58).
export const SPEAKER = {
  cells: {
    full:   { name: 'Full in both', ease: 'easy', weight: 'thinks', short: 'Gregory: worthy of praise.',
      text: 'You think things through, and the words come easily. Gregory calls this speaker “worthy of praise”. The gift is meant to be used for others.' },
    fluent: { name: 'Words first', ease: 'easy', weight: 'speaks', short: 'Gregory: needs holding back.',
      text: 'Words come easily, sometimes before the thought is ready. Gregory says this speaker needs holding back. The fix is simple: think first.' },
    deep:   { name: 'Deep, but held in', ease: 'hard', weight: 'thinks', short: 'Gregory: “calls for aid”.',
      text: 'You think deeply, but the words come hard. Gregory knew this speaker and did not blame them. He said they need help getting it out. Try writing it down first, or saying it to one person instead of a room.',
      quote: Q('there are some, who have penetration of thought to support them, but from barrenness of expression are made silent', GREGORY_M) },
    spare:  { name: 'Hard to say, said too soon', ease: 'hard', weight: 'speaks', short: 'Gregory: sympathy, not blame.',
      text: 'Finding the words is hard for you. And sometimes they come out before you have thought them through. Gregory says this speaker needs sympathy, not blame. Slow down. Try writing it down first.' },
  },
};

// ---------------------------------------------------------------------------------------------------------------
// THE HELP CARD. One line per side, from Nazianzen's Oration 2 and Gregory. The card shows the seven strongest.
// ---------------------------------------------------------------------------------------------------------------
export const HELP = {
  h_show:   { left: 'Explain why. I need the reasons.', right: 'Show me. Let me see someone do it.', note: 'St Gregory the Theologian: “some are led by doctrine, others trained by example”' },
  h_spur:   { left: 'Nudge me to get started. I can be slow to begin.', right: 'Slow me down. I run ahead.', note: 'St Gregory the Theologian: “some need the spur, others the curb”' },
  h_praise: { left: 'Tell me what I did well. It makes me try harder.', right: 'Tell me I can do better. I rise to a challenge.', note: 'St Gregory the Theologian: “some are benefited by praise, others by blame”' },
  h_watch:  { left: 'Point out everything. I would rather know.', right: 'Pick the one thing that matters most, and let the rest go.', note: 'St Gregory the Theologian: “seeing not to see, and hearing not to hear them”' },
  h_public: { left: 'Tell me if others have noticed it too. One voice I can shrug off.', right: 'Tell me in private.', note: 'St Gregory the Theologian: “some, when taken to task in public, others, when privately corrected”' },
  h_win:    { left: 'Argue it out with me. Win fairly and I will come round.', right: 'Give me time to come round. Pressure makes me dig in.', note: 'St Gregory the Theologian: “some it is often more advantageous to conquer — by others to be overcome”' },
  h_ask:    { left: 'Tell me plainly what you need.', right: 'Ask for my help. I will give it gladly.', note: 'Gregory the Great: Moses won Hobab over by asking for his help' },
  critic:   { left: 'Say it straight. I can take it.', right: 'Say it gently. A hint is enough.', note: 'Gregory the Great, on the bold and the bashful' },
  work:     { left: 'Be specific about what could be better.', right: 'Start with what I did well.', note: 'Gregory the Great, on the forward and the faint-hearted' },
  talk:     { left: 'Give me room to think out loud.', right: 'Ask what I think. I rarely offer it.', note: 'Gregory the Great, on the talkative and the silent' },
  nerve:    { left: 'Challenge me. I can handle it.', right: 'When I get it wrong, tell me what to try next time.', note: 'Gregory the Great, on the confident and the faint-hearted' },
};

// ---------------------------------------------------------------------------------------------------------------
// WHERE THE FIGHT IS FOR YOU NOW: Cassian's eight thoughts. Behind a "Show it" tap. Never on the share card.
// ---------------------------------------------------------------------------------------------------------------
export const THOUGHT_TEXT = {
  gluttony: { name: 'Gluttony', old: 'gastrimargia',
    what: 'It is not about enjoying good food. It is reaching for food or drink to take the edge off. Or wanting something nicer than what is in front of you. Gregory says the fault is never in the food. It is in the wanting.',
    speech: Q('God has created all things clean, in order to be eaten', 'Gregory, Moralia on Job, gluttony’s own speech'),
    shows: 'Eating or drinking to take the edge off. Finding it hard to stop at enough. A heavy, dull mind afterwards.',
    feeds: 'Nothing has to feed it. Cassian says it is part of our nature. It can be held down but never rooted out. And it opens the door to the others.',
    place: 'Cassian’s advice is steady, daily moderation, not sudden strict fasts. And break your own fast gladly for a guest.',
    when: 'When you are tired or low.' },
  lust: { name: 'Lust', old: 'porneia',
    what: 'Desire cut loose from love. Cassian says the look only brings to the surface what was already stored in the heart.',
    speech: Q('Why enlargest thou not thyself now in thy pleasure, when thou knowest not what may follow thee?', 'Gregory, Moralia on Job, lust’s own speech'),
    shows: 'A look that lingers. Thoughts you would not want read aloud.',
    feeds: 'Cassian says gluttony feeds it. What is indulged in one place asks to be indulged in another.',
    place: 'Cassian says its place is taken by chastity, kept with watchfulness and by staying away from what feeds it.',
    when: 'After indulging, or when idle.' },
  greed: { name: 'Greed', old: 'philargyria',
    what: 'Not always wanting more. Often it is fear of having less. It is the grip, not the amount. Cassian says it starts with “excellent and almost reasonable excuses”.',
    speech: Q('It is a very blameless thing, that thou desirest some things to possess; because thou seekest not to be increased, but art afraid of being in want', 'Gregory, Moralia on Job, greed’s own speech'),
    shows: 'Finding it hard to give, even when you have enough. Never quite feeling it is enough.',
    feeds: 'Cassian says it often starts as worry about the future: illness, old age, not wanting to be a burden.',
    place: 'Cassian says the cure is in the desire, not the amount. Someone with very little can be free of it, and someone with a lot can be bound by it.',
    when: 'When the future feels uncertain.' },
  anger: { name: 'Anger', old: 'orge',
    what: 'Cassian names three kinds: anger that rages inside, anger that breaks out in words, and anger that lasts for days.',
    speech: Q('The things that are done to thee cannot be borne patiently; nay rather, patiently to endure them is a sin', 'Gregory, Moralia on Job, anger’s own speech'),
    shows: 'Replaying what someone did. Going cold on people while saying you are fine. Irritation at things that cannot help it.',
    feeds: 'Cassian says greed feeds it. Gregory says envy does.',
    place: 'Cassian says its place is taken by patience.',
    when: 'Among people. Cassian says a man seems patient only while nobody tests him.' },
  sadness: { name: 'Sadness', old: 'lupe',
    what: 'A heavy sorrow. Cassian says there are two kinds. One comes after anger has died down, or after a loss. The other comes from unreasonable anxiety.',
    speech: Q('What ground hast thou to rejoice, when thou endurest so many wrongs from thy neighbours?', 'Gregory, Moralia on Job, sadness’s own speech'),
    shows: 'The people you love come round, and everything they say seems badly timed. Or a flat heaviness you cannot explain.',
    showsQuote: Q('we cannot receive with ordinary civility the visits of those who are near and dear to us', CASSIAN + ', Institutes'),
    feeds: 'Anger, a loss, or worry. If anger is feeding yours, deal with the anger, and this weakens.',
    place: 'Not cheerfulness. Cassian says its place is taken by “a godly sorrow and one full of joy”.',
    placeQuote: Q('a godly sorrow and one full of joy', CASSIAN + ', Conferences'),
    when: 'When you are alone.' },
  listlessness: { name: 'Listlessness', old: 'acedia',
    what: 'The desert fathers called it the noonday demon. Cassian says it comes in two kinds. One sends you to sleep. The other sends you running: anywhere but here, doing anything but this.',
    shows: 'Watching the clock. Checking your phone again. Putting off the thing that matters. Suddenly needing to be somewhere else, even somewhere good.',
    showsQuote: Q('often goes in and out of his cell, and frequently gazes up at the sun, as if it was too slow in setting', CASSIAN + ', Institutes'),
    speechNote: 'Its argument is pious. Cassian says it suggests good reasons to leave, like a visit that would be “a real work of piety”.',
    feeds: 'Cassian says sadness feeds it.',
    place: 'Cassian says its place is taken by courage. His remedy is plain: work with your hands, and stay put.',
    placeQuote: Q('a fit of accidie should not be evaded by running away from it, but overcome by resisting it', CASSIAN + ', Institutes'),
    when: 'In the middle of the day, when the work is half done.' },
  vainglory: { name: 'Vainglory', old: 'kenodoxia',
    what: 'Wanting to be noticed. Cassian says it is like an onion: peel off one layer and there is another underneath.',
    speech: Q('Thou oughtest to aim at greater things, that, as thou hast been able to surpass many in power, thou mayest be able to benefit many also.', 'Gregory, Moralia on Job, vainglory’s own speech'),
    shows: 'Daydreams of being admired. Doing good in a way that gets seen.',
    showsQuote: Q('Nor does this malady endeavour to wound a man except through his virtues', CASSIAN + ', Institutes'),
    feeds: 'Your good qualities. Cassian says it can only attack you through what is good in you.',
    place: 'Cassian’s rule: avoid whatever would make you stand out as the only one who could do it.',
    when: 'Right after you have done well.' },
  pride: { name: 'Pride', old: 'hyperephania',
    what: 'It comes last on Cassian’s list. But he says it came first of all. Every other fault spoils one virtue. Pride spoils them all.',
    shows: 'Finding correction hard to take, even when it is fair. Preferring your own way to anyone’s advice.',
    showsQuote: Q('though he is incapable of giving sound advice, yet in everything he prefers his own opinion to that of the elders', CASSIAN + ', Institutes'),
    feeds: 'Cassian says vainglory feeds it.',
    place: 'Cassian says its place is taken by humility, built on kindness and a simple heart.',
    when: 'When you are doing well, and when you are close to the top.' },
};

export const FIGHT = {
  intro: 'This page is private. It shows where the fight is for you right now, not who you are. It never goes on your share card.',
  why: Q('every one should discover his besetting sin, and direct his main attack against it', CASSIAN + ', Conferences'),
  moves: Q('single out the worst fault which he can see among those still there', CASSIAN + ', Conferences'),
  steps: [
    { name: 'It suggests', text: 'A thought arrives. You did not choose it.' },
    { name: 'You enjoy it', text: 'You turn it over. It feels good.' },
    { name: 'You agree', text: 'Now it is yours. Catch it at the first step.' },
  ],
  stepsSrc: 'Gregory, Pastoral Rule: “suggestion, delight, and consent”',
  stepsQuote: Q('we perpetrate the iniquity of every sin in three ways; that is to say, in suggestion, delight, and consent', GREGORY_PR),
  none: 'None of the eight stands out for you right now. That is good news. Cassian would still say: find the one you recognise most, and start there.',
  several: 'No single one leads right now. These are close, so start with the one you recognise most:',
  sins: 'Gregory later reworked Cassian’s eight thoughts into the list we know as the seven deadly sins. The quiz on them looks at the same ground another way. Take it, and this page will add what it finds.',
};

// ---------------------------------------------------------------------------------------------------------------
// YOUR BEST QUALITY AND ITS COUNTERFEIT (Pastoral Rule II.9; Moralia XXXII.45, XXXI.86, XXXIV.51, XXIX.45).
// Keyed by `scale:side`. The report picks the strongest leaning that has an entry.
// ---------------------------------------------------------------------------------------------------------------
export const VIRTUES = {
  'temper:right':  { best: 'Gentleness', bestText: 'You bear with people. You give them room to be wrong.', fake: 'Looking the other way',
    warn: 'Gregory warns that “inordinate laxity is believed to be loving-kindness”. Letting a wrong go on can feel like kindness when it is really avoidance.', quote: Q('inordinate laxity is believed to be loving-kindness', GREGORY_PR) },
  'temper:left':   { best: 'Zeal', bestText: 'You care about right and wrong, and you act on it.', fake: 'Temper',
    warn: 'Gregory warns that “unbridled wrath is accounted the virtue of spiritual zeal”. Anger at a real wrong can feel holy. Some of the heat may just be temper.', quote: Q('unbridled wrath is accounted the virtue of spiritual zeal', GREGORY_PR) },
  'having:right':  { best: 'Thrift', bestText: 'You take care of what you have been given.', fake: 'Stinginess',
    warn: 'Gregory warns that “niggardliness palliates itself under the name of frugality”. In plain words, stinginess can call itself good sense.', quote: Q('niggardliness palliates itself under the name of frugality', GREGORY_PR) },
  'having:left':   { best: 'Generosity', bestText: 'You give easily and gladly.', fake: 'Wastefulness',
    warn: 'Gregory warns that “prodigality hides itself under the appellation of liberality”. Throwing money around can pass for generosity.', quote: Q('prodigality hides itself under the appellation of liberality', GREGORY_PR) },
  'pace:left':     { best: 'Promptness', bestText: 'You act while others are still talking.', fake: 'Rushing',
    warn: 'Gregory warns that “precipitate action is taken for the efficacy of promptness”. Rushing in can feel like getting things done, when really you did not stop to think.', quote: Q('precipitate action is taken for the efficacy of promptness', GREGORY_PR) },
  'pace:right':    { best: 'Deliberation', bestText: 'You think before you move.', fake: 'Delay',
    warn: 'Gregory warns that slowness can be mistaken for “the deliberation of seriousness”. Putting something off can feel like thinking it through.', quote: Q('tardiness for the deliberation of seriousness', GREGORY_PR) },
  'strife:right':  { best: 'Peace', bestText: 'You calm things down. You help people get along.', fake: 'Peace at any price',
    warn: 'Gregory warns: “Sloth is frequently looked upon as a maintenance of peace.” Saying nothing when someone needs to hear the truth can feel like keeping the peace. Often it is just the easier path.', quote: Q('Sloth is frequently looked upon as a maintenance of peace', GREGORY_M) },
  'room:right':    { best: 'Humility', bestText: 'You do not need to be the centre.', fake: 'Fear',
    warn: 'Gregory warns that “many are silent through fear, and yet consider that they are silent from humility”. Keeping quiet can feel humble when it is really fear of what people will think.', quote: Q('just as many are silent through fear, and yet consider that they are silent from humility', GREGORY_M) },
  'room:left':     { best: 'Frankness', bestText: 'You say what needs saying.', fake: 'Pride',
    warn: 'Gregory warns that some “speak from the impatience of pride, and yet think that they are speaking with rightful freedom”. Pride can feel like simple honesty.', quote: Q('so do some speak from the impatience of pride, and yet think that they are speaking with rightful freedom', GREGORY_M) },
  'makeup:left':   { best: 'Watchful care', bestText: 'You keep an eye on things, and you act when they need it.', fake: 'Never switching off',
    warn: 'Gregory warns: “Restlessness of spirit is frequently termed a watchful solicitude.” Not being able to switch off can pass for looking after things.', quote: Q('Restlessness of spirit is frequently termed a watchful solicitude', GREGORY_M) },
  'nerve:right':   { best: 'Prudence', bestText: 'You see the risks others miss.', fake: 'Fear',
    warn: 'Gregory warns that “feeble fear is often called, by men, cautious dispensation”. Fear can call itself caution.', quote: Q('For feeble fear is often called, by men, cautious dispensation', GREGORY_M) },
  'comforts:right':{ best: 'Self-control', bestText: 'You can say no to yourself.', fake: 'Pride in going without',
    warn: 'Gregory warns about “the pride of abstinence”. Self-denial can quietly turn into pride. It shows when you look down on people who do not go without.', quote: Q('the pride of abstinence', GREGORY_M) },
  'small:left':    { best: 'Faithfulness in little things', bestText: 'You keep your word in small matters.', fake: 'Missing the big things',
    warn: 'Gregory repeats Christ’s warning: “Straining out a gnat, but swallowing a camel.” Care over small things can leave a big thing unattended.', quote: Q('Straining out a gnat, but swallowing a camel', 'Christ, as Gregory quotes Him') },
  'wins:left':     { best: 'Glad admiration', bestText: 'Other people’s good makes you happy.', fake: 'Watching from the stands',
    warn: 'Gregory describes people who are “eager backers, but inert spectators”. Cheering others on can feel like taking part, when really you are staying in your seat.', quote: Q('eager backers, but inert spectators', GREGORY_PR) },
};

// Your strength and its partner (Moralia I.32.45: the gifts must feed one another).
export const PARTNERS = {
  counsel: { strength: 'Counsel', text: 'You turn things over well.', partner: 'Courage',
    plain: 'You think it through well. The risk is that you never get round to doing it.',
    quote: Q('Counsel is worthless, when the strength of fortitude is lacking thereto, since what it finds out by turning the thing over, from want of strength it never carries on so far as to the perfecting in deed', GREGORY_M) },
  fortitude: { strength: 'Courage', text: 'You act. You are not stopped by fear.', partner: 'Counsel',
    plain: 'You act bravely. The risk is acting before you have thought it through.',
    quote: Q('fortitude is very much broken down, if it be not supported by counsel', GREGORY_M) },
};

// ---------------------------------------------------------------------------------------------------------------
// YOUR LINE IN THE BODY: Cassian's lines of the practical life (Conference 14.4-7), with the people he names.
// ---------------------------------------------------------------------------------------------------------------
export const LINE_TEXT = {
  watcher: { name: 'The Watcher', img: 'elijah', imgWho: 'Elijah', gift: 'Faith',
    giftNote: 'Paul’s lists name no gift of prayer, because prayer is asked of everyone. The nearest is faith: staying sure after other people have stopped expecting.', work: 'prayer and quiet',
    what: 'You serve by praying. Quietly, faithfully, often unseen. The Church has always needed people who keep watch while others work.',
    cassian: 'Cassian names this line first: people who seek “purity of heart” in silence, like Elijah and Elisha, and St Antony in his own day.',
    quote: Q('were joined most closely to God by the silence of solitude', CASSIAN + ', Conferences'),
    tidbit: 'Abba Nastir, a desert father, was asked which way of life is best. He said: “Abraham was a lover of strangers, David was a humble man, Elijah loved silence, and God accepted the work of all of them.”',
    why1: 'You’d gladly pray for someone every day', why2: 'People ask you to pray for them',
    needWhy: 'You keep watch in prayer. The Host opens the door to whoever comes. Abba Nastir put Elijah’s silence beside Abraham’s welcome, and said God accepted both.',
    partner: 'host' },
  shepherd: { name: 'The Shepherd', img: 'benedict-of-nursia', imgWho: 'St Benedict', imgWhy: 'who wrote a rule for monks living together', gift: 'Shepherding', work: 'keeping a community together',
    what: 'You serve by holding people together. You notice who is missing, and you go after them. You make sure no one is left out.',
    cassian: 'Cassian names people who give all their care to the life of a community, like Abbot John, who ran a great monastery near Thmuis.',
    tidbit: 'Gregory wrote the Pastoral Rule, the book this test is built on, for people who lead others. He ends it by turning to himself. He calls himself an ugly painter painting a handsome man. He points others to the shore while the waves still toss him.',
    why1: 'You’d gladly organise so no one is left out', why2: 'People come to you to take charge',
    needWhy: 'You keep the whole group together. The Caregiver stays with the one who cannot keep up. A community needs both, or someone gets left behind.',
    partner: 'caregiver' },
  host: { name: 'The Host', img: 'abraham', imgWho: 'Abraham', gift: 'Hospitality', work: 'hospitality',
    what: 'You serve by opening your door. A meal, a bed, a welcome. People feel at home with you.',
    cassian: 'Cassian names Abraham and Lot. From his own day he names Macarius, who ran a guest house in Alexandria. Macarius was known as “a man of singular courtesy and patience”.',
    tidbit: 'Cassian says a monk should break his own fast for a guest. The fast was his own choice, but welcome is a command.',
    why1: 'You’d gladly cook someone a meal', why2: 'People come to you for a meal or a bed',
    needWhy: 'You open the door. The Watcher prays for whoever comes through it. Abba Nastir put Abraham’s welcome beside Elijah’s silence, and said God accepted both.',
    partner: 'watcher' },
  caregiver: { name: 'The Caregiver', img: 'ephrem', imgWho: 'St Ephrem', gift: 'Mercy', work: 'caring for the sick and struggling',
    what: 'You serve by staying close when things are hard. You sit with people, and you do not leave.',
    cassian: 'Cassian names people who “choose the care of the sick” among the lines God gives.',
    tidbit: 'When famine hit Edessa, St Ephrem, a deacon and hymn-writer, ran the relief himself and set up about three hundred beds for the sick.',
    why1: 'You’d gladly sit with someone through a bad night', why2: 'People want you with them when it’s hard',
    needWhy: 'You stay with the one who is struggling. The Shepherd makes sure the rest are not forgotten while you do.',
    partner: 'shepherd' },
  advocate: { name: 'The Advocate', img: 'ambrose-of-milan', imgWho: 'St Ambrose', gift: 'Encouraging',
    giftNote: 'Paul’s Greek word for this gift comes from the same verb as the word Jesus uses for the Holy Spirit, the Advocate: one called to stand at your side.', work: 'standing up for the oppressed',
    what: 'You serve by taking the side of people who are being treated unfairly. You speak up where others stay quiet.',
    cassian: 'Cassian names people who give themselves to pleading for “the oppressed and afflicted”.',
    tidbit: 'When the emperor Theodosius ordered a massacre in Thessalonica, St Ambrose wrote to him and would not let it pass until the emperor repented in public.',
    why1: 'You’d gladly stand up for someone', why2: 'People come to you to fight their corner',
    needWhy: 'You speak up in public. The Watcher prays in private. A voice raised for other people needs prayer behind it.',
    partner: 'watcher' },
  teacher: { name: 'The Teacher', img: 'gregory-the-great', imgWho: 'St Gregory the Great', gift: 'Teaching', work: 'teaching',
    what: 'You serve by helping people understand. You explain things until they are clear, and you pass them on.',
    cassian: 'Cassian names people who “give themselves up to teaching” as one of the lines God gives.',
    tidbit: 'Gregory warns teachers to drink from their own well first: to listen to what they are about to say before they say it to anyone else.',
    why1: 'You’d gladly explain until it makes sense', why2: 'People come to you to understand things',
    needWhy: 'You meet the need to understand. The Giver meets the need in front of someone. James warns that kind words to a person who is cold and hungry do no good on their own.',
    partner: 'giver' },
  giver: { name: 'The Giver', img: 'martin-of-tours', imgWho: 'St Martin', imgWhy: 'who cut his cloak in two for a freezing beggar', gift: 'Giving', work: 'giving',
    what: 'You serve by giving. Money, time, things. You notice what people need and you meet it.',
    cassian: 'Cassian names people who “give alms to the poor” among the lines God gives.',
    tidbit: 'Gregory says that when we give to someone in need, we are not doing them a favour. We are paying back what was always theirs.',
    quote: Q('we rather pay a debt of justice than accomplish works of mercy', GREGORY_PR),
    why1: 'You’d gladly pay for what someone can’t afford', why2: 'People come to you for what they need',
    needWhy: 'You meet the need in front of you. The Teacher helps people understand what they need and why. Between you, people are both fed and taught.',
    partner: 'teacher' },
};

// The small signals that also push a line up (score.mjs, step 9), as the report names them under "How we got there".
// A signal shows only when it really pushed this person's line: its scale leans the right way by at least 0.3.
export const LINE_SIGNALS = {
  watcher: [{ from: 'makeup', sign: 1, say: 'Your quiet mind' }, { from: 'behind', sign: 1, say: 'You work best behind the scenes' }],
  caregiver: [{ from: 'behind', sign: 1, say: 'You work best behind the scenes' }, { from: 'makeup', sign: 1, say: 'Your quiet mind' }],
  shepherd: [{ from: 'makeup', sign: -1, say: 'Your restless mind' }, { from: 'behind', sign: -1, say: 'You work best out in front' }],
  host: [{ from: 'makeup', sign: -1, say: 'Your restless mind' }],
  giver: [{ from: 'having', sign: -1, say: 'You’re open-handed' }, { from: 'behind', sign: 1, say: 'You work best behind the scenes' }],
  teacher: [{ from: 'talk', sign: -1, say: 'You speak up' }, { from: 'behind', sign: -1, say: 'You work best out in front' }],
  advocate: [{ from: 'strife', sign: -1, say: 'You take a stand' }, { from: 'behind', sign: -1, say: 'You work best out in front' }],
};

export const BODY = {
  stay: 'Cassian’s advice about lines is freeing. Nobody can do all of them. Admire the others, and hold to your own.',
  stayQuote: Q('it is an impossibility for one and the same man to excel at once in all those good deeds', CASSIAN + ', Conferences'),
  farmer: 'Cassian tells of a great abbot who met a married farmer whose holiness amazed him. The farmer gave thanks every morning and evening, gave God the first of every harvest, and muzzled his oxen so they would not graze a neighbour’s field. Your line does not need a monastery.',
  needLead: 'Paul says no part of the body can do without the others.',
  needQuote: Q('The eye cannot say to the hand, ‘I do not need you.’', '1 Corinthians 12:21'),
  gifts: 'Your line here comes from how you answered this test. The spiritual gifts test asks about the gifts themselves: nineteen of them, from Paul’s lists. Take it, and this page will add what it finds.',
};

// ---------------------------------------------------------------------------------------------------------------
// WHO YOU ARE IN CHRIST (page 10, top).
// ---------------------------------------------------------------------------------------------------------------
export const CHRIST = {
  giftOrVictory: 'Is your temperament a gift or a battle? St John Climacus says some people are drawn to silence or gentleness by nature. Others fight their own nature to get there. He ranks the ones who fight higher. What comes easily to you is a gift. What you have fought for is a victory. Neither one is the whole of you.',
  giftSrc: 'St John Climacus, The Ladder, Step 26 (paraphrased; no public-domain English exists)',
};
