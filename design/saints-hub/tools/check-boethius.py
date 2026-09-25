# Checks every quotation and claim-string in research/people/boethius-facts.json against the fetched texts
# in sources/people/boethius/ (gitignored). Read-only: it never writes the facts file.
# Run: python "design/saints-hub/tools/check-boethius.py"
# Builds design/saints-hub/research/people/boethius-facts.json and checks every quotation.
import json, re, sys, os

D = 'C:/Users/Light/Desktop/claude/theology compass/design/saints-hub/sources/people/boethius/'
OUT = 'C:/Users/Light/Desktop/claude/theology compass/design/saints-hub/research/people/boethius-facts.json'

def norm(s):
    s = re.sub(r'\u2060\s*\d+', '', s)          # LacusCurtius footnote marks
    s = re.sub(r'\[\d+\]|\[[A-Z]\]', '', s)      # Gutenberg/CCEL footnote marks
    for a, b in [('\u2019', "'"), ('\u2018', "'"), ('\u201c', '"'), ('\u201d', '"'), ('\u2014', '--'),
                 ('\u2013', '-'), ('\u2011', '-'), ('\u00ad', ''), ('_', ''), ('\u00e6', 'ae'), ('\u00c6', 'Ae')]:
        s = s.replace(a, b)
    s = re.sub(r'\s+', ' ', s)
    s = re.sub(r' ([,.;:?!])', lambda m: m.group(1), s)
    return s.strip().lower()

cache = {}
def text(f):
    if f not in cache:
        cache[f] = norm(open(D + f, encoding='utf-8', errors='replace').read())
    return cache[f]

GUT = 'https://www.gutenberg.org/cache/epub/14328/pg14328-images.html'
CCEL_T = 'https://ccel.org/ccel/boethius/tracts/tracts.'
LOEB_RAW = 'raw-gutenberg-13316.txt'
JAMES_RAW = 'raw-gutenberg-14328-james.txt'
ROLFE = 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Excerpta_Valesiana/2*.html'
PROC5 = 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Procopius/Wars/5A*.html'
PROC7 = 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Procopius/Wars/7D*.html'
HODG = 'https://www.gutenberg.org/cache/epub/18590/pg18590-images.html'
GIBBON = 'https://www.gutenberg.org/cache/epub/893/pg893-images.html'
CE = 'https://www.newadvent.org/cathen/02610b.htm'
SEP = 'https://plato.stanford.edu/entries/boethius/'
PRAV = 'https://www.pravenc.ru/text/%D0%91%D0%BE%D1%8D%D1%86%D0%B8%D0%B9.html'
ASS = 'https://www.vatican.va/archive/ass/documents/ASS-16-1883-84-1-576+supplemento-17-96-ocr.pdf'

F = json.load(open(OUT, encoding='utf-8'))
# ================================================================= CHECK
fails = []; passes = 0
def chk(path, q, files, loose=False):
    global passes
    nq = norm(q)
    for f in files:
        if not f: continue
        t = text(f)
        if loose:
            words = nq.split()
            ok = (' '.join(words[:7]) in t) and (' '.join(words[-6:]) in t)
        else:
            ok = nq in t
        if ok: passes += 1
        else: fails.append(f'{path} [{f}] {q[:70]}')

def walk(o, path):
    if isinstance(o, list):
        for i, x in enumerate(o): walk(x, f'{path}[{i}]')
        return
    if not isinstance(o, dict): return
    for k in ('exact', 'exact2', 'exact_more'):
        if k in o:
            files = [o.get('vol'), o.get('page')]
            chk(f'{path}.{k}', o[k], files)
            if o.get('ccel'): chk(f'{path}.{k}(ccel)', o[k], [o['ccel']], loose=True)
            if o.get('ccel') and not o.get('vol'): pass
    if 'latin' in o and o.get('latin_file'): chk(path + '.latin', o['latin'], [o['latin_file']])
    if 'latin_first' in o: chk(path + '.latin_first', o['latin_first'], [o['latin_file']])
    if 'holder_exact' in o: chk(path + '.holder', o['holder_exact'], [o['holder_file']])
    if 'critics_exact' in o: chk(path + '.critics', o['critics_exact'], [o['critics_file']])
    if 'italian' in o:
        for f in o['italian_files']: chk(path + '.italian', o['italian'], [f])
    for k, v in o.items():
        if isinstance(v, (dict, list)): walk(v, f'{path}.{k}')
walk(F, 'facts')
# extra checks of claims read from files
extra = [
 ('decree sword', 'Ticinum deportatus', 'acta-1883-decree-boetius.txt'),
 ('decree tower', 'in turri occlusus, gladio percussus occubuit', 'acta-1883-decree-boetius.txt'),
 ('decree Leo', 'Leoni Papae XIII', 'acta-1883-decree-boetius.txt'),
 ('pravenc catholic saint', 'св. католич. Церкви (пам. 23 окт.)', 'pravenc-boethius.txt'),
 ('pravenc 1883', '15 дек. 1883', 'pravenc-boethius.txt'),
 ('MW pron', 'bō-ˈē-thē-əs', 'dict-mw-boethius.txt'),
 ('dictcom pron', 'boh- ee -thee- uh s', 'dict-dictcom-boethius.txt'),
 ('CE orphan', 'left an orphan at an early age', 'catholic-encyclopedia-boethius.txt'),
 ('CE born', 'born at Rome in 480', 'catholic-encyclopedia-boethius.txt'),
 ('CE schoolmen', 'depended entirely on Boethius for their knowledge of Aristotle', 'catholic-encyclopedia-boethius.txt'),
 ('SEP born', 'circa 475–7 C.E.', 'sep-boethius.txt'),
 ('SEP 526', 'probably in 526', 'sep-boethius.txt'),
 ('James sole consul', 'He was sole Consul in 510 A.D.', JAMES_RAW),
 ('James head admin', 'head of the whole civil administration', JAMES_RAW),
 ('James 455 miles', 'is 455 Roman miles', JAMES_RAW),
 ('James Timaeus', "The substance of this poem is taken from Plato's 'Timæus,'", JAMES_RAW),
 ('James epilogue cord', "a cord was first fastened round his forehead", JAMES_RAW),
 ('Hodgkin 1 Sept 522', 'on September 1, 522', 'raw-gutenberg-18590-cassiodorus-hodgkin.txt'),
 ('Hodgkin relations', 'were relations of Cassiodorus', 'raw-gutenberg-18590-cassiodorus-hodgkin.txt'),
 ('Hodgkin father consul', 'who was Consul in 487', 'raw-gutenberg-18590-cassiodorus-hodgkin.txt'),
 ('S&R born 480', 'was born about 480 A.D. in Rome', 'raw-ccel-tracts.txt'),
 ('S&R 524', 'brutally put to death in 524', 'raw-ccel-tracts.txt'),
 ('S&R Oxford', 'was in use at Oxford and Cambridge until modern times', 'raw-ccel-tracts.txt'),
 ('Loeb note 43', 'There is no reason to disturb it', LOEB_RAW),
 ('Gibbon Otho', 'the third emperor of the name of Otho removed to a more honorable tomb', 'raw-gutenberg-893-gibbon-vol4.txt'),
 ('Gibbon golden', 'a golden volume not unworthy of the leisure of Plato or Tully', 'raw-gutenberg-893-gibbon-vol4.txt'),
 ('Gibbon tower', 'in the tower of Pavia', 'raw-gutenberg-893-gibbon-vol4.txt'),
 ('Procopius first and last', 'This was the first and last act of injustice', 'dewing-procopius-wars-5-1.txt'),
 ('basilica crypt', 'nella cripta della Basilica di San Pietro in Ciel', 'basilica-ciel-doro-boezio.txt'),
 ('basilica Benedict XVI', 'Benedetto XVI il 22 Aprile 2007', 'basilica-ciel-doro-boezio.txt'),
 ('santodelgiorno political', 'la sua esecuzione ebbe motivazioni politiche', 'santodelgiorno-boezio.txt'),
 ('USCCB 23 Oct', 'Optional Memorial of Saint John of Capistrano', 'usccb-2026-10-23.txt'),
 ('Valesianus Verona', 'at Verona, when the king', JAMES_RAW),
 ('Valesianus baptistery', 'imprisoned in the baptistery of a church', 'rolfe-valesianus2.txt'),
 ('Valesianus unheard', 'pronounced sentence on Boethius without giving him a hearing', 'rolfe-valesianus2.txt'),
 ('Latin baptistery', 'ducti in custodiam ad baptisterium ecclesiae', 'latin-valesianus2.txt'),
 ('Rolfe PD', 'A page or image on this site is in the public domain ONLY if its URL has a total of one * asterisk', 'rolfe-valesianus2.txt'),
 ('Anecdoton Latin', 'Qui regem Theodorichum in Senatu pro Consulatu filiorum luculenta oratione laudavit', 'raw-gutenberg-18590-cassiodorus-hodgkin.txt'),
 ('Anecdoton orator', 'Utraque lingua peritissimus orator fuit', 'raw-gutenberg-18590-cassiodorus-hodgkin.txt'),
 ('Consolation Latin 500 miles', 'quingentis fere passuum milibus procul', LOEB_RAW),
 ('senate decrees', 'the senate, by its decrees concerning me, has made it such', JAMES_RAW),
 ('James poem 1', 'Now perforce in tears and sadness Learn a mournful strain to raise.', JAMES_RAW),
 ('James reminiscence', "If Plato's teaching erreth not, We learn but that we have forgot.", JAMES_RAW),
 ('James never before', 'a boon which she had never before granted to any private person', JAMES_RAW),
 ('James exile', 'This very place which thou callest exile is to them that dwell therein their native land', JAMES_RAW),
 ('James Symmachus', 'a man whose splendid character does honour to the human race', JAMES_RAW),
 ('James note-book', 'Her right hand held a note-book; in her left she bore a staff', JAMES_RAW),
 ('James Decoratus', 'sharing office with Decoratus', JAMES_RAW),
 ('Eutyches chewing', 'chewing the cud of constant meditation', LOEB_RAW),
 ('Eutyches 512', 'of Boethius’s tractate was 512', 'ccel-tracts-iv.v.txt'),
 ('Eutyches dedication', 'TO HIS SAINTLY MASTER AND REVEREND FATHER', LOEB_RAW),
 ('Hamlet check', 'HAMLET. Why, then', 'raw-gutenberg-1524-hamlet.txt'),
 ('Dante Inferno teacher', 'and that thy Teacher knows', 'raw-gutenberg-1001-longfellow.txt'),
 ('Trinity limit', "We should not of course press our inquiry further than man's wit and reason are allowed to climb the height of heavenly knowledge", LOEB_RAW),
 ('Tractate II full', 'If I am right and speak in accordance with the Faith, I pray you confirm me.', LOEB_RAW),
 ('hatred', 'for the wise no place is left for hatred', JAMES_RAW),
 ('hopes prayers', 'Our hopes and prayers also are not fixed on God in vain', JAMES_RAW),
 ('CE validiora', 'more potent remedies ( validiora remedia )', 'catholic-encyclopedia-boethius.txt'),
 ('S&R luke-warm', 'a pagan, or at best a luke-warm Christian, who at the end cast off the faith', 'raw-ccel-tracts.txt'),
 ('S&R neoplatonic', "it is all his own", 'raw-ccel-tracts.txt'),
 ('S&R orders', 'In the Consolation he is writing philosophy; in the Tractates he is writing theology.', 'raw-ccel-tracts.txt'),
 ('Hodgkin theist', 'is that of a Theist only', 'raw-gutenberg-18590-cassiodorus-hodgkin.txt'),
 ('CE Pope John', 'addressed to John the Deacon (afterwards Pope John I )', 'catholic-encyclopedia-boethius.txt'),
 ('Proc Amalasuntha', 'Amalasuntha', 'dewing-procopius-wars-5-1.txt'),
 ('Proc Totila', 'But Totila would not permit her to suffer any harm', 'dewing-procopius-wars-7D.txt'),
 ('Proc statues', 'she had destroyed the statues of Theoderic', 'dewing-procopius-wars-7D.txt'),
 ('Proc fled bed', 'he retired running to his own chamber', 'dewing-procopius-wars-5-1.txt'),
 ('Proc Elpidius', 'his physician Elpidius', 'dewing-procopius-wars-5-1.txt'),
 ('Val Symmachus killed', 'to be put to death under a false accusation', 'rolfe-valesianus2.txt'),
 ('Val John died', 'a few days later Johannes died', 'rolfe-valesianus2.txt'),
 ('Val sentence exile note', 'The sentence of death had been changed to exile.', 'rolfe-valesianus2.txt'),
 ('Val Calvenzano note', 'Calvenzano Milanese (MI), which being only 15 km NE of Pavia', 'rolfe-valesianus2.txt'),
 ('Hodgkin clovis date', 'probably about 503 or 504', 'raw-gutenberg-18590-cassiodorus-hodgkin.txt'),
 ('Hodgkin 1.10', 'KING THEODORIC TO BOETIUS[223], VIR ILLUSTRIS AND PATRICIAN.'.replace('[223]', ''), 'raw-gutenberg-18590-cassiodorus-hodgkin.txt'),
 ('Hodgkin moneyers', 'Frauds of the moneyers', 'raw-gutenberg-18590-cassiodorus-hodgkin.txt'),
 ('Loeb Latin heading', 'ANICII MANLII SEVERINI BOETHII V.C. ET INL. EXCONS. ORD. EX MAG. OFF. PATRICII', LOEB_RAW),
 ('Vaticannews anima santa', 'lo chiamava “anima santa”', 'vaticannews-boezio.txt'),
 ('Vaticannews date', 'dove verrà giustiziato il 23 ottobre 524', 'vaticannews-boezio.txt'),
 ('Vaticannews Giustiniano', 'imperatore bizantino Giustiniano', 'vaticannews-boezio.txt'),
 ('SEP eternity influence', 'became the starting-point for almost every later medieval discussion of God and time', 'sep-boethius.txt'),
 ('SEP plan 516', 'announced in the second commentary on On Interpretation (c. 516)', 'sep-boethius.txt'),
 ('SEP Greek', 'ensured that he was taught Greek thoroughly', 'sep-boethius.txt'),
 ('SEP magic', 'Accused of treason and of engaging in magic', 'sep-boethius.txt'),
 ('CE astrology', 'the practice of astrology', 'catholic-encyclopedia-boethius.txt'),
 ('CE eighth century', 'In the eighth century this tradition had assumed definite shape', 'catholic-encyclopedia-boethius.txt'),
 ('Pravenc Chartres', 'на портале собора в Шартре', 'pravenc-boethius.txt'),
 ('Pravenc 721', 'В 721 г. по приказу лангобардского кор. Лиутпранда', 'pravenc-boethius.txt'),
 ('Pravenc Augustine', 'где также пребывают мощи блж. Августина', 'pravenc-boethius.txt'),
 ('Pravenc Marius', 'в 524 (по датировке бургундского хрониста VI в. Мария из Аванша) или в 526 г.', 'pravenc-boethius.txt'),
 ('James frontispiece', 'Narius Manlius Boethius, the father of the philosopher', JAMES_RAW),
 ('James preface alternate', 'with its alternate prose and verse, skilfully fitted together like dialogue and chorus in a Greek play', JAMES_RAW),
 ('James unsought', 'the highest honours of the State came to him unsought', JAMES_RAW),
 ('James Rusticiana', 'his wife, Rusticiana', JAMES_RAW),
 ('James various offences', 'men who for many and various offences', JAMES_RAW),
 ('Getty in art LFF none', 'Lesser Feasts', 'lff2022.txt'),
]
for name, q, f in extra:
    chk('extra.' + name, q, [f])
# absence checks
absent = [('cofe-calendar.txt', r'boeth|boetius|severinus'), ('lff2022.txt', r'boeth|boetius'), ('lcms-commemorations.txt', r'boeth|boetius|severinus'),
          ('elw-churchyear.txt', r'boeth|boetius|severinus'), ('oca-lives-2026-10-23.txt', r'boeth'), ('site-personality', None)]
for f, pat in absent:
    if f == 'site-personality':
        t = open('C:/Users/Light/Desktop/claude/theology compass/site/src/data/personality.json', encoding='utf-8').read().lower()
        ok = 'boeth' not in t
    else:
        ok = re.search(pat, text(f)) is None
    if ok: passes += 1
    else: fails.append('absent ' + f)
# poem/prose count
songs = len([x for x in os.listdir(D) if re.match(r'james-b\d-song\d+\.txt', x)])
proses = len([x for x in os.listdir(D) if re.match(r'james-b\d-prose\d+\.txt', x)])
if songs == 39 and proses == 39: passes += 1
else: fails.append(f'count songs={songs} proses={proses}')

print('passed', passes, 'failed', len(fails))
for x in fails: print('FAIL', x)
sys.exit(1 if fails else 0)
