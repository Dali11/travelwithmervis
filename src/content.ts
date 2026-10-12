// ============================================================================
// ALL EDITABLE CONTENT LIVES HERE.
// Change text, photos, places and the WhatsApp number in this file only.
// Do not edit anything in src/scene/ (that is the 3D code).
// ============================================================================

/** One step of a place: one page section, one camera move, one photo card. */
export interface Beat {
  title: string;
  text: string;
  /** Optional photo, e.g. '/photos/lake-kayak.jpg' (file goes in public/photos). */
  photo?: string;
  photoAlt?: string;
}

export interface Place {
  /** Real place name, shown on the page. */
  name: string;
  /** Name used in the enquiry form chips and the WhatsApp message. */
  label: string;
  /** Button text, shown on the last step of the place. */
  cta: string;
  /** 'lake' sweeps low over the water. 'mountain' and 'plateau' circle and climb to the summit. */
  kind: 'lake' | 'mountain' | 'plateau';
  /** Real position of the place. */
  lon: number;
  lat: number;
  /** Rough radius of the mountain or plateau in km (used for camera distance). Default 14. */
  radiusKm?: number;
  /** One to five steps. Each step is one page section, one camera move and one photo card. */
  beats: Beat[];
}

export interface Step {
  title: string;
  text: string;
}

export interface Content {
  brand: string;
  /** WhatsApp number with country code, digits only, e.g. '265991234567'. Empty = message is copied instead. */
  whatsapp: string;
  contact: { email: string; location: string; hours: string[] };
  nav: { cta: string };
  hero: { title: string; lede: string; primaryCta: string; secondaryCta: string };
  /** The journey, in order. Each place is a real location the camera flies to. */
  places: Place[];
  how: { title: string; steps: Step[]; cta: string };
  plan: {
    title: string;
    intro: string;
    nameLabel: string;
    tripLabel: string;
    notSure: string;
    datesLabel: string;
    datesPlaceholder: string;
    groupLabel: string;
    groupPlaceholder: string;
    send: string;
    copied: string;
    whatsappGreeting: string;
  };
  footer: string;
}

export const content: Content = {
  brand: 'Travel with Mervis',
  whatsapp: '',

  contact: {
    email: 'info@travelwithmervis.com',
    location: 'Lilongwe, Malawi',
    hours: ['Mon to Fri: 8am to 6pm', 'Sat: 9am to 12pm'],
  },

  nav: { cta: 'Plan a trip' },

  hero: {
    title: 'See Malawi the way Mervis does.',
    lede: 'Scroll to fly from Lake Malawi to Mulanje Mountain, then plan a trip of your own.',
    primaryCta: 'Start the journey',
    secondaryCta: 'Plan my trip',
  },

  // Positions are real coordinates. Check them by running the site and looking at the pin.
  places: [
    {
      name: 'Lake Malawi',
      label: 'Lake Malawi',
      cta: 'Ask about the lake',
      kind: 'lake',
      lon: 34.62,
      lat: -13.3,
      beats: [
        {
          title: 'Slow days on the water',
          text: 'Turquoise water, a kayak and nowhere to be. Lakeshore stays with a base near the water and transfers sorted.',
          photo: '/photos/lake-kayak.jpg',
          photoAlt: 'Two people paddling a blue kayak on turquoise water',
        },
      ],
    },
    {
      name: 'Mulanje Mountain',
      label: 'Mulanje trek',
      cta: 'Ask about Mulanje',
      kind: 'mountain',
      lon: 35.57,
      lat: -16.0,
      radiusKm: 14,
      beats: [
        {
          title: 'Into the massif',
          text: 'Guided walks into the highlands, paced so first-timers keep up and regulars still get a challenge.',
          photo: '/photos/mountain-trek.jpg',
          photoAlt: 'A hiker with a red backpack in a mountain valley',
        },
        {
          title: 'Forest and running water',
          text: 'Shade, clear rivers and the quiet between the trees on the way up.',
          photo: '/photos/forest-river.jpg',
          photoAlt: 'A clear river over rocks beneath tall trees',
        },
        {
          title: 'A pool worth stopping for',
          text: 'Clear mountain water, a good place to rest and swim before the final climb.',
          photo: '/photos/waterfall-pool.jpg',
          photoAlt: 'A rocky pool fed by a small waterfall, with green mountains behind',
        },
        {
          title: 'Above the mist',
          text: 'Summit mornings, when the cloud sits below your feet.',
          photo: '/photos/misty-summit.jpg',
          photoAlt: 'A person standing on a rock pile above the mist',
        },
      ],
    },
  ],

  how: {
    title: 'How planning works',
    steps: [
      { title: 'Tell Mervis what you want', text: 'Dates, group size and the kind of trip. Rough ideas are fine.' },
      { title: 'Get a plan you can read', text: "Where you'll stay, how you'll get there and what it costs, before you pay." },
      { title: 'Travel with someone on call', text: 'Message Mervis if flights move, weather turns or you change your mind.' },
    ],
    cta: 'Start planning',
  },

  plan: {
    title: 'Tell Mervis about your trip',
    intro: 'Fill in what you know. Sending opens WhatsApp with your details ready.',
    nameLabel: 'Your name',
    tripLabel: 'Where to',
    notSure: 'Not sure yet',
    datesLabel: 'Dates',
    datesPlaceholder: '12–16 December',
    groupLabel: 'Travellers',
    groupPlaceholder: '2',
    send: 'Send on WhatsApp',
    copied: 'Your message is copied. Paste it to Mervis on WhatsApp.',
    whatsappGreeting: 'Hi Mervis, I would like to plan a trip.',
  },

  footer: '© Travel with Mervis. Terrain data: Mapzen Terrain Tiles (SRTM and others). Outlines: Natural Earth.',
};
