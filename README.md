# ShopBoard

A React + TypeScript storefront with API products, search, category filtering, sorting, product details, and a persistent cart. The interface keeps the lime/sage identity of the original ShopBoard.

## Run locally

Use Node 24 LTS, or Node 22.12+.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. No API key, environment file, backend, or database is needed. Product requests and images require an internet connection.

| Command                | Purpose                                         |
| ---------------------- | ----------------------------------------------- |
| `npm run typecheck`    | Check strict TypeScript                         |
| `npm run lint`         | Type-aware ESLint, zero warnings                |
| `npm run format`       | Format project files                            |
| `npm run format:check` | Verify formatting                               |
| `npm test`             | Run unit and component tests                    |
| `npm run test:watch`   | Watch unit and component tests                  |
| `npm run test:e2e`     | Run desktop and 360px Chromium tests            |
| `npm run build`        | Typecheck and build into `dist/`                |
| `npm run preview`      | Serve the production build locally              |
| `npm run check`        | Typecheck, lint, format check, tests, and build |

Before the first browser test run:

```sh
npx playwright install chromium
```

Husky runs lint-staged before commits. Staged TypeScript/TSX files receive type-aware linting and formatting; other supported text files receive formatting. CI runs `check` and the browser tests. Review changes before committing them.

## Pages and behavior

- `/` loads the catalog. Search matches title, description, or category. Filters combine; Default restores API order. Search, category, sort, and page are URL parameters. Reset clears them. Pagination shows 12 products per page.
- `/products/:productId` loads the full product, image gallery, availability, shipping, returns, and warranty information.
- `/cart` supports increasing/decreasing quantities, removing items, confirmed clearing, and USD subtotal. The guest cart survives refresh, login, and logout.
- `/login` and `/signup` validate fields and save a local profile. These are simulated flows: any valid email and password of at least eight characters can sign in. Signup does not create an API account. Passwords are never persisted or transmitted. The stored name/email is not a secure session; do not use real credentials. Log out clears the profile.
- Unknown paths and invalid/missing products have recovery links. Product loading, request errors with Try again, API-empty, filtered-no-match, empty cart, and unavailable images each have their own UI.

There is no checkout, payment processing, wishlist, or account dashboard. The storefront does not display implementation notices; these limitations belong here.

## Structure

```text
src/
  modules/
    products/
      products.types.ts    # Product, ProductDetails, Category, filter contracts
      products.data.ts     # Category/sort labels and page size, not inventory
      products.api.ts      # DummyJSON response schemas and mapping
      products.logic.ts    # Pure search/filter/sort, categories and ID parsing
      products.state.ts    # Cached catalog/detail query hooks
      components/
      pages/
    cart/
      cart.types.ts        # Cart contracts and stored-data schema
      cart.logic.ts        # Pure immutable quantity rules and totals
      cart.state.ts        # Cart store, persistence and actions
      components/
      pages/
    auth/
      auth.types.ts        # Profile, form fields and errors
      auth.logic.ts        # Pure form validation and profile creation
      auth.state.ts        # Local profile store and actions
      components/
      pages/
  shared/
    api/client.ts          # HTTP status checks, timeout and cancellation
    components/            # Controls and application shell
    storage.ts             # Versioned storage adapter and subscriptions
    money.ts               # Integer-cent conversion and USD formatting
    usePageTitle.ts
  App.tsx                  # Providers and routes
  main.tsx                 # StrictMode entry point
  styles.css               # Tokens and responsive styles
tests/                     # Unit/component tests and test-only fixtures
e2e/                       # Browser flows with intercepted API responses
```

Components import feature contracts, rules, state, or feature components directly. There are no barrel files. `*.logic.ts` does not access storage or import React. Only the shared HTTP client calls `fetch`; only the storage adapter accesses `localStorage`.

This is a fresh implementation. The Day 3 repository is unchanged; its files were not copied line for line. That deliberately differs from the assignment's unchanged-copy requirement, following the agreed approach.

## API and cart decisions

[DummyJSON products](https://dummyjson.com/docs/products) is the only runtime inventory source. The catalog request uses `limit=0` and selects only the fields the grid/filter logic needs. Full details come from `/products/:id`. TanStack Query deduplicates and caches requests for five minutes, with request cancellation, a 15-second timeout, and explicit retry controls. No hardcoded fallback catalog is used.

Zod validates unknown JSON before mapping API dollar prices into integer cents. `Category` is the closed union inferred from the 24 supported category slugs; the label map is exhaustive. An unexpected category or malformed response produces an error instead of widening the type or silently dropping a product. If DummyJSON adds categories, update the schema and labels together.

Cart quantities start at 1, merge by product ID, and cannot exceed the product's last known stock. Out-of-stock items cannot be added. DummyJSON's wholesale-style `minimumOrderQuantity` is intentionally ignored. The displayed `price` is used directly; no additional discount is applied. Totals include products only, not shipping or taxes.

The versioned keys are `shopboard:cart:v1` and `shopboard:profile:v1`. Stored values are validated, including positive quantities, stock bounds, and unique product IDs. Corrupt or blocked storage shows a warning without crashing. Failed writes retain in-memory changes and explain that refresh may lose them. Open tabs receive storage-event updates.

Cart entries contain a small product snapshot so they remain readable after refresh without waiting for the catalog. Prices and stock are not continuously reconciled with DummyJSON. Adding the product again updates its snapshot. A real checkout would need server-side price and inventory validation.

## Component tree

Every project component below has its own matching `.tsx` file. `{}` means no props. Library router internals and Lucide icons are omitted; providers/routes are included for orientation. Shared controls are repeated where they render. Native HTML elements are not components in this tree. `StrictMode` wraps `App` in `main.tsx`.

```text
App {}
└─ QueryClientProvider { client }
   └─ BrowserRouter {}
      ├─ RouteFocus {}
      ├─ Header {}
      │  └─ Button { variant, onClick, children } [signed in]
      ├─ StorageNotice {}
      ├─ Routes
      │  ├─ CatalogPage {} [/]
      │  │  ├─ CatalogHero {}
      │  │  ├─ CatalogControls { filters, categories, onChange, onReset }
      │  │  │  └─ Button { variant, disabled, onClick, children }
      │  │  ├─ CatalogSkeleton {} [loading]
      │  │  ├─ StateMessage { title, role?, children } [error/empty/no match]
      │  │  │  └─ Button { onClick, children }
      │  │  ├─ ProductGrid { products } [results]
      │  │  │  └─ ProductCard { product, loading? } [key: product.id]
      │  │  │     ├─ ProductImage { src, alt, loading }
      │  │  │     └─ AddToCart { product }
      │  │  │        └─ Button { variant, disabled, onClick, aria-label, children }
      │  │  └─ Pagination { page, pages, onChange }
      │  │     └─ Button ×2 { disabled, onClick, children }
      │  ├─ ProductPage {} [/products/:productId]
      │  │  ├─ StateMessage { title, role?, children } [missing/error]
      │  │  │  └─ Button { onClick, children } [retryable error]
      │  │  └─ ProductDetailsView { product } [key: product.id]
      │  │     ├─ ProductGallery { images, title }
      │  │     │  ├─ ProductImage { src, alt, loading, className } [selected]
      │  │     │  └─ ProductImage { src, alt } [thumbnails]
      │  │     ├─ QuantityControl { name, value, max, onChange }
      │  │     │  └─ Button ×2 { variant, aria-label, disabled, onClick, children }
      │  │     └─ AddToCart { product, quantity }
      │  │        └─ Button { variant, disabled, onClick, aria-label, children }
      │  ├─ CartPage {} [/cart]
      │  │  ├─ Button { variant, disabled, onClick, children } [clear]
      │  │  ├─ StateMessage { title, children } [empty]
      │  │  ├─ CartRow { item, onRemove } [key: item.product.id]
      │  │  │  ├─ ProductImage { src, alt }
      │  │  │  ├─ QuantityControl { name, value, max, onChange }
      │  │  │  │  └─ Button ×2 { variant, aria-label, disabled, onClick, children }
      │  │  │  └─ Button { variant, className, aria-label, onClick, children }
      │  │  └─ CartSummary { quantity, subtotalCents }
      │  ├─ AuthPage { mode: 'login' | 'signup' } [/login or /signup]
      │  │  └─ AuthForm { mode } [key: mode]
      │  │     ├─ TextField { id, name, label, autoComplete, required, value,
      │  │     │              onChange, onBlur, error, type?, minLength? }
      │  │     └─ Button { type, variant, children }
      │  └─ NotFoundPage {} [*]
      │     └─ StateMessage { title, children }
      └─ Footer {}
```

`Button` accepts native button props plus `variant`; `TextField` accepts native input props plus `id`, `label`, and optional `error`. `ProductImage` also accepts optional `className`. Every reusable component uses a typed `Props` interface; prop-free shell/pages do not invent empty interfaces.

### State ownership

| State                                            | Owner                                                                 |
| ------------------------------------------------ | --------------------------------------------------------------------- |
| Catalog and product request data/status/cache    | TanStack Query through `products.state.ts`                            |
| Search, category, sort, page                     | URL parameters managed by `CatalogPage`                               |
| Filtered/sorted products, categories, page count | Derived by pure product rules during render                           |
| Cart items and persistence issues                | `cart.state.ts` store; subscribed with `useSyncExternalStore`         |
| Cart quantity/subtotal and stock-limited buttons | Derived from cart data, not duplicated in state                       |
| Local signed-in profile and persistence issues   | `auth.state.ts` store                                                 |
| Form values, touched fields, submitted flag      | `AuthForm`; errors derived by `auth.logic.ts`                         |
| Requested product quantity                       | `ProductDetailsView`; effective quantity derives from remaining stock |
| Selected photograph                              | `ProductGallery`                                                      |
| Image load failure                               | Each `ProductImage` instance                                          |

The tree was checked against source files. The course's manual React DevTools Components-tab verification is still required: compare each route, props, and hook ownership to this tree. Do not mark that check complete without opening the extension.

## Debug lab and design

`debug-lab-log.md` records all five hosted lab bugs, with browser observations, source causes, and proposed fixes. `CLAUDE.md` carries the five resulting React rules. `DESIGN.md` describes the implemented visual system and asset sources. Font licensing is in `public/fonts/OFL.txt`.

The required Vercel skills are vendored under `.claude/skills/vercel-react-best-practices` and `.claude/skills/vercel-composition-patterns`, from [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) revision `1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62`. They are kept unformatted to preserve upstream content.

## Checks and hosting

Unit/component tests cover product ordering, immutable cart rules, cents, authentication validation, API mapping, storage corruption/failures, and reusable UI behavior. Browser tests intercept API responses for repeatable search/cart/auth flows, loading/error/empty states, stock limits, missing routes, pagination, persistence, Console checks, and viewport overflow. Test fixtures are never imported by application code.

Manual checks still needed: React DevTools Components tab, real iOS/Android hardware, and screen-reader navigation. Automated Chromium mobile emulation is not real-device verification.

ESLint 9 is used because the accessibility plugin currently supports it. A scoped `minimatch` override patches the type-aware lint toolchain's dependency for [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249); no runtime package is overridden.

To host, publish `dist/` on a static host with SPA fallback to `index.html`. Direct visits to `/cart` and `/products/1` require that fallback. No hosting account or deployment is configured by this project.
