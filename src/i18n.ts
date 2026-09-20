// All interface words, per language. Story chapters live in src/content/chapters/<lang>/.

const en = {
  meta: {
    // 60 characters or so: Google truncates past that, and the words people search for come first
    title: 'Cara the Pirate — a one-eyed rescue dog near Bucharest',
    description:
      'Cara lost an eye on the streets and found a home just outside Bucharest. Follow her story, meet her crew, and help keep the bowls full.',
    locale: 'en_US',
  },
  nav: { donate: 'Donate', other: 'Română', blog: 'Blog' },
  hero: {
    sub: 'One eye. Whole heart. Absolutely no respect for pillows.',
    note: "yes, she's winking at you",
    alt: 'Cara on the grass with one paw raised, head tilted, winking at the camera.',
    cue: 'follow her paw prints',
  },
  punch: {
    l1: 'She had every reason to stop trusting people.',
    l2: "She didn't.",
    quote: 'I choose to keep the eye that sees the good in people.',
    quotes: ['“', '”'],
    sig: 'Cara, captain',
    dayBefore: 'Day ',
    dayAfter: ' of the rest of her life.',
  },
  crew: {
    title: 'The crew',
    intro: 'Four dogs, five cats, one backyard. Zero personal space.',
    photoSoon: 'Portrait coming soon',
    members: {
      cara: { rank: 'Captain', line: 'One eye, zero fear. Chief chewer.' },
      zuba: {
        rank: 'First mate',
        line: 'Walked through our gate as a puppy nine years ago and never left. Keeps order, mostly by lying on people.',
      },
      cookie: { rank: 'Quartermaster', line: 'Mini bichon, maximum opinions. In charge of snacks, whether we agree or not.' },
      oreo: {
        rank: 'Lookout',
        alias: 'Romeo, on formal occasions',
        line: 'Pocket-sized street survivor from Tulcea. Always sees you first.',
      },
      cats: {
        name: 'The Cat Council',
        rank: 'Management',
        line: 'Three run the house, two run the yard. They tolerate the dogs. The dogs adore them.',
      },
    } as Record<string, { rank: string; line: string; alias?: string; name?: string }>,
  },
  family: {
    title: 'The people behind the gate',
    p1: "We're Robert and Adelina, with Amelie, Eric and Eron. We live just outside Bucharest, and for as long as we've lived here, animals have found their way to our gate. We've found most of them new homes. Some, like Zuba, and now Cara, simply stayed.",
    p2: "Home is four dogs and five cats. And in Tulcea county, about fifteen more dogs live in a small shelter we built and pay for every month. The kids' grandmother looks after them there, every single day.",
  },
  why: {
    title: "Why we're asking",
    p: "We'll be honest with you. This year has been harder than most. Work got tight (the tech world isn't always kind to developers past forty), but the bills didn't notice, and neither did the food bowls.",
    crew: "We're not asking for pity. We're asking for crew.",
    coversTitle: 'What your help covers',
    covers: [
      'Food for the four dogs and five cats at home',
      'Food and care for the dogs at our Tulcea shelter',
      'Vaccines, sterilisations and vet visits',
      'The next one who shows up at our gate',
    ],
  },
  donate: {
    title: 'Join the crew',
    lede: 'X marks the spot. This is where you come in.',
    card: 'Donate by card',
    cardNote: 'Card, Apple Pay or Google Pay, via Stripe.',
    paypal: 'Donate with PayPal',
    bank: {
      title: 'Bank transfer',
      holder: 'Account holder',
      bank: 'Bank',
      currency: 'Currency',
      reference: 'Reference',
      referenceValue: 'Cara the Pirate',
    },
    crypto: 'Crypto',
    wallets: {
      evm: { name: 'Ethereum and EVM networks', note: (n: string) => `Send only on: ${n}.` },
      sol: { name: 'Solana', note: () => 'SOL or SPL tokens on Solana.' },
      btc: { name: 'Bitcoin', note: () => 'Bitcoin network only.' },
    },
    qrAlt: (name: string) => `QR code for the ${name} address`,
    copy: 'Copy',
    copied: 'Copied',
    share: {
      title: "Can't donate right now?",
      p: 'Share her story. Honestly, it helps just as much.',
      btn: "Share Cara's story",
      done: 'Link copied',
    },
    follow: ['Follow Cara on', 'and'],
    followAlso: ',',
  },
  keepup: {
    title: 'Keep up with Cara',
    tiktokLede: 'Short clips of the pack, most days.',
    follow: 'Follow on TikTok',
    followInstagram: 'Follow on Instagram',
    watch: 'Watch her story',
    blogTitle: 'Latest from the blog',
    allPosts: 'Read the blog',
  },
  footer: 'Made with love, and a few chewed cables, just outside Bucharest.',
};

const ro: typeof en = {
  meta: {
    title: 'Cara the Pirate — o cățelușă salvată lângă București',
    description:
      'Cara și-a pierdut un ochi pe stradă și și-a găsit o casă lângă București. Urmărește-i povestea, cunoaște-i echipajul și ajută-ne să ținem bolurile pline.',
    locale: 'ro_RO',
  },
  nav: { donate: 'Donează', other: 'English', blog: 'Blog' },
  hero: {
    sub: 'Un ochi. O inimă întreagă. Zero respect pentru perne.',
    note: 'da, îți face cu ochiul',
    alt: 'Cara pe iarbă, cu o lăbuță ridicată și capul înclinat, făcând cu ochiul spre cameră.',
    cue: 'urmează-i urmele de lăbuțe',
  },
  punch: {
    l1: 'Avea toate motivele să nu mai aibă încredere în oameni.',
    l2: 'Și totuși, are.',
    quote: 'Aleg să păstrez ochiul care vede binele din oameni.',
    quotes: ['„', '”'],
    sig: 'Cara, căpitan',
    dayBefore: 'Ziua ',
    dayAfter: ' din restul vieții ei.',
  },
  crew: {
    title: 'Echipajul',
    intro: 'Patru câini, cinci pisici, o curte. Zero spațiu personal.',
    photoSoon: 'Portretul vine în curând',
    members: {
      cara: { rank: 'Căpitan', line: 'Un ochi, zero frică. Șefă la ronțăit.' },
      zuba: {
        rank: 'Secund',
        line: 'A intrat pe poarta noastră acum nouă ani, ca pui, și n-a mai plecat. Ține ordinea, mai ales stând tolănit peste oameni.',
      },
      cookie: { rank: 'Intendent', line: 'Bichon mini, păreri maxi. Se ocupă de gustări, fie că suntem de acord, fie că nu.' },
      oreo: {
        rank: 'Santinelă',
        alias: 'Romeo, la ocazii festive',
        line: 'Supraviețuitor de buzunar de pe străzile din Tulcea. Te vede mereu primul.',
      },
      cats: {
        name: 'Consiliul Pisicilor',
        rank: 'Conducerea',
        line: 'Trei conduc casa, două conduc curtea. Îi tolerează pe câini. Câinii le adoră.',
      },
    },
  },
  family: {
    title: 'Oamenii de după poartă',
    p1: 'Suntem Robert și Adelina, cu Amelie, Eric și Eron. Locuim lângă București și, de când ne-am mutat aici, animalele și-au găsit mereu drumul spre poarta noastră. Pentru cele mai multe am găsit case noi. Unele, ca Zuba și acum Cara, pur și simplu au rămas.',
    p2: 'Acasă avem patru câini și cinci pisici. Iar în județul Tulcea, încă vreo cincisprezece câini trăiesc într-un mic adăpost pe care l-am construit și pe care îl plătim în fiecare lună. Bunica copiilor are grijă de ei acolo, în fiecare zi.',
  },
  why: {
    title: 'De ce vă cerem ajutorul',
    p: 'O să fim sinceri cu voi. Anul ăsta a fost mai greu decât altele. Munca s-a împuținat (lumea IT nu e mereu blândă cu programatorii trecuți de patruzeci de ani), dar facturile n-au observat. Nici bolurile de mâncare.',
    crew: 'Nu vă cerem milă. Vă chemăm în echipaj.',
    coversTitle: 'La ce folosește ajutorul vostru',
    covers: [
      'Mâncare pentru cei patru câini și cinci pisici de acasă',
      'Hrană și îngrijire pentru câinii din adăpostul din Tulcea',
      'Vaccinuri, sterilizări și vizite la veterinar',
      'Următorul care apare la poarta noastră',
    ],
  },
  donate: {
    title: 'Intră în echipaj',
    lede: 'X marchează locul. Aici intri tu în poveste.',
    card: 'Donează cu cardul',
    cardNote: 'Card, Apple Pay sau Google Pay, prin Stripe.',
    paypal: 'Donează prin PayPal',
    bank: {
      title: 'Transfer bancar',
      holder: 'Titular cont',
      bank: 'Banca',
      currency: 'Moneda',
      reference: 'Detalii plată',
      referenceValue: 'Donație Cara',
    },
    crypto: 'Crypto',
    wallets: {
      evm: { name: 'Ethereum și rețele EVM', note: (n: string) => `Trimite doar pe: ${n}.` },
      sol: { name: 'Solana', note: () => 'SOL sau tokenuri SPL pe Solana.' },
      btc: { name: 'Bitcoin', note: () => 'Doar pe rețeaua Bitcoin.' },
    },
    qrAlt: (name: string) => `Cod QR pentru adresa ${name}`,
    copy: 'Copiază',
    copied: 'Copiat',
    share: {
      title: 'Nu poți dona acum?',
      p: 'Dă-i povestea mai departe. Sincer, ajută la fel de mult.',
      btn: 'Distribuie povestea Carei',
      done: 'Link copiat',
    },
    follow: ['Urmărește-o pe Cara pe', 'și'],
    followAlso: ',',
  },
  keepup: {
    title: 'Ține pasul cu Cara',
    tiktokLede: 'Clipuri scurte cu gașca, aproape zilnic.',
    follow: 'Urmărește pe TikTok',
    followInstagram: 'Urmărește pe Instagram',
    watch: 'Vezi povestea ei',
    blogTitle: 'Ultimele povești de pe blog',
    allPosts: 'Citește blogul',
  },
  footer: 'Făcut cu drag, și câteva cabluri roase, lângă București.',
};

export const t = { en, ro };
export type Lang = keyof typeof t;
