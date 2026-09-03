const fs = require('fs');

const d = {};
d.note = "Revised data set for theology-compass.html after the twenty-lens fairness audit (522 findings; 424 survived a three-lens accuracy/fairness/necessity verification). Scores run 0..100 per axis: 0 = left pole, 100 = right pole. Every change is itemised in the changelog array; kept findings deliberately not applied are in the disputed array. Some kept findings are code or page-copy changes that apply.js does not regenerate; those changelog entries are marked 'page copy / code'.";

d.scoring = {
  response_scale: { "Strongly disagree": -2, "Disagree": -1, "Unsure": 0, "Agree": 1, "Strongly agree": 2 },
  statement_direction: "+1 means agreeing pushes toward the RIGHT pole of the axis, -1 toward the LEFT pole",
  axis_raw: "sum over the three statements of (direction * response), range -6..+6",
  axis_score: "round((raw + 6) / 12 * 100), so 0 = fully left pole, 50 = center, 100 = fully right pole",
  bands: "score <= 20 -> bands[0], 21-40 -> bands[1], 41-59 -> bands[2], 60-79 -> bands[3], >= 80 -> bands[4]",
  headline: "candidates are the axes whose band is not the middle band, ordered by |score - 50| descending, ties broken by the number of Strongly answers on that axis and then by axis order; take at most three and join their band adjectives. No candidates -> 'Near the center on every axis'; one or two candidates -> those adjectives alone.",
  nearest_tradition: "Euclidean distance in the six-dimensional 0..100 space to each tradition position; the two smallest are shown as 'Nearest on the map'. match % = round(100 - distance / 195 * 100), 195 being the largest distance between any two listed traditions (Eastern Orthodox to Bible church). If the two nearest are within 10 units of each other, show them as jointly nearest rather than ranked; if the nearest is more than 60 units away, read 'No listed tradition is a close fit. Nearest, loosely: X, Y'; if all six axes are within 10 of 50, name no tradition at all.",
  permalink: "each axis stored as round(score * 12 / 100) (0..12), packed base 13, rendered base 36 and left-padded to six characters, so every reachable score round-trips exactly"
};

const A = [];
A.push({
  index: 0, key: "grace", name: "Grace", left_pole: "Monergist", right_pole: "Synergist",
  bands: ["firmly monergist", "monergist-leaning", "balanced on grace", "synergist-leaning", "firmly synergist"],
  fair_summary: "Monergists (God alone brings a person to faith) hold that salvation is God's work from beginning to end: God chooses his people, calls them, and works faith in them; the sinner contributes nothing to conversion, not even the decision to believe. Monergists differ on whether that grace can be resisted: the Reformed hold that it makes the unwilling willing and cannot finally be refused, and that God keeps his people to the end; Lutherans hold that it can be refused, even to the end, so that the lost are lost by their own resistance and not by God's decree. Synergists (the person freely cooperates with the grace God gives) hold that God's grace always comes first and makes faith possible, but that each person must freely respond and can decline, so that election follows God's foreknowledge of faith or rests on his choice of a people in Christ. Many synergists, including most Baptists, nonetheless hold that God keeps every true believer to the end. Protestants on this side usually call themselves Arminian or Wesleyan; the Christian East speaks of synergy.",
  history: [
    { when: "c. 411-430", what: "Augustine argues against Pelagius that grace must precede and enable every good will." },
    { when: "c. 428", what: "John Cassian, Conferences XIII, teaches that grace and free will cooperate at every step; the Christian East still calls this synergy." },
    { when: "529", what: "Second Council of Orange: even the beginning of faith is God's gift, yet it condemns any predestination to evil and says the baptized can, with Christ's help, do what salvation requires." },
    { when: "1525", what: "Luther, The Bondage of the Will, answers Erasmus's defense of free choice." },
    { when: "1547", what: "Council of Trent, Decree on Justification: grace comes first and enables, yet the will freely cooperates and can refuse." },
    { when: "1577", what: "Formula of Concord (arts. II, XI): conversion is God's work alone, yet grace can be resisted and no one is predestined to damnation." },
    { when: "1610-19", what: "The Remonstrance sets out five Arminian articles; the Synod of Dort replies with five points." },
    { when: "1672", what: "Synod of Jerusalem condemns the Calvinist confession published under Patriarch Cyril Lucaris's name: God predestines according to his foreknowledge of each person's free use of the will." },
    { when: "1739-41", what: "Wesley's sermon Free Grace and Whitefield's printed reply divide the evangelical revival over predestination." }
  ],
  key_passages: ["Romans 9", "Romans 8:28-30", "Ephesians 1:3-14", "John 6:37-44", "1 Timothy 2:3-4", "2 Peter 3:9", "Acts 7:51", "Philippians 2:12-13"],
  read_more: {
    left: ["Luther, The Bondage of the Will", "Calvin, Institutes III", "Sproul, Chosen by God"],
    right: ["John of Damascus, Exact Exposition II.29-30", "Arminius, Declaration of Sentiments", "Wesley, Predestination Calmly Considered", "Olson, Arminian Theology"]
  }
});
A.push({
  index: 1, key: "table", name: "Table", left_pole: "Sacramental", right_pole: "Memorial",
  bands: ["sacramental", "sacramental-leaning", "between sacramental and memorial", "memorial-leaning", "memorialist"],
  fair_summary: "The sacramental view holds that God really gives grace through the sacraments: Christ is truly present in the Supper, and baptism is a means by which God joins a person to Christ and his church; most churches on this side also baptize infants, whether as children of the covenant or for the washing of new birth. The memorial view holds that the Supper is a remembrance and proclamation of Christ's death until he comes, and baptism a believer's public confession of faith, so both are ordinances that believers keep in obedience rather than channels of grace: whatever blessing comes with them comes by the faith of those who take part, not through the elements themselves. Many stand between the poles, baptizing believers only while holding that Christ spiritually feeds his people at the Table (Reformed Baptists) or that God forgives sins in baptism (Churches of Christ).",
  history: [
    { when: "c. 110", what: "Ignatius of Antioch calls the Eucharist the flesh of our Savior Jesus Christ." },
    { when: "c. 743", what: "John of Damascus, Exact Exposition IV.13: the bread and wine are changed into Christ's body and blood by the invocation and presence of the Holy Spirit, 'not merely figures'." },
    { when: "1215", what: "Fourth Lateran Council affirms transubstantiation in its profession of faith; Trent defines it in 1551." },
    { when: "1525-26", what: "Zwingli argues that 'is' in 'this is my body' means 'signifies': the Supper is a memorial of thanksgiving." },
    { when: "1525-27", what: "First believers' baptisms in Zurich begin the Anabaptist movement; the Schleitheim Confession sets out believers' baptism and a memorial Supper." },
    { when: "1529", what: "Marburg Colloquy: Luther and Zwingli agree on fourteen of fifteen articles but not on whether Christ's body is bodily present in the bread and wine: Luther affirms, Zwingli denies." },
    { when: "1559", what: "Calvin's final Institutes (IV.17): a real spiritual presence, received by faith through the Spirit." },
    { when: "1609-89", what: "English Baptists, out of Separatism rather than Anabaptism: John Smyth's Amsterdam congregation baptizes believers, and the Particular Baptists' London Confessions specify immersion and confess Christ 'spiritually present to the faith of believers' at the Supper." }
  ],
  key_passages: ["John 6:51-63", "Matthew 26:26-28", "1 Corinthians 11:23-29", "1 Corinthians 10:16-17", "Acts 2:38-41", "Colossians 2:11-12", "Romans 6:3-4", "Matthew 28:19-20", "Acts 8:36-38", "1 Peter 3:21"],
  read_more: {
    left: ["Schmemann, For the Life of the World", "Ratzinger, God Is Near Us", "Bromiley, Children of Promise"],
    right: ["Hubmaier, On the Christian Baptism of Believers", "Schreiner & Crawford, The Lord's Supper", "Schreiner & Wright, Believer's Baptism"]
  }
});
A.push({
  index: 2, key: "spirit", name: "Gifts", left_pole: "Continuationist", right_pole: "Cessationist",
  bands: ["continuationist", "continuationist-leaning", "open but cautious on the gifts", "cessationist-leaning", "cessationist"],
  fair_summary: "Continuationists hold that the gifts of 1 Corinthians 12, including tongues, prophecy, and healing, remain available to the church until Christ returns and are to be welcomed and tested, though they differ on how eagerly to seek them: Pentecostals and charismatics seek them openly, while Catholic and Orthodox teaching receives them with gratitude and warns against seeking them rashly. Cessationists hold that those sign gifts authenticated the apostles and their message and passed away once the apostolic foundation was laid; many add that the completed Scriptures now do the work those gifts once did. They affirm that God still heals and answers prayer, but hold that the Spirit's ordinary work is now through the Word and providence rather than through the sign gifts.",
  history: [
    { when: "late 2nd c.", what: "Irenaeus (Against Heresies II.32; V.6) reports prophecy, tongues, and healings in the churches; Montanist 'new prophecy' in Phrygia leaves the wider church wary of prophetic claims." },
    { when: "c. 390", what: "Chrysostom, Homily 29 on 1 Corinthians, says the gifts Paul lists there 'used to occur but now no longer take place'." },
    { when: "c. 426", what: "Augustine, City of God XXII.8, records recent miracles at Hippo, many at martyrs' shrines, and in his Retractations withdraws his earlier claim that miracles had ceased." },
    { when: "1646", what: "Westminster Confession 1.1, repeated in the 1689 Baptist Confession: God's former ways of revealing his will are 'now ceased'." },
    { when: "1749-1867", what: "Wesley argues the gifts faded through the church's decline, not God's withdrawal; the holiness movement's 'baptism with the Holy Spirit' prepares the ground for Pentecostalism." },
    { when: "1901-06", what: "Charles Parham's Topeka school and William Seymour's Azusa Street revival in Los Angeles launch modern Pentecostalism, with tongues as the initial evidence of Spirit baptism." },
    { when: "1918", what: "B. B. Warfield, Counterfeit Miracles, ties the gifts to the apostles." },
    { when: "1960s", what: "Charismatic renewal brings Pentecostal-style tongues, prophecy, and healing into mainline Protestant (Van Nuys, 1960) and Catholic (Duquesne, 1967) congregations." },
    { when: "1980s-90s", what: "The 'third wave' (Wimber's Vineyard; Grudem, Storms) brings the gifts into evangelical and some Reformed churches without the Pentecostal doctrine of a subsequent Spirit baptism." },
    { when: "1996", what: "Are Miraculous Gifts for Today? Four Views sets the cessationist (Gaffin), open-but-cautious (Saucy), and continuationist (Storms, Oss) cases side by side." }
  ],
  key_passages: ["1 Corinthians 14:1-5", "1 Corinthians 13:8-12", "Acts 2:17-18", "1 Thessalonians 5:19-21", "Ephesians 2:20", "Hebrews 2:3-4", "2 Corinthians 12:12"],
  read_more: {
    left: ["Grudem, The Gift of Prophecy", "Fee, Paul, the Spirit, and the People of God"],
    right: ["Warfield, Counterfeit Miracles", "Gaffin, Perspectives on Pentecost"]
  }
});
A.push({
  index: 3, key: "kingdom", name: "Kingdom", left_pole: "One people of God", right_pole: "Dispensational",
  bands: ["one people of God", "leaning to one people of God", "balanced on Israel and the church", "dispensational-leaning", "dispensational"],
  fair_summary: "The one-people view holds that there is a single people of God across both testaments: in Christ, the church, Jew and Gentile together, inherits the promises to Abraham, and Christ's kingdom is present now; his return brings the new creation, for some after a millennial reign on earth. The dispensational view keeps Israel and the church distinct: God's promises to national Israel will be fulfilled literally in a future earthly kingdom, and most on this side expect the church to be caught up before a seven-year tribulation. Progressive dispensationalists add that Christ's kingdom has already begun, and many Pentecostals hold the rapture and the hope for Israel without the whole system.",
  history: [
    { when: "c. 155-180", what: "Justin Martyr calls Christians 'the true spiritual Israel', yet he and Irenaeus expect a thousand-year reign of Christ on earth in a rebuilt Jerusalem." },
    { when: "c. 413-426", what: "Augustine, City of God, reads the thousand years of Revelation 20 as the present church age." },
    { when: "1530", what: "Augsburg Confession XVII condemns the teaching that the saints will possess an earthly kingdom before the resurrection of the dead." },
    { when: "1646", what: "Westminster Confession ch. 7: not two covenants of grace but one and the same, differently administered under law and gospel." },
    { when: "1830s", what: "J. N. Darby, a leader of the Plymouth Brethren, teaches a distinct Israel and a pretribulational rapture." },
    { when: "1909", what: "Scofield Reference Bible carries dispensationalism into the pews." },
    { when: "1924-65", what: "Lewis Sperry Chafer founds Dallas Theological Seminary; his Systematic Theology (1947-48) and Ryrie's Dispensationalism Today (1965) give the system its classic form." },
    { when: "1950s", what: "George Eldon Ladd's historic premillennialism: a future millennium, one people of God, the church through the tribulation." },
    { when: "1965-96", what: "Vatican II, Nostra Aetate: the Jews are not rejected by God (Romans 11:28-29); Presbyterian (1987) and Methodist (1996) statements add that the church has not replaced them." },
    { when: "1990s", what: "Progressive dispensationalism (Blaising, Bock, Saucy) holds that the church already shares in the new covenant and kingdom blessings, while national Israel keeps a distinct future." }
  ],
  key_passages: ["Genesis 17:7-8", "Daniel 9:24-27", "Matthew 24", "Romans 11", "Galatians 3:26-29", "Ephesians 2:11-22", "1 Thessalonians 4:13-18", "Hebrews 8:6-13", "Revelation 20:1-6"],
  read_more: {
    left: ["Riddlebarger, A Case for Amillennialism", "Ladd, The Gospel of the Kingdom"],
    right: ["Ryrie, Dispensationalism", "Blaising & Bock, Progressive Dispensationalism"]
  }
});
A.push({
  index: 4, key: "tradition", name: "Authority", left_pole: "Scripture and tradition", right_pole: "Scripture alone",
  bands: ["rooted in tradition", "tradition-friendly", "balanced on authority", "Scripture over tradition", "Scripture alone"],
  fair_summary: "Those who read Scripture within the church's tradition hold that the creeds, the ecumenical councils, the consensus of the Fathers, and the church's living teaching (for Catholics, the teaching office of pope and bishops) are God's appointed means of guarding and interpreting his Word, and so carry real authority. Those who hold to Scripture alone may grant creeds and confessions real but subordinate authority, yet insist that only Scripture is infallible: any council may err, nothing may be required as an article of faith that cannot be proved from Scripture, and no council or teacher can bind the conscience against it.",
  history: [
    { when: "c. 375", what: "Basil the Great, On the Holy Spirit 27: some of what the church holds comes from written teaching, some from the unwritten tradition of the apostles, and both have the same force." },
    { when: "434", what: "Vincent of Lerins: hold what has been believed 'everywhere, always, by all.'" },
    { when: "787", what: "Second Council of Nicaea: 'we keep unchanged all the ecclesiastical traditions handed down to us, whether in writing or verbally.'" },
    { when: "1521", what: "Luther at Worms: unless convinced by Scripture or clear reason he will not recant; his conscience is captive to the Word of God." },
    { when: "1546", what: "Council of Trent: the gospel is preserved in written books and in unwritten traditions." },
    { when: "1577", what: "Formula of Concord: Scripture is 'the only rule and norm' by which all teachers and teachings are judged; the ancient creeds are received as witnesses to it." },
    { when: "1646", what: "Westminster Confession ch. 1: Scripture is the supreme judge of all controversies, and councils may err." },
    { when: "1965", what: "Vatican II, Dei Verbum: Scripture and Tradition flow from the same divine wellspring." }
  ],
  key_passages: ["2 Thessalonians 2:15", "2 Timothy 3:16-17", "1 Timothy 3:15", "Acts 17:11", "Acts 15:6-29", "Matthew 15:3-9", "John 16:13", "Galatians 1:8-9"],
  read_more: {
    left: ["Newman, Development of Doctrine", "Florovsky, Bible, Church, Tradition"],
    right: ["Mathison, The Shape of Sola Scriptura", "T. Campbell, Declaration and Address"]
  }
});
A.push({
  index: 5, key: "worship", name: "Worship", left_pole: "Liturgical", right_pole: "Free",
  bands: ["liturgical", "liturgy-leaning", "between liturgical and free", "free-leaning in worship", "free in worship"],
  fair_summary: "Liturgical worship follows a set order and the church calendar, usually with the Eucharist at the center of the Lord's Day service, so that the whole congregation prays and sings with the historic church, in words tested over centuries, and joins the worship of heaven. Free worship holds that Scripture prescribes no fixed liturgy, so each congregation orders its own service around the Word read and preached, prayer, song, and the ordinances; some keep a plain, settled pattern and others leave the shape open for the Spirit to lead in the moment, with room for any member to contribute.",
  history: [
    { when: "late 1st c.", what: "The Didache gives set Eucharistic prayers, while letting prophets give thanks as they wish." },
    { when: "c. 155", what: "Justin Martyr's First Apology 67: Sunday readings, a sermon, prayers, and the Eucharist, the presider giving thanks 'according to his ability'." },
    { when: "4th-6th c.", what: "The eucharistic prayers of East and West take their lasting shape: the Liturgies of St Basil and St John Chrysostom, and the Roman Canon." },
    { when: "1525-26", what: "Zwingli's Zurich centers Sunday worship on sermon and prayer, without singing; Luther's German Mass keeps the Mass's order in German with congregational hymns." },
    { when: "1549", what: "Thomas Cranmer's first Book of Common Prayer gives the English church a single vernacular liturgy." },
    { when: "1572-1645", what: "Puritans, following Calvin, hold that only what Scripture commands belongs in worship (the regulative principle); Hooker replies that the church may order what Scripture does not forbid; Westminster's Directory replaces the Prayer Book." },
    { when: "1830s", what: "Charles Finney's revivalist 'new measures' reshape Protestant services." },
    { when: "1906", what: "Azusa Street revival under William Seymour: spontaneous singing, tongues and interpretation, and open testimony spread with Pentecostalism worldwide." },
    { when: "1963", what: "Vatican II, Sacrosanctum Concilium: reform of the Mass and the 'full, conscious, and active participation' of all the faithful; Anglican, Lutheran, and Presbyterian service books (1978-93) follow its lead." },
    { when: "1970s-", what: "Jesus movement and the contemporary worship movement (Calvary Chapel, Vineyard, Hillsong)." }
  ],
  key_passages: ["Acts 2:42", "Acts 20:7", "John 4:23-24", "1 Corinthians 14:26-40", "Colossians 3:16", "Hebrews 12:28", "Revelation 4-5", "Psalm 150"],
  read_more: {
    left: ["Schmemann, Introduction to Liturgical Theology", "Ratzinger, The Spirit of the Liturgy"],
    right: ["Hayford, Worship His Majesty", "Kauflin, Worship Matters"]
  }
});
d.axes = JSON.parse(JSON.stringify(A).replace(/(\d)-(\d)/g,'$1–$2').replace(/4th-6th/g,'4th–6th').replace(/1980s-90s/g,'1980s–90s').replace(/1970s-/g,'1970s–').replace(/Lerins/g,'Lérins'));

const S = [
  [1, "grace", -1, "God's choice of who will be saved is not based on anything he foresaw they would do."],
  [2, "grace", 1, "A person whom God is drawing to salvation can still finally refuse him and be lost."],
  [3, "grace", -1, "God alone works saving faith in a person; the sinner contributes nothing to conversion, not even the decision to believe."],
  [4, "table", -1, "In the Lord's Supper, Christ himself is given through the bread and wine, not only remembered."],
  [5, "table", 1, "Baptism is a public testimony to a faith already held, not a means by which God gives grace."],
  [6, "table", -1, "Infants should be baptized, not only those who profess faith for themselves."],
  [7, "spirit", -1, "The gifts of tongues, prophecy, and healing are still given to the church today."],
  [8, "spirit", 1, "The miraculous gifts of tongues, prophecy, and healing ended with the apostles or the completion of the New Testament."],
  [9, "spirit", -1, "The Spirit still gives some Christians specific prophetic words for the church today."],
  [10, "kingdom", 1, "God will yet give national Israel its promised land and kingdom on this earth."],
  [11, "kingdom", -1, "There is one people of God across both testaments: the church, Jew and Gentile together, inherits the promises to Abraham."],
  [12, "kingdom", 1, "The church is a new body begun at Pentecost, not the continuation of Old Testament Israel."],
  [13, "tradition", -1, "The early creeds and councils carry an authority of their own, not only as faithful summaries of what Scripture teaches."],
  [14, "tradition", 1, "Only Scripture is infallible; every creed, council, and teacher can err and must be tested by it."],
  [15, "tradition", -1, "When Christians disagree about a passage, the church's teaching office (bishops, councils, or a magisterium) has the final say."],
  [16, "worship", -1, "Worship should follow a fixed written liturgy, with set prayers used week by week."],
  [17, "worship", 1, "Each congregation should shape its own order of service rather than follow a prescribed liturgy."],
  [18, "worship", -1, "The church year, with Advent, Lent, and Easter, should shape what a congregation reads, sings, and prays."]
];
d.statements = S.map(function (s) { return { index: s[0], axis: s[1], direction: s[2], text: s[3] }; });

d.candidate_statements = [
  { axis: "grace", direction: 1, text: "Someone who has truly been born again can still fall away and be finally lost." },
  { axis: "grace", direction: 1, text: "God gives everyone enough grace to believe; the difference lies in how each person responds." },
  { axis: "grace", direction: -1, text: "Whether a person believes is ultimately decided by God, not by the person." },
  { axis: "table", direction: -1, text: "In baptism God himself acts: he washes, seals, or joins the person to Christ." },
  { axis: "table", direction: 1, text: "The bread and wine remain ordinary bread and wine; the Supper's value is in remembering." },
  { axis: "table", direction: -1, text: "Christ's body and blood are received with the mouth by every communicant, believing or not." },
  { axis: "spirit", direction: 1, text: "With the Bible complete, the church no longer needs prophecy to hear from God." },
  { axis: "spirit", direction: -1, text: "Every Christian should eagerly seek the gifts of the Spirit, including the more dramatic ones." },
  { axis: "spirit", direction: 1, text: "Tongues today are learned or emotional speech, not the gift described in the New Testament." },
  { axis: "kingdom", direction: -1, text: "The Old Testament land promises find their fulfilment in Christ and the new creation." },
  { axis: "kingdom", direction: 1, text: "Ethnic Israel still has a distinct future role that the church has not taken over." },
  { axis: "tradition", direction: 1, text: "A Christian with an open Bible may rightly reject a teaching that every council has affirmed." },
  { axis: "tradition", direction: -1, text: "What the apostles handed down by word of mouth carries the same authority as what they wrote." },
  { axis: "tradition", direction: 1, text: "Practices not found in Scripture, however ancient, may be dropped by any church." },
  { axis: "worship", direction: 1, text: "Spontaneous prayer in one's own words suits public worship better than prayers read from a book." },
  { axis: "worship", direction: -1, text: "The congregation should say or sing set responses, creeds, and prayers together each week." },
  { axis: "worship", direction: 1, text: "Worship should be able to change direction in the moment rather than follow an order fixed in advance." }
];

const T = [
  ["Catholic (Roman and Eastern)", 72, 5, 22, 15, 5, 5],
  ["Eastern Orthodox", 90, 5, 20, 15, 5, 5],
  ["Lutheran (confessional)", 33, 5, 82, 15, 88, 10],
  ["Anglican (broad)", 42, 5, 35, 22, 65, 5],
  ["Presbyterian / Reformed (confessional)", 5, 10, 90, 5, 78, 40],
  ["Reformed Baptist (1689)", 5, 50, 95, 5, 90, 88],
  ["Reformed charismatic (Sovereign Grace, Newfrontiers)", 5, 52, 5, 25, 88, 78],
  ["Southern Baptist (Calvinist)", 10, 95, 75, 72, 95, 95],
  ["Southern Baptist (non-Calvinist)", 80, 95, 75, 72, 95, 95],
  ["National Baptist (NBC USA / historically Black Baptist)", 70, 95, 35, 72, 95, 92],
  ["Bible church (independent, dispensational)", 48, 95, 95, 95, 95, 95],
  ["Calvary Chapel", 55, 95, 40, 95, 95, 95],
  ["Churches of Christ / Christian Churches", 95, 58, 95, 10, 95, 95],
  ["Wesleyan / Methodist", 88, 12, 30, 25, 60, 28],
  ["Mainline Protestant (PCUSA / ELCA / UMC)", 50, 5, 35, 10, 55, 25],
  ["Pentecostal (Assemblies of God, Church of God, COGIC)", 90, 90, 5, 75, 85, 95],
  ["Charismatic non-denominational", 75, 90, 5, 55, 80, 92],
  ["Anabaptist / Mennonite (peace church)", 90, 90, 30, 25, 90, 82]
];
d.traditions = T.map(function (t) {
  return { name: t[0], position: { grace: t[1], table: t[2], spirit: t[3], kingdom: t[4], tradition: t[5], worship: t[6] } };
});

d.changelog = require('./changelog.json');
d.disputed = require('./disputed.json');

fs.writeFileSync('compass-data.revised.json', JSON.stringify(d, null, 2));
console.log('axes', d.axes.length, 'statements', d.statements.length, 'candidates', d.candidate_statements.length,
  'traditions', d.traditions.length, 'changelog', d.changelog.length, 'disputed', d.disputed.length);
