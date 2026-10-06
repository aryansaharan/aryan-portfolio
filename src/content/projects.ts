// One source of truth for the work on the page and the live-status check.
// Every fact is from the resume (Sep 2026) or the project's own site/README;
// nothing is invented. Five projects by the owner's pick (2026-10-05).

export const EMAIL = 'aryansaharan30@gmail.com'

export type Lane = 'Now' | 'Solo' | 'Client'

export type Project = {
  id: string
  name: string
  lane: Lane
  year: string
  /** One line: the job it does, not the tech it uses. */
  line: string
  url: string
  /** Public source, where it makes sense to show it. */
  repo?: string
  /** web: lives in a browser. app: a native phone app. Decides the plate. */
  kind: 'web' | 'app'
  /** web: the main browser view. */
  image?: string
  alt: string
  /** web: one moment, magnified beside the browser. w/h ratio of the crop. */
  detail?: { src: string; alt: string; ratio: number }
  /** app: real screens, in the light and dark theme of the app itself. */
  screens?: { light: string[]; dark: string[] }
  /** Plate backdrop, light and dark: a whisper of the product's own colour. */
  tint: [string, string]
  /** The PM story, short: what was wrong, the decision, what got built, what it did. */
  story: { problem: string; call: string; build: string; result: string }
}

export const projects: Project[] = [
  {
    id: 'think-peepal',
    name: 'Think Peepal',
    lane: 'Now',
    year: '2026',
    line: 'A focus timer where a tree grows while you study. I’m building it: the plan, the product, and every screen.',
    url: 'https://think-peepal.vercel.app',
    kind: 'app',
    alt: 'Think Peepal on a phone: the focus timer, a session running, and the orchard',
    screens: {
      light: ['/work/tp-06-earth.webp', '/work/tp-08-earth.webp', '/work/tp-10-earth.webp'],
      dark: ['/work/tp-06-forest.webp', '/work/tp-08-forest.webp', '/work/tp-10-forest.webp'],
    },
    tint: ['#ECEFE4', '#111510'],
    story: {
      problem:
        'A tree grows while you study, and real ones get planted with farming families across India. The app has to make that worth opening every day.',
      call: 'Keep everything the app has to be in one place: a build book that wins on product, design and data, where every change lands first.',
      build:
        'The product and its rules, a design system in two themes, painted trees across five growth stages, fourteen species and five regions, 32 screens with specs, and ten user flows.',
      result: 'In build now with senior engineers, against the book.',
    },
  },
  {
    id: 'prod-ai',
    name: 'Prod AI',
    lane: 'Solo',
    year: '2026',
    line: 'Describe an app in plain words, see it sketched, then get a real one. For people who code and people who don’t.',
    url: 'https://prod-ai-studio.vercel.app',
    repo: 'https://github.com/aryansaharan/prod-ai',
    kind: 'web',
    image: '/work/prod-ai.webp',
    alt: 'Prod AI: a finished Claims Triage Desk on its sheet, with notes in the margin and a Publish button',
    detail: {
      src: '/work/prod-ai-detail.webp',
      alt: 'The same app as it started: three screens drawn in pencil, before anything was built',
      ratio: 2.81,
    },
    tint: ['#EFEEE8', '#131411'],
    story: {
      problem:
        'AI builders demo well on the first prompt. A few turns in, people who don’t code can’t tell what they’ll get, what it costs, or whether to trust it.',
      call: 'Drop the chat-left, preview-right layout. A pencil sketch says “rough, cheap to change”; notes in the margin end in a decision; anything that can’t be undone asks a person first.',
      build:
        'Next.js, Supabase and Claude. One JSON blueprint drives the sketch, the app, the code and the diffs. Prices are computed by code, never by the model. Full production architecture written up.',
      result: 'Works end to end: sign in, sketch, make it real, change it with notes, publish. Built over three days.',
    },
  },
  {
    id: 'trial-shift',
    name: 'Trial Shift',
    lane: 'Solo',
    year: '2026',
    line: 'An accounts-payable agent you watch work a shift on real invoices before you trust it with yours.',
    url: 'https://trial-shift.vercel.app',
    kind: 'web',
    image: '/work/trial-shift.webp',
    alt: 'Trial Shift’s report: 16 invoices in 1s, 5 finished without you, 1 refused outright',
    detail: {
      src: '/work/trial-shift-detail.webp',
      alt: 'Refused: Spectrum Reach, bank details differ from the account on file. I will never make this call, at any autonomy level.',
      ratio: 3.09,
    },
    tint: ['#ECEEF3', '#11131A'],
    story: {
      problem:
        'An AI employee is the one hire you can’t try first. Vendors describe it; few let you watch it work.',
      call: 'The model reads, code decides. Every action is deterministic and auditable, authority is earned per supplier, and a bank-detail change is never autonomous.',
      build:
        'A shift on 16 real invoices filed with the US FCC: a vision model reads them, rules decide, and the agent files a report of what it cleared, escalated and refused.',
      result: 'Live. The report includes what it chose not to do, which is the part I’d trust most.',
    },
  },
  {
    id: 'ilumos',
    name: 'iLumos',
    lane: 'Solo',
    year: '2026',
    line: 'A drafting agent for patent claim charts. Every citation is checked before anything leaves.',
    url: 'https://ilumos-v3.vercel.app',
    kind: 'web',
    image: '/work/ilumos.webp',
    alt: 'iLumos: a claim chart with each element, its evidence and the agent panel',
    detail: {
      src: '/work/ilumos-detail.webp',
      alt: 'A citation check: verify_quote FAIL, the quote is not in the document; checked by code, not a model',
      ratio: 3.32,
    },
    tint: ['#F3EEEA', '#161211'],
    story: {
      problem: 'Drafting agents can cite confidently and wrongly. In legal work, one bad citation undoes the document.',
      call: 'The four checks that carry risk (quote verification, source authority, claim parsing, export gate) are plain code. A second model judges each claim against only the passage it cites.',
      build: 'An agent that researches, drafts and checks its own work against the evidence you give it, and stops at the decisions that need you.',
      result:
        'Red-teamed with prompt injection and poisoned documents; ten defects fixed, including a forged-provenance hole closed server-side.',
    },
  },
  {
    id: 'ascend',
    name: 'Ascend',
    lane: 'Solo',
    year: '2026',
    line: 'Six questions, then a short list of courses you’re likely to finish, and why each one.',
    url: 'https://ascendmvp.vercel.app',
    kind: 'web',
    image: '/work/ascend.webp',
    alt: 'Ascend: Overwhelmed by learning choices? Find your next skill in 15 minutes.',
    detail: {
      src: '/work/ascend-detail.webp',
      alt: 'Step 1 of 6: Where are you right now?',
      ratio: 2.7,
    },
    tint: ['#F1EEF4', '#141218'],
    story: {
      problem:
        'Surveyed early-career learners first: 61% named choice overload, 52% feared wasting money on the wrong course, 87% rated peer proof as decisive.',
      call: 'A narrowing machine, not another catalog. RICE put the guided assessment and peer reviews in the MVP and pushed community features out.',
      build:
        'An LLM ranks 36 curated courses against six answers. Malformed output is retried once; any failure falls back to a deterministic scorer, so it never errors or hangs.',
      result: 'My graduation project at the NextLeap fellowship: built in four days, after 25+ user interviews, and still live.',
    },
  },
]

/** The one-line mention below the grid. */
export const alsoBuilt = {
  name: 'Shram',
  now: 'minimi',
  line: 'A teardown of an on-device memory layer for the Mac that catches follow-ups before a conversation goes cold. Fittingly, it started one with the founder.',
  url: 'https://shram-ai.netlify.app',
}

export const experience = [
  {
    role: 'Building Think Peepal',
    org: '',
    when: 'Jul 2026 to now',
    note: 'The plan, the product, the design system and all 32 screens.',
  },
  {
    role: 'Product Manager',
    org: 'Lyearn',
    when: 'Jan 2026 to Jun 2026',
    note: 'Took AI Roleplay from idea to production, launched AI Avatar Video, and secured an ElevenLabs grant for the voice layer.',
  },
  {
    role: 'Associate Product Manager',
    org: 'Amadeus',
    when: 'Nov 2024 to Apr 2025',
    note: 'Shipped a Cancel For Any Reason add-on that lifted booking conversion 3% and cut cart abandonment 8%.',
  },
  {
    role: 'Software Engineer',
    org: 'Amadeus',
    when: 'Jul 2023 to Nov 2024',
    note: 'Closed an access-control gap across user data with server-side RBAC, then moved into product.',
  },
  {
    role: 'B.E. Computer Science',
    org: 'Thapar Institute',
    when: '2019 to 2023',
    note: '',
  },
]
