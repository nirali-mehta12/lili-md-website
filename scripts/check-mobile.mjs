/*
  Full-page screenshots of the dev server at multiple viewports.

  Use this when iterating on a UI change to self-verify the rendering
  without relying on someone else's eyes. Each viewport gets one PNG.

  Prerequisites:
    - Dev server running: `npm run dev` (defaults to http://localhost:3000)
    - Chromium installed once: `npx playwright install chromium`

  Usage:
    node scripts/check-mobile.mjs
    node scripts/check-mobile.mjs http://localhost:3000
    node scripts/check-mobile.mjs http://localhost:3000 iphone14pro desktop
    node scripts/check-mobile.mjs http://localhost:3000 --code=E4S2-YB4F
    node scripts/check-mobile.mjs --section=#about           # clip just one section
    node scripts/check-mobile.mjs --viewport-only            # one screen only (no scroll)

  Args:
    [url]              base URL (default: http://localhost:3000)
    [viewport ...]     one or more viewport keys; default = all
    --code=XXXX        access-gate invite code (sets cookie via ?c= once)
    --section=SELECTOR scroll to + clip just this element (e.g. "#about", ".hero")
    --viewport-only    capture only the visible viewport (no full-page scroll capture)

  Output:
    scripts/screenshots/<viewport>.png   (gitignored)
*/
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const VIEWPORTS = {
  // narrow phone (small Android)
  android: { width: 360, height: 800, deviceScaleFactor: 2.75, isMobile: true },
  // common iPhone
  iphone14: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true },
  // largest iPhone — the one most prone to oversized-padding bugs
  iphone14pro: { width: 430, height: 932, deviceScaleFactor: 3, isMobile: true },
  // small tablet
  ipadmini: { width: 768, height: 1024, deviceScaleFactor: 2 },
  // typical laptop
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1 },
};

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith("--"));
const url = positional[0]?.startsWith("http") ? positional.shift() : "http://localhost:3000";
const selected = positional.length ? positional : Object.keys(VIEWPORTS);
const codeFlag = args.find((a) => a.startsWith("--code="));
const code = codeFlag ? codeFlag.split("=")[1] : null;
const sectionFlag = args.find((a) => a.startsWith("--section="));
const section = sectionFlag ? sectionFlag.split("=")[1] : null;
const viewportOnly = args.includes("--viewport-only");

const OUT_DIR = "scripts/screenshots";
await mkdir(OUT_DIR, { recursive: true });

const unknown = selected.filter((n) => !VIEWPORTS[n]);
if (unknown.length) {
  console.error(`Unknown viewport(s): ${unknown.join(", ")}`);
  console.error(`Choices: ${Object.keys(VIEWPORTS).join(", ")}`);
  process.exit(1);
}

console.log(`→ ${url}${code ? `?c=${code}` : ""}`);
console.log(`→ ${selected.length} viewport(s): ${selected.join(", ")}`);

const browser = await chromium.launch();
try {
  for (const name of selected) {
    const v = VIEWPORTS[name];
    const ctx = await browser.newContext({
      viewport: { width: v.width, height: v.height },
      deviceScaleFactor: v.deviceScaleFactor,
      isMobile: !!v.isMobile,
      // The site's <Reveal/> uses IntersectionObserver to fade content in on
      // scroll. Telling Chromium we prefer reduced motion makes Reveal skip
      // the gate (it respects prefers-reduced-motion), so screenshots capture
      // the final state of every section regardless of scroll position.
      reducedMotion: "reduce",
    });
    const page = await ctx.newPage();
    // First nav uses ?c= to set the access cookie (if gate is enabled).
    const target = code ? `${url}${url.includes("?") ? "&" : "?"}c=${code}` : url;
    await page.goto(target, { waitUntil: "networkidle" });

    // Three capture modes:
    //   --section=SEL   → scroll element into view, clip just that element
    //   --viewport-only → one screen, no scrolling
    //   (default)       → full page (can be very tall; lossy when re-rendered)
    const suffix = section ? `-${section.replace(/[^\w]+/g, "")}` : viewportOnly ? "-viewport" : "";
    const file = join(OUT_DIR, `${name}${suffix}.png`);
    if (section) {
      const el = await page.locator(section).first();
      await el.scrollIntoViewIfNeeded();
      await el.screenshot({ path: file });
    } else {
      await page.screenshot({ path: file, fullPage: !viewportOnly });
    }
    console.log(`  ✓ ${name.padEnd(12)} ${v.width}×${v.height}  →  ${file}`);
    await ctx.close();
  }
} finally {
  await browser.close();
}
