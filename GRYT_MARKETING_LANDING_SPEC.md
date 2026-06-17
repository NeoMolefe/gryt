# GRYT — Marketing Landing Page Spec
## Claude Code Executable Specification
**Version:** 1.0
**Scope:** Public marketing landing page only (replaces current single-screen `/` route)
**Visual reference:** Lunera-style SaaS landing page skill, adapted to GRYT's dark/orange theme
**Depends on:** Phase 1 (Auth) — CTAs route into existing `/sign-up` and `/login` routes
**Do not touch:** Auth logic, onboarding, dashboard, or any authenticated route

---

## WHY THIS PAGE LOOKS DIFFERENT FROM THE REFERENCE SKILL

The Lunera skill is a light-mode, blue-accent fintech template. GRYT is dark-mode, orange-accent, athletic. This spec keeps the skill's **structure, motion patterns, and component mechanics** (floating navbar, scroll reveals, card hover lifts, accordion behaviour, sticky-scroll process section) but maps every colour token to GRYT's existing design system. Do not use the skill's literal hex values for backgrounds, text, or accents. Do use its layout architecture, spacing scale, and interaction patterns.

Two sections from the reference skill are cut because they don't apply to GRYT: **Integrations** (no third-party tool integrations exist) and **Blog** (no blog exists). Do not build placeholder versions of these. The Testimonials section is replaced with a **Training Methodology** section since no real users/testimonials exist yet — do not fabricate quotes, names, or review counts anywhere on this page.

---

## TOKEN MAPPING — REFERENCE SKILL → GRYT

Use this mapping everywhere the reference skill specifies a colour.

| Reference skill token | Reference value | GRYT replacement |
|---|---|---|
| `--white` / page background | `#ffffff` | `#0A0A0A` |
| `--off-white` / `--surface` | `#fafafa` / `#f4f4f4` | `#111111` |
| `--border-light` / `--border-mid` | `#eeeeee` / `#e6e6e6` | `#1F1F1F` / `#2A2A2A` |
| `--dark` (text on light) | `#1a1a1a` | `#FFFFFF` (text is now light-on-dark) |
| `--secondary` (muted text) | `#605f5f` | `#888888` |
| `--subdued` | `#999999` | `#666666` |
| `--accent-base` (primary CTA) | `#4686fe` | `#FF5C1A` |
| `--accent-light` (hover) | `#659bff` | `#E04D10` |
| `--accent-tint` (badge bg, 10%) | `#659bff1a` | `#FF5C1A1a` |
| Feature card gradient | `linear-gradient(180deg,#fff,#f4f4f4,#fafafa)` | `linear-gradient(180deg,#161616,#111,#0D0D0D)` |
| Black button (`.btn-black`) | `#000` bg | Keep as-is — already dark, works on dark bg with a 1px lighter border for definition: `background:#1A1A1A; border:1px solid #2A2A2A` |
| Phase accent colours (GRYT-specific, not in reference skill) | n/a | Foundation `#3B82F6` / Build `#F59E0B` / Peak `#EF4444` / Deload `#22C55E` — use these only if the page references training phases visually |

**Typography:** Reference skill specifies Geist. Use Geist if available via Google Fonts; otherwise fall back to the Inter font already loaded in the GRYT project (`src/index.css`). Do not introduce a second font family into the codebase — pick one and use it for both this page and the existing app shell.

**Spacing, breakpoints, and component mechanics** (navbar shape, card padding, accordion max-height transitions, sticky-scroll observer logic, counter animation) — use exactly as specified in the reference skill. These are theme-agnostic.

---

## CONFIRMED CONTENT — DO NOT INVENT ALTERNATIVES

This is real product content. Use it verbatim where specified. Do not substitute placeholder copy for any of these values.

### Pricing (single tier, two billing periods, time-limited founding offer)

```
Plan name: Premium

Founding Member rate (first 100 paying users only):
  Monthly: R79/month
  Annual:  R632/year  (≈ 2 months free vs monthly founding rate)
  Badge: "Founding Member" badge displayed permanently in-app
  This rate is grandfathered for life for users who lock it in.

Standard rate (user #101 onward):
  Monthly: R99/month
  Annual:  R890/year

Free trial: 7 days, no payment required upfront. Card may be required to start
trial depending on your payment processor's flow — do not assume Stripe-specific
behaviour in this spec; just say "Start your 7-day free trial" on CTAs.

Premium tier includes:
  - Full programme access
  - Unlimited workout logging
  - 10 Kwazi messages/day
  - Progress metrics and analytics
  - Phase overview and calendar
```

### Pricing section display logic

Show ONE pricing card (not three — GRYT has one tier, not Starter/Growth/Scale like the reference skill). Inside that single card, show a monthly/annual toggle.

Above the card, show a scarcity element: "X / 100 founding spots remaining" — this number must be wired to a real count, not hardcoded. See Part 4 for the data source. If founding spots are exhausted (count reaches 0), hide the founding messaging entirely and show only the standard rate — do not show "0 spots remaining," that reads as dead rather than urgent.

Do not build a 3-column pricing grid. Centre a single card, max-width ~360px, exactly as the reference skill's "highlight card" treatment (the one with the accent border) — apply that treatment to this single card since it's the only one.

### Sections to cut entirely

Do not build: Integrations section, Blog section, Testimonials section (literal name). Do not leave empty containers, commented-out code, or "coming soon" stubs for these — simply omit them from the page structure.

### Replacement for Testimonials — "Training Methodology" section

Replace with a section explaining the training science behind GRYT, not social proof. Content:

```
Section tag: "The science"
H2: "Built on training principles that work."
Three pillars, each with an icon, title, and 1-2 sentence description:

1. Progressive overload, tracked precisely
   Every session adjusts based on your logged RPE — not a generic week-over-week bump.

2. Readiness-based adaptation
   Your plan responds to how you actually feel, not just what the calendar says.

3. Phase periodisation
   Foundation, Build, and Peak phases sequence your training so adaptations
   compound instead of plateauing.
```

No fabricated user counts, no review stars, no "12K+ athletes" — do not invent adoption metrics anywhere on this page. If you need a number for visual interest, use something verifiably true and static, such as the count of exercises in the library or the number of distinct training archetypes the engine supports — confirm the real number from the codebase before displaying it, do not estimate.

---

## PAGE STRUCTURE

Build in this order, top to bottom:

```
1. NAVBAR        — floating pill, fixed
2. HERO          — headline, subhead, dual CTA, trust line
3. FEATURES      — membership perks, 2-col card grid
4. HOW IT WORKS  — 3-step process, sticky-scroll on desktop
5. METHODOLOGY   — replaces testimonials, 3-pillar science section
6. PRICING       — single tier card, monthly/annual toggle, founding scarcity
7. FAQ           — accordion, real questions only
8. FOOTER        — dark, links + legal + Instagram
```

Cut: Integrations, Blog, Testimonials (as specified above).

---

## PART 1 — NAVBAR

Adapt the reference skill's floating pill navbar exactly, with GRYT tokens.

```tsx
// src/components/marketing/MarketingNav.tsx

- Fixed, top: 20px, centred via translateX(-50%) on desktop
- Background: #111111, border: 1px solid #2A2A2A
- border-radius: 100px
- box-shadow: 0px 10px 20px rgba(0,0,0,0.4)  // darker shadow for dark bg, not the light 0.05 alpha from reference
- Padding: 12px 12px 12px 20px
- Left: GRYT wordmark
- Right: single CTA pill button "Get Started" using btn-primary styling (orange, see Part 2)
- On scroll past 20px: shadow intensifies slightly (same mechanic as reference skill's JS, adjust shadow values for dark bg)
- Mobile (≤809px): stretch full width with 20px side margins, same as reference skill breakpoint behaviour
- No nav links in the centre — GRYT's page is shorter than the reference skill's, a single CTA is enough. Do not force in "Features / Pricing / FAQ" nav links if it makes the pill cramped on mobile; if you do include them, they must collapse behind a hamburger below 809px exactly as the reference skill specifies.
```

---

## PART 2 — HERO

```tsx
// src/components/marketing/Hero.tsx

Badge (pill, above headline):
  "New · Kwazi AI coaching is live" — only show this if true; if Kwazi is not
  yet shippable, change copy to something currently true, e.g. "Built for the
  ones who show up." as a tag instead of a "new feature" announcement. Do not
  claim a feature is live if it isn't finished.

H1 (use reference skill's H1 type spec: 64px desktop → 40px mobile, weight 500,
letter-spacing -0.04em, line-height 1.1):
  "BREAK. BUILD. BECOME."

Subhead (reference skill's body type, 18px, ls -0.02em):
  "Your programme. Your pace. Built for the ones who show up."

CTA row (two buttons, side by side on desktop, stacked on mobile):
  Primary (btn-primary, orange): "Start Free Trial"
    → routes to /sign-up
  Secondary (btn-outline): "Sign In"
    → routes to /login

Trust line beneath CTAs:
  "7-day free trial. No commitment." — this is true and verifiable, use this
  instead of fabricated user counts or star ratings.

Visual: Do NOT use a phone mockup PNG (reference skill's hero visual) unless
you have a real screenshot of the GRYT dashboard to use. A fake/placeholder
phone mockup showing invented UI is misleading. If no real screenshot exists
yet, skip the visual entirely and let the hero be text-centred — this is
consistent with the reference skill's "centred hero" layout variant, just
without the device mockup.
```

---

## PART 3 — FEATURES

Use the reference skill's 2-column feature card grid mechanics (card padding, hover lift, gradient background mapped to GRYT tokens per the table above) but with GRYT's real perks — these already exist in your spec, do not invent new ones:

```
Section tag: "What you get"
H2: "Train smarter with adaptive features."

Cards (6, 2 columns × 3 rows on desktop, 1 column on mobile):
1. Structured Programmes — "8–12 week adaptive plans built around your goal,
   equipment, and schedule."
2. Kwazi, Your AI Coach — "An intelligent training coach that knows your
   plan, your history, and your goals."
3. Real-Time RPE Adaptation — "Your sessions adjust based on how each set
   actually felt — not a fixed script."
4. Personal Best Detection — "Every PB is tracked and celebrated the moment
   it happens."
5. Phase-Based Progression — "Foundation, Build, and Peak phases sequence
   your training so gains compound."
6. Recovery & Deload Intelligence — "Readiness tracking that knows when to
   push and when to back off."

Each card: icon (Lucide, stroke-based, matching reference skill's icon spec
of stroke-width 1.5, 24x24, currentColor) + H4 title + 1-2 line description.
No illustration SVGs required — reference skill's flat illustrations are
nice-to-have, not required for launch. If time allows, simple line-icon
illustrations can be added later as a polish pass.
```

---

## PART 4 — HOW IT WORKS

Use the reference skill's sticky-scroll 3-step process section mechanics exactly (the IntersectionObserver reveal pattern, sticky left column on desktop ≥1200px, stacked on mobile).

```
Section tag: "How it works"
H2: "From onboarding to your first PB."

Step 01 — Tell us your goal
  "A 90-second setup. Tap your way through — no dropdowns, no clutter."

Step 02 — Get your programme
  "A plan built around your equipment, your schedule, and your goal —
  generated in seconds."

Step 03 — Train, log, adapt
  "Log every set. Kwazi and your readiness data adjust the plan as you go."
```

---

## PART 5 — METHODOLOGY (testimonials replacement)

As specified in the Confirmed Content section above. Use the reference skill's card layout mechanics (3-column on desktop, stacked on mobile) but apply it to the 3 methodology pillars instead of testimonial cards. No avatar circles, no star ratings, no quote marks — this is an explanatory section, not social proof, and should not visually impersonate a testimonial to avoid implying false social proof.

---

## PART 6 — PRICING

This is the section most likely to be built wrong if rushed. Read this fully before implementing.

### Data requirement

The founding member count ("X / 100 spots remaining") must come from a real query, not a hardcoded number. Add this to the build:

```sql
-- Add to your existing schema
create table public.founding_members (
  id uuid primary key references auth.users(id) on delete cascade,
  claimed_at timestamptz not null default now()
);
alter table public.founding_members enable row level security;
create policy "public read count" on public.founding_members
  for select using (true);
```

```ts
// src/lib/pricing/foundingCount.ts
// Query count of rows in founding_members. If count >= 100, founding offer is closed.
// Use TanStack Query to fetch this on page load, cache for a short period
// (e.g. staleTime: 60_000) since it doesn't need to be real-time-precise.
```

If you do not yet have Stripe or another payment processor wired up, the pricing card's CTA should still say "Start Free Trial" and route to `/sign-up` — payment collection happens after trial signup, not on the marketing page itself. Do not block this spec on having billing fully wired; that's a separate integration task. This page's job is to communicate pricing clearly and drive sign-ups into the trial.

### Card content

```tsx
// src/components/marketing/PricingCard.tsx

Scarcity line above card (only rendered if founding_count < 100):
  "[100 - founding_count] of 100 founding spots remaining"
  Small, muted, centred above the card.

If founding_count >= 100:
  Do not show scarcity line. Do not show founding rate at all — only
  standard pricing.

Card (single, centred, max-width 360px, accent border treatment from
reference skill's "highlight" pricing tier):
  Badge (only if spots remain): "Founding Member Price" pill, top of card
  Plan name: "Premium"

  Billing toggle (two pill buttons, monthly | annual, matches reference
  skill's tab/toggle mechanic):
    Monthly selected by default

  Price display (large, reference skill's H2 scale ~48px):
    If spots remain AND monthly selected: "R79" + "/month" (smaller, muted)
      Beneath: strikethrough "R99" with "regular price" label, small text
    If spots remain AND annual selected: "R632" + "/year"
      Beneath: strikethrough "R890" with "regular price" label
    If no spots remain AND monthly: "R99" + "/month"
    If no spots remain AND annual: "R890" + "/year"

  If spots remain, add one line beneath price:
    "Locked in for life as a founding member."

  Feature list (5 lines, checkmark icon + text, matches reference skill's
  pricing tier feature-line pattern):
    ✓ Full programme access
    ✓ Unlimited workout logging
    ✓ 10 Kwazi messages/day
    ✓ Progress metrics and analytics
    ✓ Phase overview and calendar

  CTA button (full width, btn-primary orange):
    "Start Free Trial"
    → routes to /sign-up
    Beneath button, small centred text: "7 days free. Cancel anytime before
    your trial ends."
```

### What NOT to build here

Do not build a 3-tier comparison grid. Do not invent a "Free" tier or a higher "Pro"/"Elite" tier — GRYT has exactly one paid tier with two billing periods and a time-limited founding discount. Resist the urge to pad this section with tiers that don't exist just because the reference skill shows three columns.

---

## PART 7 — FAQ

Use the reference skill's accordion mechanics exactly: `max-height` transition (not `display:none`), single item open at a time or multiple — your choice, but be consistent. `aria-expanded` and `aria-controls` wired correctly per the reference skill's accessibility notes.

Real questions only — do not invent vague filler questions:

```
1. How does the 7-day free trial work?
   "You get full Premium access for 7 days. No charge until the trial ends,
   and you can cancel anytime before then."

2. What happens after the first 100 founding members?
   "New users pay the standard rate of R99/month or R890/year. Founding
   members keep their discounted rate for life."

3. Can I train with just bodyweight or home equipment?
   "Yes. During onboarding you tell GRYT what equipment you have, and your
   programme is built around it — full gym, home gym, or bodyweight only."

4. How many messages can I send Kwazi per day?
   "Premium includes 10 Kwazi messages per day, resetting at midnight."

5. Can I change my goals or equipment later?
   "Yes. You can regenerate your plan anytime from Settings if your goals,
   equipment, or availability change."
```

---

## PART 8 — FOOTER

Dark footer (reference skill's footer is already dark — `--gradient-dark`, map this to `#000000` or `#0A0A0A` to match GRYT's base, they're already close).

```
Left column: GRYT wordmark + tagline "BREAK. BUILD. BECOME."
Right column: 
  - Link: Privacy Policy → /privacy
  - Link: Terms of Service → /terms
  - Link: Contact (mailto:info@gryt.co.za)
  - Instagram icon + @gryt.app → https://www.instagram.com/gryt.app
Bottom line: "© 2026 GRYT. All rights reserved."
```

Use reference skill's footer link hover transition (`cubic-bezier(0.44, 0, 0.56, 1)`).

---

## ACCESSIBILITY — CARRY OVER FROM REFERENCE SKILL EXACTLY

These requirements from the reference skill apply unchanged:

```css
:focus-visible {
  outline: 2px solid #FF5C1A;   /* GRYT orange, not reference skill's blue */
  outline-offset: 3px;
  border-radius: 4px;
}
```

- All icon-only buttons need `aria-label`
- FAQ buttons need `aria-expanded` and `aria-controls`
- Colour contrast: white text on `#0A0A0A`/`#111111` backgrounds must meet WCAG AA — verify this explicitly, since dark-on-dark is a different risk profile than the reference skill's light-mode contrast (which was already AA-compliant by design). Test `#888888` muted text against `#0A0A0A` background specifically — at this exact pairing, contrast ratio is approximately 5.9:1, which passes AA for normal text (4.5:1 minimum) but check before shipping if you change either value.
- `prefers-reduced-motion` query at the top of any scroll-reveal or counter animation code — disable animations, show content immediately, for users who request reduced motion

---

## "READ EVERYTHING CLEARLY" — SPECIFIC REQUIREMENTS

This was explicitly requested. Apply these rules throughout the page, not just generally:

- Body text minimum size: 16px on mobile (reference skill's "P small" spec). Do not go below this anywhere except legal fine print, which is 13px minimum.
- Muted text (`#888888`, `#666666`) is for secondary information only — never use muted colours for primary headlines, CTA button text, or pricing numbers. Those must always be full white (`#FFFFFF`) or, for CTA button text on orange backgrounds, white as well (orange background + white text, not orange-on-orange).
- Line length: cap paragraph width at roughly 60-character measure on desktop using `max-width` on text containers — long unbroken lines on a dark background are harder to track visually than on light backgrounds, so this matters more here than it did in the reference skill's light-mode version.
- Line-height: do not go below 1.4 for body text, 1.1 for large display headlines, exactly as the reference skill specifies — these ratios exist for readability reasons independent of colour theme.
- Test the actual pricing card numbers (R79, R632, R99, R890) at the specified sizes against the dark background before considering this section done — strikethrough text in particular needs enough contrast to be legible, not just decoratively present.

---

## VERIFICATION CHECKLIST

- [ ] Navbar floats, shows scroll-shadow behaviour, collapses correctly on mobile
- [ ] Hero headline, subhead, both CTAs render and route correctly (`/sign-up`, `/login`)
- [ ] No fake user count, star rating, or "new feature" claim for anything not actually live
- [ ] Features section shows all 6 real GRYT perks, none invented
- [ ] How It Works shows 3 real steps with sticky-scroll behaviour on desktop ≥1200px
- [ ] Methodology section replaces testimonials — no fabricated quotes or names anywhere
- [ ] Integrations and Blog sections are absent — not empty, not "coming soon," just not present
- [ ] Pricing section shows ONE card, not three
- [ ] Founding member count is fetched from `founding_members` table, not hardcoded
- [ ] If founding count reaches 100, founding messaging disappears and only standard pricing shows
- [ ] Monthly/annual toggle correctly switches between R79/R632 (founding) or R99/R890 (standard)
- [ ] Strikethrough regular price only shows when founding rate is active
- [ ] Pricing CTA routes to `/sign-up`, not to a payment page that doesn't exist yet
- [ ] FAQ accordion uses max-height transition, not display:none; aria attributes correct
- [ ] Footer has working Privacy/Terms/Contact/Instagram links
- [ ] All text passes the "read everything clearly" rules above — spot check on a 390px viewport, not just desktop
- [ ] `prefers-reduced-motion` disables scroll-reveal and counter animations
- [ ] `pnpm tsc --noEmit` passes with zero errors after this page is built

---

## WHAT THIS SPEC DELIBERATELY DOES NOT INCLUDE

- Payment processor integration (Stripe, Paystack, etc.) — that's a separate task. This page just routes to sign-up.
- A phone mockup image — add this once a real dashboard screenshot exists; do not fabricate one.
- Blog or Integrations sections — cut per your decision, not deferred.
- Testimonials in any form — replaced with Methodology per your decision.
- Multi-tier pricing — GRYT has one tier; do not let the reference skill's 3-column pricing template pressure you into inventing two more.
