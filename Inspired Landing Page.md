# Assignment: Inspired Landing Page

Oct 2, 2026 · @Kevin

## Overview

Today you'll design and build a landing page inspired by a real, professionally designed site. This is a **frontend-only** assignment: no new server features, no database, no auth changes. The goal is to sharpen your HTML and CSS by studying a design you admire and recreating its look and feel.

Your current landing page (with the login form) **stays exactly as it is**. You're building a brand-new, separate page and linking to it from your Projects page.

## Step 1: Find your inspiration

Browse one of these galleries and pick **one** landing page you genuinely like. Choose something you think you can realistically rebuild in a class period or two: bold layout and clear sections beat heavy animation.

| Site | Why it's useful |
| --- | --- |
| [Landingfolio](https://www.landingfolio.com/) | Huge library, and you can browse by section type (hero, features, pricing) |
| [Land-book](https://land-book.com/) | Very polished, modern designs; good filtering by style and color |
| [Lapa Ninja](https://www.lapa.ninja/) | Large gallery with clean, easy-to-study layouts |
| [One Page Love](https://onepagelove.com/) | Single-page sites, a perfect match for a two-section build |
| [SaaS Landing Page](https://saaslandingpage.com/) | Startup/product pages with strong hero sections |

You may also use any real website you find on your own. Save the link: you'll submit it.

## Step 2: Build it

1. **Create a new page** in your project (for example `landing-example.html`, or a new view if you use a template engine). Serve it the same way your other pages are served. Do not edit or replace your existing landing/login page.
2. **Link to it from your Projects page** with a clear link or button, such as "Landing Page Example."
3. **Build one or two sections, max.** Each section should be about one full screen tall (`min-height: 100vh`).
   - Section 1 is usually the hero: headline, short tagline, a call-to-action button, and an image or graphic.
   - Section 2 (optional) could be features, testimonials, or a call-to-action band, whatever your inspiration shows next.
4. **Recreate the design, not the content.** Match the layout, spacing, typography, and color mood of your inspiration. Use your own text and your own (or free) images, such as from [Unsplash](https://unsplash.com/).
5. **Keep it frontend.** Plain HTML and CSS is perfect. A little JavaScript is fine if the design needs it. No new server logic is required.
6. **Write your own code.** Do not copy the original site's HTML/CSS from DevTools. Inspecting it to learn a font name or color is fine.

## Step 3: Design checklist

Before you write code, study your inspiration and note what makes it work. Use this checklist while you build:

- [ ] **Layout:** how is the section divided (centered, split left/right, grid)? Use Flexbox or Grid to match it.
- [ ] **Typography:** pick a similar font pairing (try [Google Fonts](https://fonts.google.com/)). Make the headline big and bold, body text calm and readable.
- [ ] **Color:** pull 3–5 colors that match the mood. Store them as CSS variables in `:root`.
- [ ] **Spacing:** generous padding and consistent gaps. White space is a design choice.
- [ ] **Visual hierarchy:** the eye should go headline → tagline → button.
- [ ] **Call-to-action button:** styled, with a hover state.
- [ ] **Responsive:** it should still look good on a phone. Check it with DevTools' device toolbar.

## What to submit

1. **A link to your live example page** (preferred). If your project isn't deployed, submit a full-page screenshot instead.
2. **The link to your inspiration page**, so I can compare.
3. **2–3 sentences** on what you chose to recreate and one thing you'd improve with more time.

### Grading

| Criteria | Points |
| --- | --- |
| Separate page, linked from the Projects page; original landing page untouched | 15 |
| One or two sections, each about 100vh | 15 |
| Layout clearly reflects the inspiration (structure, alignment, spacing) | 25 |
| Typography and color feel intentional and match the inspiration's mood | 20 |
| Responsive on a phone-sized screen | 15 |
| Inspiration link + short reflection submitted | 10 |
| **Total** | **100** |

## Tips and stretch goals

**Tips**

- Screenshot your inspiration and keep it open beside your editor the whole time.
- Build the big boxes first (sections, columns), then fill in text, then style. Don't polish the button before the layout works.
- Add `* { box-sizing: border-box; }` and reset `body { margin: 0; }` so 100vh sections line up cleanly.
- Stuck on a layout? Put a temporary `outline: 1px solid red` on elements to see their boxes.

**Stretch goals (optional)**

- A sticky nav bar with smooth scrolling to section 2.
- A subtle fade-in or hover animation using CSS transitions.
- A dark-mode version using `prefers-color-scheme`.
