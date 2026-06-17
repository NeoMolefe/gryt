# Lunera-Style SaaS Landing Page — Design Skill

A precise reference for replicating the aesthetic, motion, and interaction patterns of a Lunera-class SaaS landing page. Use this when building a polished finance, productivity, or B2B app marketing site.

---

## 1. Design Identity

**Subject:** Modern SaaS fintech landing page (mobile app + dashboard product)  
**Audience:** Indie founders, early-stage startup teams, product-led growth companies  
**Page job:** Convert visitors to app downloads or signups through trust, clarity, and premium feel  
**Signature element:** Floating pill navbar + spring-animated scroll reveals that make the page feel alive without being distracting

---

## 2. Token System

### Color Palette

```
--white:         #ffffff
--off-white:     #fafafa
--surface:       #f4f4f4
--border-light:  #eeeeee
--border-mid:    #e6e6e6
--muted:         #dadada
--placeholder:   #bdbdbd
--subdued:       #999999
--secondary:     #605f5f
--dark:          #1a1a1a
--black:         #000000

--accent-base:   #4686fe   /* primary CTA blue */
--accent-light:  #659bff   /* hover state, icon backgrounds */
--accent-tint:   #659bff1a /* 10% opacity blue for badge bg */
--accent-subtle: #c7dbff   /* very light blue accents */

--gradient-hero: linear-gradient(#000 85%, #0000 100%)   /* mask on hero visual */
--gradient-feat: linear-gradient(180deg, #fff 0%, #f4f4f4 70%, #fafafa 100%)
--gradient-proc: linear-gradient(314deg, #fafafa 0%, #f4f4f4 100%)
--gradient-cta:  linear-gradient(125deg, #4686fe 0%, #659bff 66%)
--gradient-dark: linear-gradient(139deg, #1a1a1a 0%, #000 100%)
--gradient-intg: linear-gradient(137deg, #ffffff 0%, #eeeeee 105%)
--gradient-bg:   radial-gradient(50% 50% at 50% 50%, #f4f4f4 0%, #fff 100%)
```

### Typography

**Display face:** `Geist` (weight 500 / 700) — tight letter-spacing (`-0.04em` to `-0.05em`), line-height `1.1em`  
**Body face:** `Geist` (weight 400) — letter-spacing `-0.02em`, line-height `1.4em`  
**UI labels / tags:** `Geist` (weight 400–500), `14px`, letter-spacing `-0.02em` to `-0.03em`

```
H1  display:  64px / 500 / ls -0.04em / lh 1.1em  (responsive: 54→40px)
H2  section:  48px / 500 / ls -0.05em / lh 1.2em  (responsive: 44→34px)
H4  card:     26px / 500 / ls -0.03em / lh 1.3em
H6  quote:    20px / 500 / ls -0.03em / lh 1.3em
P   body:     18px / 400 / ls -0.02em / lh 1.4em
P   small:    16px / 400 / ls -0.02em / lh 1.4em
P   label:    14px / 400 / ls -0.02em / lh 1.4em  CAPITALIZE
```

### Spacing Scale

```
Section vertical padding:  100px (desktop) → 64px (tablet) → 64px (mobile)
Section horizontal padding: 80px (desktop) → 40px (tablet) → 20px (mobile)
Card internal padding:      32px (desktop) → 24px (mobile)
Component gap:              64px between major groups
Card gap:                   16px
```

---

## 3. Layout Architecture

```
┌──────────────────────────────────────────┐
│  NAVBAR (fixed/floating, pill shape)     │
├──────────────────────────────────────────┤
│  HERO (centred, full-width)              │
│    badge  ·  h1  ·  subhead              │
│    [ Download App ]  [ Contact Sales ]   │
│    ┌────────────────────────────────┐    │
│    │  Phone mockup  +  UI snippets  │    │
│    └────────────────────────────────┘    │
│    rating widget  ·  CTA pills           │
├──────────────────────────────────────────┤
│  LOGOS  (marquee/ticker, masked edges)   │
├──────────────────────────────────────────┤
│  FEATURES  (2-col grid of cards)         │
├──────────────────────────────────────────┤
│  INTEGRATIONS  (circular orbit diagram) │
├──────────────────────────────────────────┤
│  HOW IT WORKS  (sticky-scroll 3-step)   │
├──────────────────────────────────────────┤
│  PRICING  (3-col, centre card elevated) │
├──────────────────────────────────────────┤
│  TESTIMONIALS  (carousel, metrics row)  │
├──────────────────────────────────────────┤
│  FAQ  (2-col: heading + accordion)      │
├──────────────────────────────────────────┤
│  BLOG  (3-col card grid)                │
├──────────────────────────────────────────┤
│  FOOTER  (dark, 2-col nav + socials)    │
└──────────────────────────────────────────┘
```

**Max content width:** 1300px, centred  
**Breakpoints:** `≥1200px` desktop · `810–1199px` tablet · `≤809px` mobile

---

## 4. Components

### 4.1 Navbar — Floating Pill

```css
nav {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;

  background: #fff;
  border-radius: 100px;
  box-shadow: 0px 10px 20px 0px rgba(0, 0, 0, 0.05);

  display: flex;
  align-items: center;
  gap: 64px;
  padding: 12px 12px 12px 16px;
}

/* On tablet, stretch full width with 40px side margins */
@media (max-width: 1199px) {
  nav {
    transform: none;
    left: 40px;
    right: 40px;
    gap: unset;
    justify-content: space-between;
    width: unset;
  }
}
@media (max-width: 809px) {
  nav {
    left: 20px;
    right: 20px;
  }
}
```

**Nav links** use `cursor: pointer`, no underline, hover is handled by JavaScript toggling `.active` or CSS `:hover { opacity: 0.7 }`.

---

### 4.2 Buttons

**Primary (blue):**
```css
.btn-primary {
  background: #4686fe;
  color: #fff;
  border-radius: 40px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.02em;
  border: none;
  box-shadow:
    0px 4px 8px 0px rgba(0,0,0,0.15),
    inset 0px 2px 2px 0px rgba(255,255,255,0),
    0px 4px 8px 0px rgba(0,0,0,0);
  transition: box-shadow 0.3s ease, transform 0.2s ease;
}
.btn-primary:hover {
  box-shadow:
    0px 8px 16px 0px rgba(70,134,254,0.35),
    0px 2px 4px 0px rgba(0,0,0,0.15);
  transform: translateY(-1px);
}
.btn-primary:active { transform: translateY(0); }
```

**Secondary (outline):**
```css
.btn-outline {
  background: #fff;
  color: #3d3d3d;
  border: 1px solid #eeeeee;
  border-radius: 40px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 500;
  transition: background 0.2s ease, box-shadow 0.2s ease;
}
.btn-outline:hover {
  background: #fafafa;
  box-shadow: 0px 4px 12px 0px rgba(0,0,0,0.08);
}
```

**Black (pricing / blog):**
```css
.btn-black {
  background: #000;
  color: #fff;
  border-radius: 40px;
  padding: 10px 20px;
  font-weight: 500;
  box-shadow: 0px 4px 8px 0px rgba(0,0,0,0.15);
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.btn-black:hover { opacity: 0.85; transform: translateY(-1px); }
```

---

### 4.3 Section Tag (Pill Label)

Small category badges above section headings:

```css
.tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border: 1px solid #e6e6e6;
  border-radius: 40px;
  background: #fff;
  box-shadow: 0px 4px 12px 0px rgba(0,0,0,0.1);
  font-size: 14px;
  font-weight: 400;
  letter-spacing: -0.02em;
  color: #605f5f;
  text-transform: capitalize;
}
```

---

### 4.4 Feature Cards

```css
.feature-card {
  background: linear-gradient(180deg, #fff 0%, #f4f4f4 70%, #fafafa 100%);
  border: 2px solid #f4f4f4;
  border-radius: 20px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 360px;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}
.feature-card:hover {
  box-shadow: 0px 8px 24px rgba(0,0,0,0.08);
  transform: translateY(-2px);
}
/* Bottom: SVG illustration fills remaining space */
.feature-card__image {
  width: 100%;
  max-width: 280px;
  aspect-ratio: 309/180;
  object-fit: cover;
}
```

---

### 4.5 Process Step Cards

Used in the "How It Works" section. Left column is sticky; right column scrolls through 3 cards.

```css
.process-card {
  background: linear-gradient(314deg, #fafafa 0%, #f4f4f4 100%);
  border: 2px solid #eeeeee;
  border-radius: 24px;
  padding: 32px;
  box-shadow:
    0px 8px 30px 0px rgba(0,0,0,0.08),
    inset 0px 3px 3px 0px #fff,
    inset 3px 0px 3px 0px #fff;
  position: relative;
  overflow: hidden;
}
.process-card__step {
  position: absolute;
  top: 24px;
  right: 24px;
  background: #eeeeee;
  border-radius: 40px;
  padding: 2px 4px;
  font-size: 14px;
  color: #6d6d6d;
}
.process-card__icon-wrap {
  background: #659bff;
  border-radius: 40px;
  padding: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}
/* Sticky left panel */
.process-sticky {
  position: sticky;
  top: 120px;
  width: 40%;
}
```

---

### 4.6 Pricing Cards

```css
/* Standard card */
.pricing-card {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0px 8px 30px 0px rgba(0,0,0,0.08);
  padding: 32px;
  flex: 1;
}

/* Highlighted "Best Deal" card */
.pricing-card--highlight {
  position: relative;
  background: #fff;
  border-radius: 24px;
  /* Outer gradient border via wrapper */
}
.pricing-card--highlight__wrapper {
  background: linear-gradient(125deg, #4686fe 0%, #659bff 66%);
  border-radius: 25px; /* 1px larger */
  padding: 1px;
}
.pricing-card--highlight__inner {
  background: #fff;
  border-radius: 23px;
  padding: 32px;
}
.pricing-highlight__label {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  font-size: 14px;
  letter-spacing: -0.02em;
  white-space: nowrap;
}

/* Divider between price and features */
.pricing-divider {
  height: 1px;
  background: #eeeeee;
  margin: 24px 0;
}

/* Feature line items */
.pricing-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #6d6d6d;
  font-size: 14px;
  letter-spacing: -0.02em;
  line-height: 1.4em;
}
.pricing-item::before {
  content: '';
  width: 18px;
  height: 18px;
  /* Use a checkmark SVG icon here */
  background-size: contain;
  flex-shrink: 0;
}
```

---

### 4.7 Testimonial Cards

```css
/* Light variant */
.testimonial-card--light {
  background: linear-gradient(139deg, #fafafa 0%, #fafafa 100%);
  border-radius: 16px;
  padding: 24px;
  height: 378px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Dark variant */
.testimonial-card--dark {
  background: linear-gradient(139deg, #1a1a1a 0%, #000 100%);
  border-radius: 16px;
  padding: 24px;
  height: 378px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.testimonial-card--dark .author-name { color: #fff; }
.testimonial-card--dark .author-role { color: rgba(255,255,255,0.7); }
.testimonial-card--dark .quote-title { color: #fff; }
.testimonial-card--dark .quote-body  { color: rgba(255,255,255,0.8); }

/* Stars */
.stars { display: flex; gap: 2px; }
.star  { color: #ffd000; width: 14px; height: 14px; }
```

**Carousel behaviour:** horizontal scroll snap. On desktop: 3 cards visible (33.3% width each). On tablet: 2 cards. On mobile: 1 card full width. Use `scroll-snap-type: x mandatory` on the container.

```css
.testimonial-carousel {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  /* Fade edges with mask */
  mask-image: linear-gradient(
    to right,
    rgba(0,0,0,1) 0%,
    rgba(0,0,0,1) 15%,
    rgba(0,0,0,1) 85%,
    rgba(0,0,0,0) 100%
  );
}
.testimonial-carousel > li {
  scroll-snap-align: center;
  flex-shrink: 0;
}
```

---

### 4.8 Integration Orbit Diagram

A circular layout of tool logos orbiting a central hub. Rendered with absolute positioning and CSS transforms (rotate → position on circle → counter-rotate icon).

```html
<!-- Structure -->
<div class="orbit-container">
  <!-- Central hub pulse ring -->
  <div class="orbit-hub">
    <div class="orbit-hub__glow"></div>
    <!-- central app icon -->
  </div>

  <!-- 5 tool logo nodes positioned by angle -->
  <!-- Place each at: top:50%; left:50%; then transform: rotate(Xdeg) translateY(-radius) rotate(-Xdeg) -->
  <div class="orbit-node" style="transform: rotate(148deg) translateY(-180px) rotate(-148deg)">
    <img src="..." alt="Tool name" />
  </div>
  <!-- ... repeat for 120deg, -90deg, -120deg, -148deg -->
</div>
```

```css
.orbit-container {
  position: relative;
  width: 800px;
  height: 300px;
  overflow: hidden;
}
.orbit-hub {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
}
.orbit-hub__glow {
  /* The gradient circle seen below the hub */
  position: absolute;
  width: 800px;
  height: 800px;
  top: 45px;
  border-radius: 500px;
  background: linear-gradient(#659bff26 0%, transparent 31.8%);
  z-index: 1;
}
.orbit-node {
  position: absolute;
  top: 51%; left: 0; right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transform: translateY(-50%);
}
.tool-logo-card {
  background: linear-gradient(137deg, #fff 0%, #eeeeee 105%);
  border-radius: 16px;
  box-shadow:
    0px 2px 8px 0px rgba(0,0,0,0.05),
    inset 0px -2px 4px 0px rgba(255,255,255,0.5);
  padding: 20px;
  width: 90px; height: 90px;
  display: flex; align-items: center; justify-content: center;
}
```

---

### 4.9 UI Snippet Floating Cards (Hero overlays)

Small floating cards layered around the phone mockup:

```css
.ui-snippet {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow:
    5px 10px 20px 0px rgba(0,140,255,0.03),
    5px 10px 20px 0px rgba(0,0,0,0.03);
  position: absolute;
  /* Position varies per card; use specific top/bottom/left/right values */
}

/* The pill-style notification badges */
.ui-badge {
  background: #000;
  color: #fff;
  border-radius: 40px;
  padding: 8px 16px;
  box-shadow: 4px 4px 12px 0px rgba(0,0,0,0.25);
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  letter-spacing: -0.02em;
}

/* Positive delta indicator */
.delta-badge {
  background: rgba(70, 161, 40, 0.1);
  color: #46a128;
  border-radius: 100px;
  padding: 2px 4px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.03em;
}
```

---

### 4.10 FAQ Accordion

```css
.faq-item {
  background: #fff;
  border: 1px solid #fff;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
  overflow: hidden;
}
.faq-item:hover {
  box-shadow: 0px 4px 16px rgba(0,0,0,0.06);
}
.faq-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}
.faq-item__question {
  font-size: 16px;
  font-weight: 500;
  color: #3d3d3d;
  letter-spacing: -0.02em;
  flex: 1;
}
.faq-item__chevron {
  width: 18px; height: 18px;
  color: #aeaeae;
  transition: transform 0.3s ease;
}
.faq-item.open .faq-item__chevron {
  transform: rotate(180deg);
}
.faq-item__answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s ease, padding 0.35s ease;
  font-size: 16px;
  color: #6d6d6d;
  line-height: 1.5;
}
.faq-item.open .faq-item__answer {
  max-height: 300px;
  padding-top: 16px;
}
```

---

### 4.11 Logo Ticker / Marquee

```css
.ticker-wrapper {
  overflow: hidden;
  width: 100%;
  mask-image: linear-gradient(
    270deg,
    transparent 0%,
    #000 10%,
    #000 90%,
    transparent 100%
  );
}
.ticker-track {
  display: flex;
  gap: 48px;
  align-items: center;
  animation: ticker 24s linear infinite;
}
.ticker-logo {
  opacity: 0.5;
  flex-shrink: 0;
  height: 32px;
  width: auto;
  /* Use real brand SVG logos here */
}
@keyframes ticker {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
/* Duplicate logos in DOM to create seamless loop */
```

---

### 4.12 Metrics Row

Three large animated number counters separated by thin vertical dividers:

```css
.metrics-row {
  display: flex;
  align-items: center;
  height: 119px;
  gap: 40px;
}
.metric-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  flex: 1;
}
.metric-number {
  font-size: 56px;
  font-weight: 500;
  letter-spacing: -0.03em;
  color: #3d3d3d;
  line-height: 1;
}
.metric-label {
  font-size: 16px;
  color: #6d6d6d;
  letter-spacing: -0.02em;
}
.metric-divider {
  width: 1px;
  height: 60%;
  background: #eeeeee;
  flex-shrink: 0;
}
```

---

### 4.13 Blog Cards

```css
.blog-card {
  background: #fafafa;
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.blog-card:hover {
  transform: translateY(-4px);
  box-shadow: 0px 12px 32px rgba(0,0,0,0.10);
}
.blog-card__image {
  aspect-ratio: 1.54;
  width: 100%;
  object-fit: cover;
  border-radius: 20px;
  overflow: hidden;
}
.blog-card__content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.blog-card__title {
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1.3em;
  color: #000;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.blog-card__excerpt {
  font-size: 16px;
  color: #605f5f;
  letter-spacing: -0.02em;
  line-height: 1.4em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

---

### 4.14 Star Rating (Hero)

```css
.rating-widget {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.rating-avatars {
  position: relative;
  width: 94px;
  height: 44px;
}
.rating-avatar {
  position: absolute;
  width: 42px;
  height: 42px;
  border-radius: 40px;
  border: 2px solid #fff;
  top: 50%;
  box-shadow: 5px 8px 15px 0px rgba(0,0,0,0.15);
  object-fit: cover;
}
.rating-avatar:nth-child(1) { left: 0;   transform: translateY(-50%) translateX(-10px); }
.rating-avatar:nth-child(2) { left: 50%; transform: translate(-50%, -50%) translateX(-10px); }
.rating-avatar:nth-child(3) { right: 0;  transform: translateY(-50%) translateX(-10px); }
.rating-stars { display: flex; gap: 2px; }
.rating-star  { width: 14px; height: 14px; color: #fac020; }
.rating-text  { font-size: 14px; color: #605f5f; letter-spacing: -0.02em; }
```

---

### 4.15 Footer (Dark)

```css
footer {
  background: #000;
  color: rgba(255,255,255,0.8);
  padding: 80px 0;
}
.footer-container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 80px;
}
.footer-divider {
  height: 1px;
  background: rgba(255,255,255,0.2);
  margin: 40px 0;
}
.footer-social-icon {
  background: rgba(255,255,255,0.1);
  border-radius: 100px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}
.footer-social-icon:hover { background: rgba(255,255,255,0.2); }
.footer-nav-link {
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.02em;
  padding: 4px 8px;
  transition: color 0.3s cubic-bezier(0.44, 0, 0.56, 1);
}
.footer-nav-link:hover { color: #fff; }
.footer-copyright { color: rgba(255,255,255,0.8); font-size: 14px; }
```

---

## 5. Motion & Interaction

### 5.1 Spring Reveal (Scroll-triggered)

Use `IntersectionObserver` to trigger, animate with Web Animations API or CSS classes.

```javascript
// Spring config equivalents as CSS keyframe approximations:
// bounce: 0.2, duration: 0.8s → scale(0.8) + opacity:0 → scale(1) + opacity:1
// bounce: 0.2, duration: 0.4s for hero subtitle reveal

const SPRING_SCALE = [
  { transform: 'scale(0.9)', opacity: 0 },
  { transform: 'scale(1)',   opacity: 1 }
];
const SPRING_Y = [
  { transform: 'translateY(-20px)', opacity: 0 },
  { transform: 'translateY(0)',     opacity: 1 }
];
const SPRING_OPTIONS = {
  duration: 800,
  easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // approximate spring
  fill: 'both'
};

// Stagger children by 100–150ms each
function revealWithStagger(elements, baseDelay = 0) {
  elements.forEach((el, i) => {
    el.animate(SPRING_SCALE, { ...SPRING_OPTIONS, delay: baseDelay + i * 150 });
  });
}
```

**Key animations:**
- **Hero phone mockup:** `scale(0.8) → scale(1)`, spring, delay 0ms
- **Hero floating UI cards:** `scale(0.8) → scale(1)`, spring, delay 400–500ms each
- **Hero badge ticker (logos):** `translateY(-20px) → translateY(0)`, spring, delay 500ms
- **Feature cards (grid):** `scale(0.9) → scale(1)`, stagger 100ms each
- **FAQ items:** `translateY(20px) → translateY(0)`, stagger 50ms
- **Blog grid:** `translateY(0) → scale(1) + opacity:1`, together
- **Framer badge (corner):** `opacity:0 → opacity:1`, spring, delay 3s

```css
/* Reduced motion override — always include */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

### 5.2 Hover Micro-interactions

```css
/* Feature cards — subtle lift */
.feature-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
.feature-card:hover { transform: translateY(-2px); box-shadow: 0px 8px 24px rgba(0,0,0,0.08); }

/* Blog cards — more pronounced lift */
.blog-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
.blog-card:hover { transform: translateY(-4px); box-shadow: 0px 12px 32px rgba(0,0,0,0.10); }

/* FAQ items — shadow reveal */
.faq-item { transition: box-shadow 0.25s ease; }
.faq-item:hover { box-shadow: 0px 4px 16px rgba(0,0,0,0.06); }

/* Process card icons */
.process-card__icon-wrap { transition: transform 0.2s ease; }
.process-card:hover .process-card__icon-wrap { transform: scale(1.1); }

/* Testimonial carousel arrows — appear on hover */
.carousel-arrow { opacity: 0; transition: opacity 0.2s ease; }
.carousel:hover .carousel-arrow { opacity: 1; }
```

---

### 5.3 Sticky Scroll — Process Section

```javascript
// The left "heading" panel is sticky; right cards scroll into view
// Each card gets a scroll-driven opacity + translateY reveal

const processCards = document.querySelectorAll('.process-card');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.2 });

processCards.forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(30px)';
  card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(card);
});
```

---

### 5.4 Counter Animation (Metrics)

```javascript
function animateCounter(el, target, suffix = '', duration = 2000) {
  const start = performance.now();
  const isDecimal = String(target).includes('.');

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = eased * target;
    el.textContent = (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// Trigger when metrics row enters viewport
// Examples: "40K+", "99.9%", "10M+"
```

---

### 5.5 Navbar Scroll Behaviour

```javascript
// The floating pill subtly adjusts shadow on scroll
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  if (window.scrollY > 20) {
    nav.style.boxShadow = '0px 10px 30px 0px rgba(0,0,0,0.10)';
  } else {
    nav.style.boxShadow = '0px 10px 20px 0px rgba(0,0,0,0.05)';
  }
});
```

---

## 6. Image & Icon Usage

### Icons

Use `lucide-react` or equivalent stroke-based icon library. All icons share:
- `stroke-width: 1.5`
- Default size: `24×24px`
- Coloured via CSS `color` / `stroke` property (use `currentColor`)

**Icon colour contexts:**
```
On white cards:      color: #000
On blue badge:       color: #fff
On dark bg (footer): color: #fff
On grey tag:         color: #6d6d6d
Chevron (FAQ):       color: #aeaeae
```

### Phone Mockup

A tall PNG/WebP with transparent background (`aspect-ratio: 0.463`). Drop shadow:
```css
filter: drop-shadow(2px 10px 17px rgba(0,0,0,0.3))
        drop-shadow(5px 5px 7px rgba(0,0,0,0.3));
```

### Feature / Process Illustrations

Flat SVG illustrations in each card. Style guide:
- Thin strokes: `1.5px`
- Palette: blue `#659bff`, white, and grey backgrounds
- Max size: `309×180px` within card

### Brand Logos (Integration / Ticker)

Use SVG logos at `32px` height, `opacity: 0.5` in the ticker. In integration orbit cards, full opacity inside the `tool-logo-card` component.

---

## 7. Section-by-Section Content Guide

### Hero
```
Badge:       "New · [short product news]"
H1:          "[Action verb] every [noun], [action verb] every [noun]."
             e.g. "Track every dollar, grow every investment."
Subhead:     One sentence, 120–160 chars. Describe the benefit, not the feature.
CTA 1:       "Download App"  (primary blue)
CTA 2:       "Contact Sales" (outline)
Social proof: "[N]K+ users worldwide" with avatar cluster + 5 stars
```

### Features (6 cards in 2 rows)
```
Section tag: "Features"
H2:          "[Verb] [noun] with [adjective] features."
Cards (row 1): Real-Time Analytics · Automated Reports · Smart Budgeting
Cards (row 2): Secure Syncing · Growth Score · [6th feature]
Each card:   H4 title + 1-line description + SVG illustration
```

### Integrations
```
Section tag: "Integrations"
H2:          "Works with the tools you already use."
Visual:      Orbit diagram (5 tool logos) + gradient glow disc
```

### Process (How It Works)
```
Section tag: "How it works"
H2:          "From setup to insight—just three simple steps."
Steps:       01 Connect Accounts · 02 Track in Real-Time · 03 Grow Smarter, Faster
Each step:   Step number (top right) + icon (blue badge) + title + description + mini illustration
```

### Pricing (3 tiers)
```
Section tag: "Pricing"
H2:          "Simple plans, clear value."
Tiers:       Starter $0/mo · Growth $25/mo (Best Deal) · Scale $75/mo
Each tier:   Icon + name + price + 1-line pitch + CTA button + 5 feature lines
```

### Testimonials
```
Header:      H2 "Real results from real users."
             1-line description of who trusts the product
Button:      "Leave a review" (outline)
Cards (4):   Name, role/company, short headline, 2–3 sentence quote, 5 stars
Metrics:     [N]K+ Happy users · [N]% Uptime · [N]M+ Tracked
```

### FAQ
```
Layout:      Left: tag + H2 + description + "Ask a question" button
             Right: 5 accordion items, initially closed
Questions:   How does [product] help manage data? ·
             Can we connect existing tools? ·
             Is data secure? ·
             Do you support different access levels? ·
             How long does setup take?
```

### Blog (3 cards)
```
Section tag: "Blog"
H2:          "Insights to [do better thing]."
Cards:       Each with a full-bleed image, title (2-line clamp), excerpt (2-line clamp)
CTA:         "Read More" (black button)
```

---

## 8. Responsive Behaviour

| Element              | Desktop (≥1200px) | Tablet (810–1199px) | Mobile (≤809px)  |
|----------------------|-------------------|---------------------|------------------|
| Navbar               | Floating pill, fixed width | Stretch full with 40px margins | Stretch with 20px margins + hamburger |
| Hero H1              | 64px              | 54px                | 40px             |
| Feature cards        | 3 × 360px row     | 2 columns, 340px    | 1 column, full   |
| Process section      | 2-col sticky      | 1-col stacked       | 1-col stacked    |
| Pricing              | 3-col             | 1-col stacked       | 1-col stacked    |
| Testimonials         | 3 cards visible   | 2 cards visible     | 1 card visible   |
| FAQ                  | 2-col             | 2-col               | 1-col stacked    |
| Blog                 | 3-col grid        | 2-col               | 1-col            |
| Section padding X    | 80px              | 40px                | 20px             |
| Section padding Y    | 100px             | 100px               | 64px             |

---

## 9. Accessibility Baseline

```css
/* Focus visible for keyboard users */
:focus-visible {
  outline: 2px solid #4686fe;
  outline-offset: 3px;
  border-radius: 4px;
}

/* Skip link */
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  background: #4686fe;
  color: #fff;
  padding: 8px 16px;
  border-radius: 0 0 8px 0;
  z-index: 9999;
}
.skip-link:focus { top: 0; }
```

- All icon-only buttons need `aria-label`
- Carousel needs `aria-roledescription="carousel"`, items as `<li>` with `aria-label="N of M"`
- FAQ `<button>` controls panel with `aria-expanded` and `aria-controls`
- Decorative images use `alt=""`; meaningful images use descriptive alt text
- Colour contrast: dark text on white backgrounds meets WCAG AA (4.5:1) throughout

---

## 10. Implementation Checklist

```
[ ] Geist font loaded (Google Fonts or self-hosted)
[ ] CSS custom properties defined on :root
[ ] Floating navbar with scroll shadow enhancement
[ ] IntersectionObserver on every section for reveal animations
[ ] Spring easing cubic-bezier applied to all reveals
[ ] prefers-reduced-motion media query at the top of animation code
[ ] Hero floating cards use absolute positioning + individual delays
[ ] Logo ticker: duplicate DOM nodes for seamless loop
[ ] Integration orbit: CSS rotate + translateY for node placement
[ ] Sticky left column in process section
[ ] Pricing highlight card: gradient wrapper div technique
[ ] Testimonial carousel: scroll-snap + mask-image fade
[ ] Counter animation triggered by IntersectionObserver
[ ] FAQ accordion: max-height transition (not display:none)
[ ] Blog card hover lift
[ ] Footer links: transition with cubic-bezier(0.44, 0, 0.56, 1)
[ ] All interactive elements have :focus-visible styles
[ ] Responsive breakpoints at 809px and 1199px
[ ] Drop shadow on phone mockup via filter:drop-shadow
```
