/*
  ============================================================
  LiLi M.D. — Site content (from the V5 Canva design)
  ------------------------------------------------------------
  ALL copy lives here. Two-tone headings are split into
  { line1, line2 } so the section can color each line per the
  PDF (white line 1 + rose-gold line 2).
  ============================================================
*/

export const brand = {
  name: "LiLi M.D.",
  tagline: "Work Less. Earn More.",
};

export const nav = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export const socials = [
  { label: "LinkedIn", href: "#", icon: "/social-linkedin.png" },
  { label: "Instagram", href: "#", icon: "/social-instagram.png" },
  { label: "Facebook", href: "#", icon: "/social-facebook.png" },
];

export const hero = {
  // Two parts so mobile can break before "By invitation only." while desktop stays single-line.
  eyebrow: {
    line1: "Ten founding physicians.",
    line2: "By invitation only.",
  },
  heading: { line1: "The Private Club", line2: "at LiLi M.D." },
};

export const letter = {
  heading: "This is a personal invitation.",
  paragraphs: [
    "We’re opening ten founding seats in a private club for independent physicians — doctors who want their practice to stay their own while intelligent technology carries everything behind it. LiLi M.D. runs the business of your practice — billing, the AI scribe, the phones, the prior authorizations, the collections — on the system you already use, for one share of what you collect. We carry the rest, so you work less and earn more.",
    "The founding ten receive what no one after them will: founder equity, a permanent founder rate, and a hand in shaping the platform. We’re choosing these ten by hand, one conversation at a time, because the people in the room at the start shape everything that follows. We would be honored if one of them were you.",
  ],
  closing: "Independent, together.",
  cofounders: [
    { name: "Dr. John Yee", title: "Chief Medical Officer" },
    { name: "Mel Interiano", title: "Chief Executive Officer" },
  ],
  cofoundersNote: "Co-founders · LiLi M.D.",
};

export const workLess = {
  heading: "Work Less. Earn More.",
  body: "We build and operate the AI that runs your practice, from front desk operations to billing, so you can work less, retain more revenue, and increase the long-term value of your business. We are selecting just ten founding physicians to help shape the future of AI-native healthcare practices.",
};

export const problem = {
  heading: { line1: "The Problem", line2: "& The Third Option" },
  intro:
    "An independent physician running a practice today faces three distinct strategic options.",
  // Order matches the design: Sell | AI-Native (highlight) | Keep Grinding.
  options: [
    {
      title: "Sell Your Practice",
      body: "Sell to a hospital or large group to get better technology and a lighter workload, and give up your independence to do it.",
      icon: "/problem-jail.png",
      highlight: false,
    },
    {
      title: "The AI-Native Path — LiLi M.D.",
      body: "Run your practice AI-natively while retaining full corporate ownership.",
      icon: "/problem-emblem.png",
      highlight: true,
    },
    {
      title: "Keep Grinding",
      body: "Continue operating on legacy infrastructure, as independent practices have fallen from 60% to 42% of the market.",
      icon: "/problem-ball-chain.png",
      highlight: false,
    },
  ],
};

export const whatWeHandle = {
  heading: "What LiLi M.D. Handles",
  body: "Our AI runs the business side of your practice: insurance checks, coding, claims, denials, payments, and patient collections. It also writes your visit notes and shows your money in one clear view. It works on the system you already use, on secure, HIPAA-compliant Google Cloud, with people watching over it at every step.",
  cta: "Learn More",
  image: "/ai-graphic.png",
};

export const asset = {
  heading: { line1: "Turn Your Practice", line2: "into an AI Asset" },
  body: "Move your business onto an intelligent operating layer, eliminate administrative friction and maximize your enterprise value.",
  image: "/asset-all.png",
};

export const benefits = {
  heading: { line1: "Founding Member", line2: "Benefits" },
  items: [
    { title: "50,000 Shares of Equity", image: "/benefit-1.png" },
    { title: "Zero Setup Fees Forever", image: "/benefit-2.png" },
    { title: "Private Club Membership", image: "/benefit-3.png" },
    { title: "Lower Costs, More Revenue", image: "/benefit-4.png" },
    { title: "Higher Business Value", image: "/benefit-5.png" },
  ],
};

export const phases = {
  heading: { line1: "The Three-Phase", line2: "Practice Journey" },
  subheading:
    "Three phases over 90 days. You only pay once a phase is up and working.",
  items: [
    {
      number: "01",
      rate: "2% of Collections",
      body: "Insurance checks, coding, claims, denials, payments, collections, and visit notes, plus a website refresh, social media, and AI search.",
    },
    {
      number: "02",
      rate: "4% of Collections",
      body: "An AI phone agent, scheduling and patient intake, faxes, referrals, documents, AI-written letters, prior authorizations, and quality forms.",
    },
    {
      number: "03",
      rate: "6% of Collections",
      body: "New cash-pay services, in-practice products, quality programs (HEDIS, HCC, MIPS), credentialing, compliance, and one view of every location.",
    },
  ],
};

export const trust = {
  heading: { line1: "Built on trusted", line2: "technology" },
  subheading: "Secure. Compliant. Reliable.",
  badges: [
    { label: "Google Cloud", image: "/google-badge.png" },
    { label: "HIPAA Compliant", image: "/hipaa-compliant.png" },
  ],
};

export const tiers = {
  heading: "Membership Tier Privileges",
  items: [
    {
      tier: "Tier 1",
      name: "The Architects",
      bullets: [
        "No setup fee. 50,000 shares of equity.",
        "A permanent seat at the top, and a say in what the club builds.",
        "Pays 2% / 4% / 6% of collections.",
      ],
      highlight: true,
    },
    {
      tier: "Tier 2",
      name: "The Laureates",
      bullets: [
        "$25,000 one-time setup fee. Full member of the club.",
        "No equity.",
        "Pays the same 2% / 4% / 6% of collections.",
      ],
      highlight: false,
    },
    {
      tier: "Tier 3",
      name: "The Luminaries",
      bullets: [
        "$50,000 one-time setup fee.",
        "Full member of the club.",
        "No equity. Pays the same 2% / 4% / 6% of collections.",
      ],
      highlight: false,
    },
  ],
};

export const timeline = {
  heading: { line1: "The 3-Tier", line2: "Growth Timeline" },
  body: "Every doctor pays the same rate. What changes as the club grows is the setup fee and the founding equity, which is saved for the first ten only.",
  steps: [
    { count: "10", label: "The Architects" },
    { count: "100", label: "The Laureates" },
    { count: "1000", label: "The Luminaries" },
  ],
};

export const foundingTen = {
  heading: { line1: "Claim Your Place in", line2: "the Founding 10" },
  body: "These 10 permanent profile slots are being claimed sequentially, and once they are full, the inner circle closes forever.",
  image: "/founding-slates.png",
};

export const submit = {
  heading: { line1: "Submit Your Practice", line2: "for Qualification" },
  body: "Because the founding circle is limited to ten independent physicians, entry is by invitation, through a conversation with the founders.",
  formIntro:
    "Completing the brief profile below lets the founders get to know your practice before a place is offered.",
  socialsLabel: "Socials",
  fields: {
    name: "Name",
    email: "Email",
    message: "Message",
  },
  cta: "Submit",
};

export const footer = {
  navHeading: "Navigate",
  legal: "The Private Club at LiLi M.D.",
};
