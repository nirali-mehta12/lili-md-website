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
  // { label: "About", href: "#about" },  // hidden from header + footer; uncomment to restore
  // Label "Apply" scrolls to the Be Considered CTA (#contact). Not the /apply gate page.
  { label: "Apply", href: "#contact" },
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
      name: "Founding Architects",
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
    { count: "10", label: "Founding Architects" },
    { count: "100", label: "The Laureates" },
    { count: "1000", label: "The Luminaries" },
  ],
};

export const foundingTen = {
  heading: { line1: "Claim Your Place in", line2: "the Founding 10" },
  body: "These 10 permanent profile slots are being claimed sequentially, and once they are full, the inner circle closes forever.",
  image: "/founding-slates.png",
};

/*
  Second access gate — /apply. Copy for the doctor-info entry form.
  Note: this page uses a distinct rose/mauve palette per the designer
  reference (docs/lili-md-access-gate-page2.html), separate from the
  main site's gold/wine theme. Palette lives inside the page CSS itself.
*/
export const apply = {
  meta: {
    title: "Private Access — The Private Club at LiLi M.D.",
  },
  heading: "Private Access",
  intro:
    "You've been invited. Enter your information below to gain access and discover everything membership has to offer.",
  fields: {
    firstName: "First Name",
    lastName: "Last Name",
    practiceName: "Practice / Business Name",
    website: "Practice Website",
    phone: "Mobile Phone",
    email: "Email",
    licenseNo: "Medical License No.",
    ehrPlaceholder: "Current EHR",
    referredBy: "Referred By (if applicable)",
  },
  // Full 85-option list per Mel (docs/ehr_dropdown.json). Ordered by
  // most-common → specialty/mid-tier → long tail → "not listed / paper / not sure"
  // so the top few pick up ~80% of real submissions.
  ehrOptions: [
    "eClinicalWorks",
    "athenahealth",
    "Epic",
    "NextGen Healthcare",
    "Greenway Health",
    "Practice Fusion",
    "AdvancedMD",
    "Tebra (Kareo)",
    "DrChrono",
    "CureMD",
    "Elation Health",
    "ModMed (Modernizing Medicine)",
    "Oracle Health (Cerner)",
    "MEDITECH",
    "Allscripts / Veradigm",
    "Nextech",
    "Ezderm",
    "EMA / ModMed Derm",
    "SimplePractice",
    "TherapyNotes",
    "TheraNest / Ensora",
    "Kipu",
    "WebPT",
    "SPRY",
    "Prompt EMR",
    "Dentrix",
    "Dentrix Ascend",
    "Eaglesoft",
    "Open Dental",
    "Curve Dental",
    "Edvak",
    "PrognoCIS",
    "OmniMD",
    "Experity",
    "Office Ally",
    "RXNT",
    "Netsmart",
    "Valant",
    "Qualifacts",
    "ICANotes",
    "Kalix",
    "Jane App",
    "Power2Practice",
    "4D EMR",
    "PatientNow",
    "WRS Health",
    "Compulink",
    "EncounterWorks",
    "iSalus",
    "Azalea Health",
    "Intergy (Greenway)",
    "Praxis EMR",
    "Amazing Charts",
    "MDToolbox",
    "Sevocity",
    "ChartLogic",
    "Modernizing Medicine EMA",
    "TruBridge (CPSI) / Evident",
    "Altera (Sunrise)",
    "Medhost",
    "Netsmart myUnity",
    "Foothold AWARDS",
    "OpenEMR",
    "Epic Community Connect",
    "GE Healthcare Centricity",
    "MEDENT",
    "eMDs (CompuGroup)",
    "CompuGroup Medical",
    "InSync",
    "Nextech Ophthalmology",
    "Bizmatics",
    "MicroMD",
    "Optimantra",
    "DeepScribe-linked EHR",
    "Canvas Medical",
    "Akute Health",
    "Elation (DPC)",
    "Cerbo",
    "Charm Health",
    "DrCloudEHR",
    "MDVision",
    "Waystar-linked",
    "Other (not listed)",
    "No EHR / paper",
    "Not sure",
  ],
  consent:
    "By requesting access, I confirm I am a U.S.-licensed physician and agree to LiLi M.D.'s communication policies, including receiving SMS messages.",
  cta: "Request Access",
  ctaPending: "Submitting…",
  fineprint: "Your information is kept private and confidential.",
  footer: "The Private Club at LiLi M.D.",
  success: {
    heading: "Access Granted",
    body: "Welcome to The Private Club at LiLi M.D. Redirecting you to the site…",
  },
  // User-facing error messages — kept in one place so tone stays consistent.
  errors: {
    missingName: "Please enter your first and last name.",
    missingContact: "Please enter your email and phone number.",
    missingFields: "Please complete the required fields.",
    missingConsent: "Please confirm the consent statement to continue.",
    invalidEmail: "Please enter a valid email address.",
    invalidPhone: "Please enter a 10-digit US phone number.",
    invalidEhr: "Please pick your EHR from the list.",
    tooLarge: "One of the fields is too long. Please shorten and try again.",
    rateLimited: "Too many attempts. Please wait a few minutes and try again.",
    network: "Network error. Please try again.",
    generic: "Something went wrong. Please try again.",
    unavailable:
      "We couldn't process your request right now. Please try again in a minute.",
  },
} as const;

/*
  As of 2026-07-07 (Ronnie's design update): the landing-page contact
  section replaces the form with a single "Be Considered" call-to-action
  button. All doctor info is already captured at the /apply gate.
  Clicking the button fires an admin-notification email so Mel knows the
  doctor is actively raising their hand.

  The old form copy (`submit.fields`, `submit.formIntro`, etc.) is kept
  below so it can be restored if the form pattern is ever needed again.
*/
export const submit = {
  eyebrow: "Ten Founding Physicians. By Invitation Only.",
  headingItalic: "Be",
  heading: "Considered",
  body: "Click below to be considered and receive the opportunity to be invited to a personal meeting with us.",
  cta: "Click Here to Be Considered",
  ctaAlt: "Be Considered button — request a personal meeting",
  ctaSent: "Request Sent",
  ctaPending: "Sending…",
  successMessage:
    "Thank you for your interest. Your request has been received. We’ll be in touch personally to continue the conversation.",
  // Rendered uppercase via CSS next to the lock glyph in SubmitForm.
  note: "This club is by invitation only",
  errorGeneric: "Something went wrong. Please try again.",
  errorNetwork: "Network error. Please try again.",

  // --- Original form copy (kept for possible restoration) ---
  legacyHeading: { line1: "Submit Your Practice", line2: "for Qualification" },
  legacyBody: "Because the founding circle is limited to ten independent physicians, entry is by invitation, through a conversation with the founders.",
  formIntro:
    "Completing the brief profile below lets the founders get to know your practice before a place is offered.",
  socialsLabel: "Socials",
  fields: {
    name: "Name",
    practiceName: "Practice Name",
    email: "Email",
    phone: "Contact Number",
    website: "Practice Website",
    licenseNo: "Medical License No.",
    ehrPlaceholder: "Current EHR",
    referredBy: "Referred By (if applicable)",
    message: "Message",
  },
  legacyCta: "Submit",
};

export const footer = {
  navHeading: "Navigate",
  legal: "The Private Club at LiLi M.D.",
};
