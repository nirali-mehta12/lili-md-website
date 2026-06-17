/*
  ============================================================
  LiLi M.D. — Site content
  ------------------------------------------------------------
  ALL copy lives here so text edits happen in one place
  (no need to touch the layout/JSX). Pulled from the Canva
  design. Edit freely; sections read from these exports.
  ============================================================
*/

export const brand = {
  name: "LiLi M.D.",
  tagline: "Work Less. Earn More.",
};

export const nav = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#submit" },
];

export const hero = {
  club: "The Private Club at LiLi M.D.",
  subtitle:
    "Ten founding physicians. By invitation only. Selections this June.",
  cardHeading: "Work Less. Earn More.",
  cardBody:
    "We build and operate the AI that runs your practice, from front desk operations to billing, so you can work less, retain more revenue, and increase the long-term value of your business. We are selecting just ten founding physicians to help shape the future of AI-native healthcare practices.",
};

export const problem = {
  heading: "The Problem & The Third Option",
  intro:
    "An independent physician running a practice today faces three distinct strategic options.",
  options: [
    {
      title: "Sell Your Practice",
      body: "Sell to a hospital or large group to get better technology and a lighter workload, and give up your independence to do it.",
      highlight: false,
    },
    {
      title: "Keep Grinding",
      body: "Continue operating on legacy infrastructure, as independent practices have fallen from 60% to 42% of the market.",
      highlight: false,
    },
    {
      title: "The AI-Native Path — LiLi M.D.",
      body: "Run your practice AI-natively while retaining full corporate ownership.",
      highlight: true,
    },
  ],
};

export const whatWeHandle = {
  heading: "What LiLi M.D. Handles",
  body: "Our AI runs the business side of your practice: insurance checks, coding, claims, denials, payments, and patient collections. It also writes your visit notes and shows your money in one clear view. It works on the system you already use, on secure, HIPAA-compliant Google Cloud, with people watching over it at every step.",
  cta: "Learn More",
};

export const asset = {
  heading: "Turn Your Practice into an AI Asset",
  body: "Move your business onto an intelligent operating layer, eliminate administrative friction and maximize your enterprise value.",
  primaryCta: "Apply Now",
  secondaryCta: "Learn More",
};

export const benefits = {
  heading: "Founding Member Benefits",
  items: [
    { title: "50,000 Shares of Equity" },
    { title: "Zero Setup Fees Forever" },
    { title: "Private Club Membership" },
    { title: "Lower Costs, More Revenue" },
    { title: "Higher Business Value" },
  ],
};

export const phases = {
  heading: "The Three-Phase Practice Journey",
  subheading:
    "Three phases over 90 days. You only pay once a phase is up and working.",
  items: [
    {
      number: "01",
      label: "Autonomous",
      rate: "2% of Collections",
      body: "Insurance checks, coding, claims, denials, payments, collections, and visit notes, plus a website refresh, social media, and AI search.",
    },
    {
      number: "02",
      label: "Optimized",
      rate: "4% of Collections",
      body: "An AI phone agent, scheduling and patient intake, faxes, referrals, documents, AI-written letters, prior authorizations, and quality forms.",
    },
    {
      number: "03",
      label: "High-Value",
      rate: "6% of Collections",
      body: "New cash-pay services, in-practice products, quality programs (HEDIS, HCC, MIPS), credentialing, compliance, and one view of every location.",
    },
  ],
};

export const trust = {
  heading: "Built on trusted technology",
  subheading: "Secure. Compliant. Reliable.",
  // PLACEHOLDER badge labels — swap for the real badge images from the designer.
  badges: ["Google Cloud", "HIPAA Compliant", "Secure Infrastructure"],
};

export const tiers = {
  heading: "Membership Tier Privileges",
  items: [
    {
      tier: "Tier 1",
      name: "The Founding 10",
      body: "No setup fee. 50,000 shares of equity. A permanent seat at the top, and a say in what the club builds. Pays 2% / 4% / 6% of collections.",
      highlight: true,
    },
    {
      tier: "Tier 2",
      name: "The Laureate 100",
      body: "$25,000 one-time setup fee. Full member of the club. No equity. Pays the same 2% / 4% / 6% of collections.",
      highlight: false,
    },
    {
      tier: "Tier 3",
      name: "The Luminary 1000",
      body: "$50,000 one-time setup fee. Full member of the club. No equity. Pays the same 2% / 4% / 6% of collections.",
      highlight: false,
    },
  ],
};

export const timeline = {
  heading: "The 3-Tier Growth Timeline",
  body: "Every doctor pays the same rate. What changes as the club grows is the setup fee and the founding equity, which is saved for the first ten only.",
  steps: [
    { count: "10", label: "The Founding 10" },
    { count: "100", label: "The Laureate 100" },
    { count: "1000", label: "The Luminary 1000" },
  ],
};

export const foundingTen = {
  heading: "Claim Your Place in the Founding 10",
  body: "These 10 permanent profile slots are being claimed sequentially, and once they are full, the inner circle closes forever.",
  // status: "available" | "claimed" — update as slots fill.
  slots: Array.from({ length: 10 }, (_, i) => ({
    number: String(i + 1).padStart(2, "0"),
    status: "available" as "available" | "claimed",
  })),
};

export const submit = {
  heading: "Submit Your Practice for Qualification",
  body: "Because the founding circle is limited to ten independent physicians, entry is by invitation, through a conversation with the founders. Completing the brief profile below lets the founders get to know your practice before a place is offered.",
  fields: {
    name: "Name",
    email: "Email",
    message: "Message",
    socials: "Socials",
  },
  cta: "Submit",
  privacyNote: "Your details are kept private and used only to evaluate your practice.",
};

export const footer = {
  blurbHeading: "Work Less. Earn More.",
  blurb:
    "We build and operate the AI that runs your practice, from front desk operations to billing, so you can work less, retain more revenue, and increase the long-term value of your business. We are selecting just ten founding physicians to help shape the future of AI-native healthcare practices.",
  privateClub:
    "The Private Club at LiLi M.D. — Ten founding physicians. By invitation only. Selections this June.",
  navHeading: "Navigate",
  // PLACEHOLDER social links — replace href with the real profile URLs.
  socials: [
    { label: "LinkedIn", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "Facebook", href: "#" },
  ],
};
