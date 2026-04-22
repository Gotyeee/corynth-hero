# CORYNTH LABS — CLAUDE DESIGN BRIEF
### Homepage — One Shot
### Last updated: April 21, 2026

---

## WHAT YOU ARE BUILDING

Full homepage design for Corynth Labs — a research peptide e-commerce company.
The current hero section is already built and live. DO NOT redesign the hero.
Your job is to design everything BELOW the hero, matching the hero's existing aesthetic exactly.
The hero image (vial-hero.png) is included in this folder — use it as your visual reference for tone, color, and atmosphere.

---

## THE EXISTING HERO (DO NOT CHANGE — MATCH THIS AESTHETIC)

- Full-bleed cinematic product shot — photoreal glass vial on the right, deep atmospheric black background
- Single glowing electric cyan stripe (#00E5FF) on the vial
- Text block on the left: large white headline, muted subtext, white pill CTA button
- Transparent floating header, hairline bottom border only
- Dark gradient overlay left→right for text readability
- Video background (vial-hero.mp4) with static fallback (vial-hero.png)
- This is the visual tone everything below must follow

---

## DESIGN SYSTEM — DO NOT DEVIATE

### Colors
- Background: #050508
- Card/surface: #0F1020
- Borders: #1E2140 (hairline only, 1px)
- Primary accent: #00E5FF (cyan) — use sparingly, only for key moments
- White/primary text: #F0F2FF
- Muted/secondary text: #6B7099
- Success/in-stock: #39FF14 (green dot only, not as a fill color)
- Warning/alerts: #FF4D4D (avoid unless necessary)

### Typography (placeholder — fonts will be finalized later)
- Headlines: bold, large, white
- Labels/data: monospace style, muted
- Body: clean sans-serif, muted gray
- Note: exact fonts TBD — design with clear hierarchy, fonts will be swapped in later

### Aesthetic Rules
- Dark science / research lab — not a supplement store, not a wellness brand
- Linear.app level polish — precision grid, hairline borders, no clutter
- No gradients on text
- No drop shadows on cards — hairline borders only
- No rounded pill buttons except the hero CTA (secondary buttons sharp or slightly rounded)
- No stock imagery, no bodybuilder photos, no generic lab coat images
- No orange, no bright green as primary, no white backgrounds anywhere
- Negative space is your friend — don't fill everything

---

## HOMEPAGE SECTIONS (IN ORDER, BELOW THE HERO)

### 1. PRODUCT CARDS SECTION

**Layout:**
- 4 cards in a row on desktop
- 2 cols on tablet, 1 col on mobile
- 24px gap between cards
- Section sits close below the hero — breathing room but not a huge gap
- No section header above the cards — straight into the grid

**Card anatomy:**
- Square-ish card, ~280px wide on desktop
- TOP 75% of card: white panel (#FFFFFF), product vial image centered with padding
- BOTTOM 25% of card: dark strip (#0F1020)
- 1px hairline border around full card (#1E2140)
- 8px border radius
- Small green dot (●) indicating in-stock, sits in the dark strip
- Dark strip contents: product name left-aligned (bold white) + price right-aligned (monospace white) on same row

**Products (4 cards):**
1. Retatrutide — price TBD
2. CJC-1295 / Ipamorelin — price TBD
3. GHK-Cu — price TBD
4. MOTS-c — price TBD

**Hover:**
- Subtle lift only (card raises ~4px)
- No tilt, no glow, no dramatic effects
- Keep it professional and clean

**Vial images:**
- Placeholder white-bg vial renders for now — same glass vial, cyan stripe, clean white background
- Real product images will be dropped in later

---

### 2. WHY RESEARCHERS CHOOSE US

**Concept:**
- Dark section — slightly lifted from page background (#07070e or similar)
- Comparison table: Corynth Labs vs "Typical Research Chem Supplier"
- Reference: similar to Limitless Peptides' "Why Researchers Choose Us" section but darker, sharper, more clinical

**Layout:**
- Full-width dark panel with rounded corners or edge-to-edge
- Section title centered at top
- 3-column table below: Row label | Corynth Labs | Typical Supplier
- Corynth column: cyan checkmark + text
- Typical column: muted X or warning icon + text
- Hairline row dividers
- Subtle molecular/cellular background texture or pattern behind the section (like Limitless Peptides does with their blue molecular background) — dark, subtle, not distracting

**The 6 rows:**

| Row | Corynth Labs | Typical Supplier |
|-----|-------------|-----------------|
| Purity Verification | ≥98% purity, Janoshik verified | Unverified claims, no documentation |
| Third-Party Testing | Independent lab COA with every batch | Self-reported or no testing |
| Business Entity | Licensed LLC, Oregon registered | No legal entity, anonymous operation |
| Pricing Transparency | Flat pricing, no hidden fees | Variable, inconsistent, no receipts |
| Payment Options | Crypto (10% discount), Zelle, Venmo, CashApp | Crypto only or Telegram cash app DMs |
| Customer Support | Real email, business phone, contact page | Telegram DMs, slow or no response |

---

### 3. FOOTER

**Layout:**
- Dark, minimal
- Hairline top border only
- Left: CORYNTH LABS in cyan, small
- Center: research use disclaimer — "For laboratory research use only · Not for human consumption"
- Right: nav links — Terms · Privacy · Refunds · Contact
- Very bottom: © 2026 Corynth Labs LLC

---

## NAVIGATION (ALREADY BUILT — MATCH ONLY)

Transparent header, floats over hero, hairline bottom border.
Links: Shop · About · COAs · FAQ · Contact
Logo/wordmark left, nav center, no CTA button in nav at launch.

---

## WHAT NOT TO DO

- Do not redesign the hero
- Do not add sections not listed above
- Do not use light backgrounds anywhere
- Do not add animations that feel like a portfolio site or agency site
- Do not use rainbow colors or multiple accent colors — cyan only, used sparingly
- Do not add a stat bar or icon grid section — that was cut
- Do not add an "Explore by Category" section — cut for launch
- Do not put a purity badge on the product cards — that lives on the product page only
- Do not use green (#39FF14) as anything other than the small in-stock dot
- Do not make the comparison table look like a pricing table — it's a trust/comparison section

---

## REFERENCE SITES

- **Hero aesthetic:** vial-hero.png (included in this folder) — match this exactly
- **Card layout:** limitlesspeptides.com — their product card grid, layout and spacing
- **Comparison section:** limitlesspeptides.com — "Why Researchers Choose Us" section, but dark version
- **Overall polish:** linear.app — restraint, precision, hierarchy

---

## FILES IN THIS FOLDER

- CORYNTH-DESIGN-BRIEF.md — this file
- vial-hero.png — existing hero static image (reference for tone + aesthetic)
- vial-hero.mp4 — existing hero video (reference only)
- limitless-cards.png — screenshot of Limitless Peptides card layout (reference)
- limitless-comparison.png — screenshot of Limitless Peptides comparison section (reference)

---

## OUTPUT EXPECTED

Full homepage design — everything below the existing hero through the footer.
Designed to be handed directly to Claude Code for implementation.
No placeholder text other than what's listed above.
Every section, every spacing decision, every color call — locked.
