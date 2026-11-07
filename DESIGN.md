# ShopBoard design

The visual reference is `shopboard-starter`: lime actions, sage backgrounds, heavy Inter headings, white rounded product cards. This React version keeps that identity across product, cart, authentication, and checkout pages. It is light-only.

## Tokens and typography

`src/styles.css` owns the semantic color tokens. `--paper` is the sage canvas, `--surface` is white, `--media` is the image backdrop, `--ink` and `--muted` are text colors, `--accent` is lime, and `--forest` is the dark green for display text and focus rings. `--danger` marks destructive actions; the warning tokens are reserved for storage failures. Use tokens rather than introducing colors in component styles.

Inter is self-hosted as a Latin variable WOFF2, preloaded, with system fallbacks and `font-display: swap`. Body text and inputs are 16px; secondary text is 14px. Small category/rating captions are 12px. Prices and quantities use tabular numerals. Headings use tight leading; product names wrap instead of truncating.

## Layout

- Center content within 1280px. Use 16px phone gutters, increasing at wider breakpoints.
- Product grids have one column below 540px, two from 540px, three from 800px, and four from 1160px. Show 12 products per page.
- Keep the catalog hero left-aligned. Product photography is the visual focus, not decorative illustrations or marketing feature cards.
- Use white surfaces on sage without shadows or gradients. Product media reserves a square area with `object-fit: contain`; do not crop the API product photographs.
- Product details and authentication become two-column layouts at 800px. Cart rows and controls wrap rather than forcing horizontal scroll.

## Interaction

Use links for navigation and buttons for actions. Shared buttons support primary, secondary, ghost, and danger treatments. Lime identifies purchase/authentication actions. Quantity buttons and navigation targets are at least 44px; form controls are at least 48px high. Keep keyboard focus visible.

Every input has a persistent associated label. Forms validate on blur or submission, then remove errors as fields are corrected. Form errors include text, not just color. Clear cart requires native confirmation. Removing cart items moves focus to the cart heading. Route changes focus the main content.

Checkout uses the same field and surface tokens through adapted shadcn Input/Label components. Keep contact and shipping fields grouped with legends, preserve address autofill, and focus the confirmation heading after success.

Hover effects only apply inside `(hover: hover) and (pointer: fine)`. There are no entrance animations, animated grid changes, or scroll effects. Loading uses static skeletons, so reduced-motion users receive the same behavior without an alternative animation path.

Keep error/retry, API-empty, filtered-no-match, empty-cart, missing-product, and image-failure states distinct. Storage failures are visible and preserve in-memory use. Storefront copy describes shopping, never the implementation stack or assignment.

## Assets

- Product images come from the same DummyJSON product records as the names and prices. This is sample inventory, not a claim to sell those brands or goods. Confirm image and brand usage rights before public commercial use.
- Inter comes from `@fontsource-variable/inter` 5.2.8, under SIL OFL 1.1. The notice is retained in `public/fonts/OFL.txt`.
- Icons come from Lucide React under its ISC license. The favicon is a local ShopBoard mark.

## Verification

The browser suite checks 360px and desktop layouts and captures Console errors/warnings. Real phone hardware, screen-reader testing, and the React DevTools Components-tab check still require a manual pass. Automated layout checks are not a claim of a full accessibility audit.
