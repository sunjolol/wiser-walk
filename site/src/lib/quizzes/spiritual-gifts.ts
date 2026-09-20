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
 *     substring of that file. Never retype one from memory.
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
 * the reader who scores highest there. Three things are named and NOT scored, in
 * `notes.omitted`: apostles (1 Corinthians 12:28; Ephesians 4:11), the gift Paul names when
 * he writes of remaining unmarried (1 Corinthians 7:7), and the gift given with the laying
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

/** The plain description that follows the quotation in each summary. */
const PLAIN: Record<string, string> = {
  serving:
    'Romans says service and 1 Corinthians says helps, and this quiz treats them as one: doing the practical work that other people’s work depends on.',
  teaching: 'Making a thing understood, and staying with a person until it is.',
  encouraging:
    'The translation quoted here says exhorting where many others say encouraging: speaking so that someone takes heart and keeps going.',
  giving:
    'Letting money and possessions go where they are needed; nothing here counts how much.',
  healing:
    'The translation quoted here says gifts of healings, with both words in the plural, and Paul asks, “Do all have gifts of healings?” (1 Corinthians 12:30). These statements ask what has happened when you prayed for people who were ill, and whether people come to you because of it. They cannot tell this gift apart from an answer to prayer, and James asks that prayer of everyone: “pray for one another, that you may be healed” (James 5:16). Nothing here counts how much anyone prays. Whether what happened was this gift is for your church and those who lead it to say, not this page. Many Christians believe God still gives this gift today; many believe he gave it only for the time of the apostles. Both believe that God still heals and answers prayer.',
  leading:
    'The translation quoted here says rules where many others say leads: taking on the direction of a shared work and answering for it.',
  // Not "staying, with nothing to fix": both cited acts are practical relief (Tabitha made
  // garments, Onesiphorus sought Paul out and refreshed him).
  mercy: 'Going towards people in distress and doing what eases it.',
  knowledge:
    'The passage names a word of knowledge, something said, and nowhere explains it, and Christians read it in more than one way. These statements ask about two things: having what the Bible and Christian teaching say ready when people need it, and knowing a fact about someone that nobody had told you. Two of the three ask about the first, so a reader with only the second will see this row fill less. They cannot see how you came to know anything. The New Testament calls no recorded act a word of knowledge, so the passages below are not acts: they are three places where Paul writes of knowledge in a church. Whether what happened was this gift is for your church and those who lead it to say, not this page. Many Christians believe God still gives this gift today; many believe he gave it only for the time of the apostles.',
  administration:
    'The translation quoted here says governments where many others say administration or guidance: keeping the order that a shared work runs on.',
  wisdom:
    'The passage names a word of wisdom, something said, and does not explain it. These statements can see only the everyday pattern of being brought hard choices and asked what to do. This is not the wisdom Catholic teaching counts among the seven gifts of the Holy Spirit (Isaiah 11:2); this page is about Paul’s list. Paul names this in the same sentence as healing, miracles and tongues (1 Corinthians 12:8-10), and Christians disagree about which of the gifts in that sentence God still gives today.',
  miracles:
    'The translation quoted here says workings of miracles, and later “miracle workers” (1 Corinthians 12:28). Luke writes that “God worked special miracles by the hands of Paul” (Acts 19:11). These statements ask what has happened when you prayed and what the people who were there called it. They call nothing a miracle themselves, and they cannot tell this gift apart from an answer to prayer. Whether what happened was this gift is for your church and those who lead it to say, not this page. Many Christians believe God still gives this gift today; many believe he gave it only for the time of the apostles.',
  discernment:
    'The passage names the discerning of spirits and does not explain it. Of prophets speaking in church Paul writes, “let the others discern” (1 Corinthians 14:29), and John writes, “test the spirits, whether they are of God” (1 John 4:1). These statements ask whether you look into what you are told before you accept it, and what has happened when you weighed something taught about God or said to be from him. They say nothing about how you knew, and they are not about first impressions of people. Nor do they ask about telling what is moving your own thoughts and desires, which many Christians also call the discernment of spirits and take to a confessor or spiritual father. Paul names this in the same sentence as healing, miracles and tongues (1 Corinthians 12:8-10), and Christians disagree about which of the gifts in that sentence God still gives today.',
  faith:
    'Listed as something given to some and not to others, so it is not about whether you believe. These statements look only for a habit of staying sure, and saying so, after other people have stopped expecting a thing to come right, and for people coming to ask whether you still are. Paul elsewhere writes of “all faith, so as to remove mountains” (1 Corinthians 13:2). Paul names this in the same sentence as healing, miracles and tongues (1 Corinthians 12:8-10), and Christians disagree about which of the gifts in that sentence God still gives today.',
  prophecy:
    'Paul says what it is for: “he who prophesies speaks to men for their edification, exhortation, and consolation” (1 Corinthians 14:3), that is, to build them up, encourage them and comfort them. He also writes, “let the others discern”, and, “if a revelation is made to another sitting by, let the first keep silent” (1 Corinthians 14:29-30). These statements ask whether you have said what you believed God gave you to say, and what people said afterwards. A preacher can agree with them, and so can a friend whose advice came at the right time; the statements cannot see more than that. 1 Corinthians 12:28 and Ephesians 4:11 also name prophets among the people given to the church; a result here names a pattern and says nothing about whether anybody is a prophet. Whether what happened was this gift is for your church and those who lead it to say, not this page. Many Christians believe God still gives this gift today; many believe he gave it only for the time of the apostles.',
  evangelism: 'Telling the good news to people who have not heard it or do not hold it.',
  shepherding:
    'Many translations say pastors: watching over the same people for a long time. Ephesians 4:11 names people given to the church, and both passages below are addressed to elders; a result here names a pattern of care and says nothing about who should hold an office.',
  tongues:
    'The translation quoted here says different kinds of languages where many others say tongues: speaking or praying in a language the speaker has never learnt. At Pentecost “everyone heard them speaking in his own language” (Acts 2:6); to Corinth Paul writes that such a speaker “speaks not to men, but to God, for no one understands” (1 Corinthians 14:2). This page does not say whether those are the same thing. These statements ask whether you have prayed or spoken in words from no language you know, on your own, and at church with an interpretation then given. The row fills only when both are true, because the second is what Paul asks of a church; where nobody interprets he tells the speaker to “keep silent in the assembly, and let him speak to himself and to God” (1 Corinthians 14:27-28), so a row part of the way up is no mark against you. The statements cannot say what those words were. Whether what happened was this gift is for your church and those who lead it to say, not this page. Many Christians believe God still gives this gift today; many believe he gave it only for the time of the apostles.',
  hospitality:
    'Peter asks hospitality of everyone and speaks of each person’s gift in the next sentence, so coming out low here releases nobody from the first.',
  interpretation:
    'The translation quoted here says the interpretation of languages: giving a church the meaning of what was said in a language it does not know, so that, in Paul’s words, “the assembly may be built up” (1 Corinthians 14:5). Acts never shows anyone doing it; what the New Testament has is Paul’s instructions to Corinth, below. These statements ask whether you have said what you believed such speech meant, and whether people at church look to you for it. They cannot say whether any meaning given was right. Whether what happened was this gift is for your church and those who lead it to say, not this page. Many Christians believe God still gives this gift today; many believe he gave it only for the time of the apostles.'
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
    { ref: 'Acts 9:17-18', what: 'Ananias entered the house and, laying his hands on Saul, told him that the Lord who had appeared to him on the road had sent Ananias so that he might receive his sight and be filled with the Holy Spirit; immediately something like scales fell from Saul’s eyes and he received his sight, and he arose and was baptised.' },
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
    { ref: '1 Corinthians 1:4-7', what: 'Paul writes that he always thanks his God for the grace of God given to the Corinthians in Christ Jesus: that in everything they were enriched in him, in all speech and all knowledge, even as the testimony of Christ was confirmed in them, so that they come behind in no gift, waiting for the revelation of our Lord Jesus Christ.' },
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
    { ref: 'Galatians 3:5', what: 'Paul asks the Galatians whether he who supplies the Spirit to them and does miracles amongst them does it by the works of the law or by hearing of faith.' },
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
    { ref: 'Acts 13:1-3', what: 'In the church at Antioch there were prophets and teachers; as they served the Lord and fasted, the Holy Spirit said to separate Barnabas and Saul for the work to which he had called them, and when they had fasted and prayed and laid their hands on them, they sent them away.' },
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
  ['tongues', 'tongues', 'tongues'],
  ['hospitality', 'hospitality', 'hospitality'],
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
const groups: QuizGroup[] = GIFTS.map(([key, slug, name]) => ({
  key,
  slug,
  name,
  summary: summaryOf(key),
  quoted: giftSources[key]!,
  quotedFrom: WEBBE,
  acts: giftActs[key]!,
  ...(WRITTEN_NOT_DONE.includes(key)
    ? {
        actsHeading: 'What Paul writes about it',
        actsKicker: `${giftActs[key]!.length} passages, each cited`
      }
    : {})
}));

/**
 * Three per gift, in the order [key, text, direction]. Direction was re-derived from the
 * final wording: +1 where agreeing describes the gift's pattern, -1 where agreeing describes
 * its absence. Provenance for every line is in audit/new-quizzes/gifts-all-final.md.
 *
 * Each gift has exactly one reverse-keyed item, exactly one statement about what other
 * people bring you or say of you, and one about what you do or what has happened. The
 * reverse-keyed item sits in a different slot from gift to gift so that the running order
 * below never produces a round that is all reverse items.
 */
const RAW: Array<[string, string, 1 | -1]> = [
  ['serving', 'When something practical needs doing, I have usually started before anyone asked me to.', 1],
  ['serving', 'When there is clearing up to do, I am usually still talking to someone.', -1],
  ['serving', 'People ask me when an errand needs running or a form needs filling in, and I usually say yes.', 1],

  ['teaching', 'People come to me to have something explained, even when they only wanted the short answer.', 1],
  ['teaching', 'I check whether the other person actually followed me before I move on.', 1],
  ['teaching', 'I would rather send somebody a good link than sit down and walk them through it.', -1],

  ['encouraging', 'When a friend is hesitating, I leave them to decide rather than press them.', -1],
  ['encouraging', 'People come to me when they need a push to do the thing they are avoiding.', 1],
  ['encouraging', 'I tell people what I think they are capable of, even when they have not asked.', 1],

  ['giving', 'I give away things I am still using when somebody needs them more than I do.', 1],
  ['giving', 'Even when I can afford it, I look for a way to help other than money.', -1],
  ['giving', 'People tell me when someone they know is going without, and I usually find something to give.', 1],

  ['healing', 'People have asked me to pray for them because someone they know got better after I prayed.', 1],
  ['healing', 'When somebody is ill, I am more likely to bring them a meal than to pray with them.', -1],
  ['healing', 'More than once, someone I prayed for has recovered when the people around them did not expect it.', 1],

  ['leading', 'People have put me in charge of things I did not ask to run.', 1],
  ['leading', 'I end up answering for how the whole thing went, including parts other people did.', 1],
  ['leading', 'I would rather be told where we are going than be the one to decide it.', -1],

  ['mercy', 'I keep my distance from people in distress until I know how to help.', -1],
  ['mercy', 'When somebody starts crying, I move closer rather than give them room.', 1],
  ['mercy', 'People turn to me when they are at their lowest, even people I do not know well.', 1],

  ['knowledge', 'In a discussion I end up quoting the part of the Bible people were trying to remember.', 1],
  ['knowledge', 'People have asked me how I knew something about them that nobody had told me.', 1],
  ['knowledge', 'When a question about what Christians believe comes up, I am the one asking rather than answering.', -1],

  ['administration', 'When plans are loose, I write them down and send them round without being asked.', 1],
  ['administration', 'When a group makes plans, I leave it to someone else to keep the list.', -1],
  ['administration', 'People send me the details because they know I will keep track of them.', 1],

  ['wisdom', 'When two good options are on the table, people ask me which one to take.', 1],
  ['wisdom', 'In an argument I end up saying what I think the disagreement is actually about.', 1],
  ['wisdom', 'When a friend asks my advice, I tell them what I would do myself.', -1],

  ['miracles', 'People who were there have used the word miracle for something that happened when I prayed.', 1],
  ['miracles', 'Remarkable answers to prayer are things I hear about from others, not things I have been part of.', -1],
  ['miracles', 'I have prayed for something the others there thought impossible, and it happened.', 1],

  ['discernment', 'I take a new idea as it sounds rather than look into where it came from.', -1],
  ['discernment', 'I have stopped listening to a speaker or writer I liked because of what they taught about God.', 1],
  ['discernment', 'I have raised a worry about something said to be from God, and the people I took it to later agreed.', 1],

  ['faith', 'I keep telling people a thing will come right after they have stopped expecting it.', 1],
  ['faith', 'When the odds look bad, I am among the first to say we should stop.', -1],
  ['faith', 'When everyone else has given up on something, people ask me whether I still think it will happen.', 1],

  ['prophecy', 'I leave it to others to say what they believe God is saying.', -1],
  ['prophecy', 'People have told me that something I said to them was what God wanted them to hear.', 1],
  ['prophecy', 'I have said something at church that I believed God had given me to say.', 1],

  ['evangelism', 'I end up talking about God with people I have only just met.', 1],
  ['evangelism', 'People who do not go to church ask me questions about God.', 1],
  ['evangelism', 'I keep what I believe to myself unless somebody asks me directly.', -1],

  ['shepherding', 'I give people what they need at the time and let it end there.', -1],
  ['shepherding', 'I keep following up with the same few people long after everybody else has moved on.', 1],
  ['shepherding', 'People I helped years ago still come back to me when something goes wrong.', 1],

  ['tongues', 'Every word I have ever prayed was one I knew or had been taught.', -1],
  ['tongues', 'I have prayed in words that belong to no language I know and that nobody taught me.', 1],
  ['tongues', 'At church I have spoken in words from no language I know, and an interpretation was then given.', 1],

  ['hospitality', 'I add a seat for whoever turns up rather than keep to the numbers I planned for.', 1],
  ['hospitality', 'I would rather meet people somewhere out than have them in my home.', -1],
  ['hospitality', 'When someone new turns up, they usually end up sitting with me.', 1],

  ['interpretation', 'When someone speaks in a language nobody there knows, I have no idea what it means.', -1],
  ['interpretation', 'People at church look to me for the meaning when someone speaks in a language nobody there knows.', 1],
  ['interpretation', 'When someone has spoken in a language nobody there knew, I have told the others what I believed it meant.', 1]
];

const keys = groups.map(g => g.key);
const PER = 3;

/**
 * The running order. A reader meets one statement at a time, and three in a row about the
 * same gift would announce the gift, so the instrument runs in three rounds of nineteen:
 * round r takes each gift's r-th statement, and each round walks the gifts from a different
 * start with a different stride (19 is prime, so every stride visits every gift once). No two
 * statements from one gift are ever adjacent, and the pairs a reader would read as one
 * question asked twice never sit side by side: prophecy with knowledge, wisdom, discernment
 * or encouraging; knowledge with wisdom, discernment or teaching; healing with miracles,
 * faith or mercy; miracles with faith or mercy; tongues with interpretation — and the nine
 * pairs the first edit kept apart. The last statement is not one of the six, so nobody
 * finishes on the contested ground. engine-test.mjs asserts all of it.
 */
const ROUNDS: Array<[start: number, stride: number]> = [[0, 1], [14, 7], [8, 12]];

const ordered: Array<[string, string, 1 | -1]> = ROUNDS.flatMap(([start, stride], r) =>
  keys.map((_, k) => RAW[((start + k * stride) % keys.length) * PER + r]!)
);

const items: QuizItem[] = ordered.map(([key, text, direction], i) => ({
  n: i + 1,
  text,
  group: keys.indexOf(key),
  direction
}));

/**
 * The honest frame. The blueprint requires it on the intro and on the result. The Quiz type
 * has no slot for it yet, so it is exported for the engineer to place.
 *
 * The blueprint's own wording is "for the common good"; the translation on disk says "for the
 * profit of all" (1 Corinthians 12:7), and this site quotes the text on disk.
 */
export const giftsFrame = {
  translation: WEBBE,
  intro:
    'Scripture gives lists of gifts. It gives no test for finding which are yours. It says the ' +
    'Spirit gives them, “distributing to each one separately as he desires” (1 Corinthians ' +
    '12:11), and that each is given “for the profit of all” (1 Corinthians 12:7). So this is a ' +
    'conversation starter, not a verdict: fifty-seven statements cannot see your last ten ' +
    'years, and the people who have watched you serve can. If you know the lists you will ' +
    'sometimes see which gift a statement is about, and with a few, such as tongues and ' +
    'healing, there is no honest way to ask without showing it. That is one more reason to ' +
    'take the result to your pastor or priest and to one or two people who have served ' +
    'alongside you, and ask them whether it is true. Catholic readers usually call the gifts ' +
    'in these lists charisms, and keep “the gifts of the Holy Spirit” for the seven that ' +
    'Catholic teaching draws from Isaiah 11:2; this page is about the first.',
  /** The one line for above the start button on a phone, if the full intro sits below it. */
  introShort:
    'Scripture lists gifts and gives no test for finding which are yours; ask your pastor or priest and the people who have watched you serve.',
  result:
    'This is where your answers pointed. It is not a measurement of what God has given you. ' +
    'No one is summed up by one row of this page, the list here is not everything Scripture ' +
    'names, and a self-report can be wrong in both directions, about what you avoid as much ' +
    'as what you are good at. Some of the everyday patterns here are temperament as much as ' +
    'gift, and these statements cannot tell the two apart. Where a statement asks what has ' +
    'happened or what people said, this page does not say what any event was. Some rows ask ' +
    'about habits and some ask whether a thing has ever happened; one occasion can fill a row ' +
    'of the second kind, so the order of the rows is not an order of strength. The useful ' +
    'step is not to believe this page. It is to take it to your pastor or priest, and to ' +
    'somebody who has served alongside you, and ask whether it matches what they have seen.',
  /** What a low row means. Must print wherever a gift is shown below the line. */
  low:
    '“As each has received a gift, employ it in serving one another” (1 Peter 4:10). A gift ' +
    'low on this page is something these statements did not find, not a verdict on you. And ' +
    'some of these are asked of everyone: “Be hospitable to one another without grumbling” ' +
    '(1 Peter 4:9) comes one verse earlier.',
  /** Replaces the strategy's flat-state summary for this quiz. */
  flat:
    '“As each has received a gift, employ it in serving one another” (1 Peter 4:10). ' +
    'Fifty-seven statements found nothing standing out. That is a fact about the ' +
    'statements, not about you; ask the people who have watched you serve.',
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
    'Christians reading the same passages disagree about whether prophecy, healing, miracles, ' +
    'tongues, their interpretation and the word of knowledge are given today. Paul names all ' +
    'six in one sentence with the word of wisdom, faith and the discerning of spirits ' +
    '(1 Corinthians 12:8-10), and Christians disagree about which of the gifts in that ' +
    'sentence God still gives. Those who believe they are given differ on how eagerly to seek ' +
    'them: Pentecostal and charismatic Christians seek them openly, while Catholic and ' +
    'Orthodox teaching receives them with gratitude and warns against seeking them rashly. ' +
    'This page takes no side: it quotes each passage, asks what has happened and what people ' +
    'have said, and does not say what any of it was, whether a miracle, a healing, a word from ' +
    'God or none of these. A reader who believes these gifts are not given today can answer ' +
    'every statement truthfully, and a row can still fill for that reader, because the ' +
    'statements ask what happened and not what it was. A high row does not say that you have ' +
    'that gift, and a low row does not say that you have not.',
  /** Link this to the Compass axis with groupHref(): its slug is `gifts`, its key is `spirit`. */
  disputedLink:
    'The Theology Compass sets that disagreement out in both sides’ own words.',
  /**
   * The line above the answer scale. It must not send a reader to "Unsure / neither": that
   * answer on the event statements, with "disagree" on the reverse items, scores 67 on all
   * six of the disputed rows, which is a fact about the keying and not about the reader.
   */
  scale:
    'Agree means the sentence is true of you as it is written; disagree means it is not. If a ' +
    'sentence says a thing has happened and it never has, disagree is an honest answer. Some ' +
    'sentences say a thing has not happened, so read each one to the end.',
  /*
   * The sentence that travels with the six names, on the page and on the card alike.
   *
   * A sentence printed beside a name on the result page and missing from the picture someone
   * posts is the fairness problem, not a formatting detail, so both surfaces read it from the
   * same field. It prints ONCE however many of the six are named, and never as a mark on a
   * row: it is a sentence under the headline, and nothing is attached to a gift.
   */
  sixResult:
    'Christians disagree about whether prophecy, healing, miracles, tongues, interpreting ' +
    'tongues and the word of knowledge are given today. A high row records answers about what ' +
    'has happened and what people have said. It does not say what any of it was.',
  sixShare:
    'Christians disagree about whether some of these gifts are given today. These rows record ' +
    'answers about what has happened and what people said, not what any of it was.'
} as const;

export const spiritualGifts: Quiz = {
  slug: 'spiritual-gifts',
  title: 'What are your spiritual gifts?',
  tagline: 'Fifty-seven statements, nineteen gifts, and a conversation to have afterwards.',
  description:
    'Nineteen gifts the New Testament names, prophecy, healing and tongues among them, each ' +
    'in its passage’s own words. Fifty-seven plain statements about what you do and what has ' +
    'happened. Scripture gives no test for gifts, so take the result to your pastor or priest ' +
    'and to people who know you.',
  icon: 'scroll',
  minutes: 8,
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
  // The highest-category strategy ranks the groups themselves; it reads no outcomes.
  outcomes: [],
  strategy: category,
  /** A gift, not a category: the hub counts "19 gifts" wherever it counts groups in words. */
  groupNoun: 'gift',
  groupNounPlural: 'gifts',
  config: {
    // Three items per group: raw runs -6..+6, so 13 reachable scores per group. The registry
    // checks this (items * 4 + 1). 13^19 is about 1.5e21, well past the safe-integer limit,
    // so makeCodec hands this quiz the wide (BigInt) codec; the Compass, at 13^6, still gets
    // the narrow one and its live permalinks are produced exactly as before.
    radix: 13,
    // Points a gift must clear above no-net-agreement before it is named at all. Each gift has
    // two forward statements and one reverse, so a reader who agrees with everything scores 67
    // on all nineteen. At the sins quiz's floor of 10 that reader would be handed two gifts
    // chosen by the alphabet. At 17 they are told nothing stood out, which is true, and a gift
    // is named from 75 up: net agreement worth three of the six available points. Every row
    // named must clear it ITSELF, not merely sit within a rung of one that does.
    namingFloor: 17,
    // One rung is the difference between "agree" and "strongly agree" on a single statement.
    // With nineteen categories that is too little to separate a first from a second, so two
    // gifts one rung apart are reported as level.
    tieSteps: 1
  },
  shareTitle: 'Where my answers pointed: spiritual gifts',
  codePrefix: 'SG',

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
    },
    omitted: {
      // No link: see giftsFrame.notScored. The argument is `disputed`'s, and so is the link.
      text: giftsFrame.notScored
    }
  },

  /**
   * The sentence that travels with six of the nineteen names, wherever a name is printed.
   *
   * By group KEY, and the engine resolves the slugs: the rule is the NAME, so it fires when
   * the headline names one of them and when the share text prints one of them, once either
   * way, and never when none is named. Nothing is attached to a row anywhere.
   */
  groupNote: {
    groups: ['prophecy', 'healing', 'miracles', 'tongues', 'interpretation', 'knowledge'],
    result: giftsFrame.sixResult,
    share: giftsFrame.sixShare
  },

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
    // The top three only. The bottom of a gifts ranking is the part a reader would least
    // want pasted into a group chat, and the caveat that travels with a low row on the page
    // cannot travel with a bar in a text message.
    shareTop: 3
  }
};
