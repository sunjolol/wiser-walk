/**
 * A picture for each of the Theology Compass's eighteen traditions (the owner, 2026-09-25:
 * every tradition page had the bare night band, and "a reader feels like their tradition's page
 * is represented well" when it wears its own). The same picture is drawn across the band of
 * the tradition's page, of a result whose nearest tradition it is, and of that result's card on
 * /me/. Every one is public domain or CC0, chosen as something a member of the tradition would
 * recognise and be glad to see; credits in public/img/CREDITS.md and printed in the band.
 *
 * `posM` places the picture in a tall phone band, `posD` in a wide one (object-position).
 */
export interface TraditionArt {
  src: string;
  alt: string;
  posM: string;
  posD: string;
  credit: string;
}

export const TRADITION_ART: Record<string, TraditionArt> = {
  'catholic-roman-and-eastern': {
    src: '/img/traditions/catholic-roman-and-eastern.jpg', posM: "50% 50%", posD: "50% 92%",
    alt: "Giovanni Paolo Panini’s painting of the vast nave of Saint Peter’s in Rome, its gilded vault and marble arches rising over pilgrims walking toward the high altar",
    credit: "Picture: Interior of Saint Peter’s, Rome, Giovanni Paolo Panini, about 1754. National Gallery of Art, Washington."
  },
  'eastern-orthodox': {
    src: '/img/traditions/eastern-orthodox.jpg', posM: "36% 50%", posD: "50% 72%",
    alt: "Illarion Pryanishnikov’s painting of a Russian village procession, men and women carrying icons and a gilded processional cross along a riverbank below a white church",
    credit: "Picture: Religious Procession, Illarion Pryanishnikov, 1893. State Russian Museum, St Petersburg."
  },
  'lutheran-confessional': {
    src: '/img/traditions/lutheran-confessional.jpg', posM: "50% 50%", posD: "50% 50%",
    alt: "Lucas Cranach’s altar panel of Martin Luther in the pulpit pointing to Christ on the cross, with the Wittenberg congregation listening on the left",
    credit: "Picture: Luther Preaching, predella of the Reformation Altarpiece, Lucas Cranach the Elder and the Younger, 1547. St Mary’s Church, Wittenberg."
  },
  'anglican-broad': {
    src: '/img/traditions/anglican-broad.jpg', posM: "52% 50%", posD: "50% 45%",
    alt: "John Constable’s painting of Salisbury Cathedral’s spire rising above the trees and meadow of the Bishop’s Grounds, with cattle grazing by the water",
    credit: "Picture: Salisbury Cathedral from the Bishop’s Grounds, John Constable, about 1825. The Metropolitan Museum of Art, New York."
  },
  'presbyterian-reformed-confessional': {
    src: '/img/traditions/presbyterian-reformed-confessional.jpg', posM: "10% 50%", posD: "50% 75%",
    alt: "Emanuel de Witte’s painting of a Reformed congregation in a whitewashed Gothic church, listening to a minister preaching from the pulpit",
    credit: "Picture: Interior of a Protestant Gothic Church during a Service, Emanuel de Witte, 1669. Rijksmuseum, Amsterdam."
  },
  'reformed-baptist-1689': {
    src: '/img/traditions/reformed-baptist-1689.jpg', posM: "62% 50%", posD: "50% 16%",
    alt: "Alexander Melville’s portrait of the Baptist preacher Charles Haddon Spurgeon, seated in a red armchair in a dark suit",
    credit: "Picture: Charles Haddon Spurgeon, Alexander Melville, 1885. National Portrait Gallery, London."
  },
  'reformed-charismatic-sovereign-grace-newfrontiers': {
    src: '/img/traditions/reformed-charismatic-sovereign-grace-newfrontiers.jpg', posM: "40% 50%", posD: "50% 32%",
    alt: "Anthony van Dyck’s painting of Pentecost, the apostles and Mary gazing upward as the dove of the Holy Spirit descends in a burst of light",
    credit: "Picture: The Outpouring of the Holy Spirit, Anthony van Dyck, about 1618–20. Picture Gallery, Sanssouci, Potsdam."
  },
  'southern-baptist-calvinist': {
    src: '/img/traditions/southern-baptist-calvinist.jpg', posM: "54% 50%", posD: "50% 50%",
    alt: "George Henry Durrie’s painting of villagers walking and riding sleighs through the snow to a white steepled country church",
    credit: "Picture: Going to Church, George Henry Durrie, 1853."
  },
  'southern-baptist-non-calvinist': {
    src: '/img/traditions/southern-baptist-non-calvinist.jpg', posM: "55% 50%", posD: "50% 2%",
    alt: "William Holman Hunt’s painting of Christ, crowned with thorns and carrying a lantern, knocking at an overgrown door at night",
    credit: "Picture: The Light of the World, William Holman Hunt, 1900–04. St Paul’s Cathedral, London."
  },
  'national-baptist-nbc-usa-historically-black-baptist': {
    src: '/img/traditions/national-baptist-nbc-usa-historically-black-baptist.jpg', posM: "70% 40%", posD: "50% 35%",
    alt: "Henry Ossawa Tanner’s painting of Nicodemus coming to Jesus by night, the two seated on a moonlit rooftop in Jerusalem",
    credit: "Picture: Nicodemus Visiting Jesus, Henry Ossawa Tanner, 1899. Pennsylvania Academy of the Fine Arts, Philadelphia."
  },
  'bible-church-independent-dispensational': {
    src: '/img/traditions/bible-church-independent-dispensational.jpg', posM: "58% 50%", posD: "50% 55%",
    alt: "Adolph Tidemand’s painting of a lay preacher standing to read and preach to a household gathered in a Norwegian farmhouse loft",
    credit: "Picture: The Haugeans, Adolph Tidemand, 1848. National Museum, Oslo."
  },
  'calvary-chapel': {
    src: '/img/traditions/calvary-chapel.jpg', posM: "82% 50%", posD: "50% 50%",
    alt: "Vasily Polenov’s painting of Christ walking alone along the stony, sunlit shore of the Sea of Galilee",
    credit: "Picture: On the Sea of Galilee, Vasily Polenov, 1888. State Tretyakov Gallery, Moscow."
  },
  'churches-of-christ-christian-churches': {
    src: '/img/traditions/churches-of-christ-christian-churches.jpg', posM: "12% 50%", posD: "50% 60%",
    alt: "Worthington Whittredge’s painting of a camp meeting, a crowd gathered by a preacher’s stand beneath a sunlit grove of tall trees",
    credit: "Picture: The Camp Meeting, Worthington Whittredge, 1874. The Metropolitan Museum of Art, New York."
  },
  'wesleyan-methodist': {
    src: '/img/traditions/wesleyan-methodist.jpg', posM: "50% 50%", posD: "50% 30%",
    alt: "A hand-coloured Currier and Ives print of John Wesley preaching in the Epworth churchyard to a crowd of listeners, some kneeling and weeping",
    credit: "Picture: John Wesley Preaching on His Father’s Grave, Currier and Ives. Library of Congress, Washington."
  },
  'mainline-protestant-pcusa-elca-umc': {
    src: '/img/traditions/mainline-protestant-pcusa-elca-umc.jpg', posM: "45% 50%", posD: "50% 40%",
    alt: "Childe Hassam’s painting of the white columned front of the church at Old Lyme, framed by orange autumn trees",
    credit: "Picture: Church at Old Lyme, Childe Hassam, 1905. Buffalo AKG Art Museum, Buffalo."
  },
  'pentecostal-assemblies-of-god-church-of-god-cogic': {
    src: '/img/traditions/pentecostal-assemblies-of-god-church-of-god-cogic.jpg', posM: "50% 20%", posD: "50% 22%",
    alt: "El Greco’s painting of Pentecost, tongues of fire resting on the heads of Mary and the apostles as the dove of the Holy Spirit shines above them",
    credit: "Picture: Pentecost, El Greco, about 1600. Museo del Prado, Madrid."
  },
  'charismatic-non-denominational': {
    src: '/img/traditions/charismatic-non-denominational.jpg', posM: "50% 50%", posD: "50% 45%",
    alt: "Juan Bautista Maíno’s painting of Pentecost, the apostles and Mary looking up in wonder as flames fall from the radiant dove above",
    credit: "Picture: Pentecost, Juan Bautista Maíno, 1615–20. Museo del Prado, Madrid."
  },
  'anabaptist-mennonite-peace-church': {
    src: '/img/traditions/anabaptist-mennonite-peace-church.jpg', posM: "72% 50%", posD: "50% 32%",
    alt: "Rembrandt’s painting of the Mennonite preacher Cornelis Anslo gesturing toward the open books on his table as he speaks with his wife Aeltje",
    credit: "Picture: The Mennonite Preacher Anslo and His Wife, Rembrandt, 1641. Gemäldegalerie, Berlin."
  }
};

export const traditionArt = (slug: string | undefined): TraditionArt | null =>
  (slug && TRADITION_ART[slug]) || null;
