# ShopBoard

A Next.js 16 App Router + React 19 + TypeScript storefront with API products, search, category filtering, sorting, product details, and a persistent cart. Converted in place from the Vite assignment, with the original lime/sage interface and feature modules preserved.

## Run locally

Use Node 24 LTS, or Node 22.12+.

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`, or the URL printed by Next.js. No API key, environment file, backend, or database is needed. Product requests and images require an internet connection.

| Command                | Purpose                                          |
| ---------------------- | ------------------------------------------------ |
| `npm run typecheck`    | Check strict TypeScript                          |
| `npm run lint`         | Type-aware ESLint, zero warnings                 |
| `npm run format`       | Format project files                             |
| `npm run format:check` | Verify formatting                                |
| `npm test`             | Run unit and component tests                     |
| `npm run test:watch`   | Watch unit and component tests                   |
| `npm run test:e2e`     | Run desktop and 360px Chromium tests             |
| `npm run build`        | Build Next.js into `.next/`, including typecheck |
| `npm run start`        | Serve the production build                       |
| `npm run preview`      | Serve the production build locally               |
| `npm run check`        | Typecheck, lint, format check, tests, and build  |

Before the first browser test run:

```sh
npx playwright install chromium
```

Husky runs the full `npm run check` before commits. A type, lint, format, test, or build failure blocks the commit; the hook does not silently fix files. Run `npm run format` yourself when needed. CI runs the same checks plus browser tests.

### API base URL and required failure modes

The default API is `https://dummyjson.com`. Set `NEXT_PUBLIC_API_BASE_URL` to override it; restart Next.js after changing it. This replaces the former `VITE_API_BASE_URL`. The value is public and baked into production builds, so it must not contain secrets.

DummyJSON does not provide the assignment's path-based test modes. The Next.js route handler in `src/app/api/[...path]/route.ts` supplies these under `/api` during development, proxying normal/delayed product requests to DummyJSON:

```sh
NEXT_PUBLIC_API_BASE_URL=/api npm run dev
NEXT_PUBLIC_API_BASE_URL=/api/delay/3000 npm run dev
NEXT_PUBLIC_API_BASE_URL=/api/fail/500 npm run dev
NEXT_PUBLIC_API_BASE_URL=/api/empty npm run dev
```

Run one command at a time. Delay holds requests for three seconds; the shell and catalog hero stay usable. Failure shows Try again while the cart stays accessible. Empty shows empty shelves and missing product details. These modes apply to both catalog and detail requests. A persistent failure mode keeps failing on retry; restart with `/api` and reload to recover. Tests also cover a failing response followed by a successful retry.

The scenario route returns 404 in production. For production, omit the override to use DummyJSON, or configure a real CORS-enabled API. Do not build with `/api` as the base URL.

## Pages and behavior

- `/` loads the catalog. Search matches title, description, or category. Filters combine; Default restores API order. Search, category, sort, and page are URL parameters. Reset clears them. Pagination shows 12 products per page.
- `/products/[productId]` loads the full product, image gallery, availability, shipping, returns, and warranty information.
- `/cart` supports increasing/decreasing quantities, removing items, confirmed clearing, and USD subtotal. The guest cart survives refresh, login, and logout.
- `/checkout` validates contact and shipping details with react-hook-form and a single Zod schema. It shows a local confirmation and clears the persisted cart only after validation succeeds. An empty cart has a link back to products, not an unusable form. No payment, shipping request, email, or backend order is created. Shipping details are never saved; the confirmation exists only until leaving or refreshing the page.
- `/login` and `/signup` validate fields and save a local profile. These are simulated flows: any valid email and password of at least eight characters can sign in. Signup does not create an API account. Passwords are never persisted or transmitted. The stored name/email is not a secure session; do not use real credentials. Log out clears the profile.
- Unknown paths and invalid/missing products have recovery links. Product loading, request errors with Try again, API-empty, filtered-no-match, empty cart, and unavailable images each have their own UI.

Next.js owns routing and route-level code splitting through `src/app`. Route files are Server Components that compose the existing feature pages; interactive feature pages use explicit client boundaries. `layout.tsx` supplies metadata, the font preload, providers, and the shared `AppLayout`. Navigation, storage notices, and footer stay mounted while page content changes. `loading.tsx`, `error.tsx`, and `not-found.tsx` supply route loading, retry/reload, and unknown-path recovery. Links use `next/link`; navigation hooks come from `next/navigation`. There is no React Router or catch-all SPA page.

Catalog and product requests use TanStack Query's Suspense hooks. `CatalogResults` and `ProductContent` sit inside their own `AsyncBoundary`, so slow or broken data does not remove the catalog hero, product back link, or application shell. Try again resets both the Error Boundary and Query's error latch before retrying. Invalid IDs never request the API; HTTP 404 displays the missing-product state instead of a retryable server failure.

Product fetching intentionally remains client-side. `BrowserData` renders the same loading placeholder on the server and during hydration, then mounts the query consumers in the browser. This keeps builds independent of DummyJSON availability and preserves the assignment's browser-side request/retry behavior. The shell and hero have server-rendered HTML, but product data is not server-rendered. Static titles use Next.js metadata. Product and checkout states own their React `<title>` elements; those routes clear the inherited metadata title so streamed metadata cannot overwrite a loaded product name or local confirmation. Catalog filters use Next.js's native History API integration so typing does not trigger server requests.

There is no payment processing, wishlist, or account dashboard. The storefront does not display implementation notices; these limitations belong here.

Checkout uses [shadcn/ui Input](https://ui.shadcn.com/r/styles/new-york/input.json) and [Label](https://ui.shadcn.com/r/styles/new-york/label.json) source components in `src/shared/components/ui`. They retain native input props/ref support and Radix's label primitive, adapted to React 19 ref props and this repo's plain CSS rather than adding Tailwind. Their MIT notice is included. Form values/errors belong to react-hook-form; `CheckoutField` consumes its form Context. Validation runs on blur/submit and revalidates touched fields as they are corrected. Errors are associated with inputs, invalid submission focuses the first error, and a submission lock prevents duplicate confirmations.

## Structure

```text
src/
  app/
    layout.tsx             # Server layout, metadata, styles and shared shell
    providers.tsx          # Client-owned QueryClient, auth and cart providers
    page.tsx               # Catalog route
    products/[productId]/page.tsx
    cart/page.tsx
    checkout/page.tsx
    login/page.tsx
    signup/page.tsx
    loading.tsx            # Route loading UI
    error.tsx              # Route retry/reload UI
    not-found.tsx          # Unknown-route recovery with HTTP 404
    api/[...path]/route.ts # Development-only API scenarios
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
      cart.state.ts        # Cart Context contract and persisted-state factory
      components/
      pages/
    auth/
      auth.types.ts        # Profile, form fields and errors
      auth.logic.ts        # Pure form validation and profile creation
      auth.state.ts        # Profile Context contract and persisted-state factory
      components/
      pages/
    checkout/
      checkout.types.ts    # The checkout schema, values and receipt contract
      components/          # Form, fields, live summary and confirmation
      pages/
  shared/
    api/client.ts          # HTTP status checks, timeout and cancellation
    components/            # Controls, shared layout and async boundaries
      ui/                  # Adapted shadcn Input/Label and their license
    storage.ts             # Versioned storage adapter and subscriptions
    money.ts               # Integer-cent conversion and USD formatting
  styles.css               # Tokens and responsive styles
tests/                     # Unit/component tests and test-only fixtures
e2e/                       # Browser flows with intercepted API responses
tooling/                   # Development-only API scenario resolution
```

Components import feature contracts, rules, state, or feature components directly. There are no barrel files. `*.logic.ts` does not access storage or import React. Only the shared HTTP client calls `fetch`; only the storage adapter accesses `localStorage`.

This assignment continues in the same repository as Day 4. Vite remains only in the Vitest test toolchain; development and production use Next.js.

## API and cart decisions

[DummyJSON products](https://dummyjson.com/docs/products) is the only runtime inventory source. The catalog request uses `limit=0` and selects only the fields the grid/filter logic needs. Full details come from `/products/:id`. TanStack Query deduplicates and caches requests for five minutes, with a 15-second request timeout and explicit retry controls. No hardcoded fallback catalog is used. Suspense queries may finish after their observer unmounts; leaving a slow page still works without waiting for them.

Zod validates unknown JSON before mapping API dollar prices into integer cents. `Category` is the closed union inferred from the 24 supported category slugs; the label map is exhaustive. An unexpected category or malformed response produces an error instead of widening the type or silently dropping a product. If DummyJSON adds categories, update the schema and labels together.

Cart quantities start at 1, merge by product ID, and cannot exceed the product's last known stock. Out-of-stock items cannot be added. DummyJSON's wholesale-style `minimumOrderQuantity` is intentionally ignored. The displayed `price` is used directly; no additional discount is applied. Totals include products only, not shipping or taxes.

The versioned keys are `shopboard:cart:v1` and `shopboard:profile:v1`. Stored values are validated, including positive quantities, stock bounds, and unique product IDs. Corrupt or blocked storage shows a warning without crashing. Failed writes retain in-memory changes and explain that refresh may lose them. Open tabs receive storage-event updates.

`CartProvider` owns the single cart instance and exposes its snapshot and actions through React Context. Context fits this small app without adding a state library. The provider uses the tested storage adapter with `useSyncExternalStore` to observe browser storage changes; it does not copy the cart into React state or synchronize copies with effects. Stable empty server snapshots prevent server-side storage access and hydration mismatches; the validated browser snapshot appears after hydration. `AuthProvider` uses the same pattern. Components can only change the cart through `useCart().actions`, not a module-global store. `Providers` also owns its QueryClient rather than sharing a module-global cache between server requests.

Cart entries contain a small product snapshot so they remain readable after refresh without waiting for the catalog. Prices and stock are not continuously reconciled with DummyJSON. Adding the product again updates its snapshot. A real checkout would need server-side price and inventory validation.

## Component tree

Next.js enables Strict Mode for the App Router. The tree shows feature-level props; native elements, icons, repeated Button instances, and library internals are omitted. Next.js handles route-level splitting.

```text
RootLayout { children } [app/layout.tsx, server]
└─ Providers { children } → QueryClientProvider { client } → AuthProvider { children }
   └─ CartProvider { children }
      └─ AppLayout { children } [server]
         ├─ RouteFocus {}
         ├─ Header {}
         ├─ StorageNotice {}
         ├─ Next.js route Error Boundary → Suspense → page.tsx
         │  ├─ CatalogPage {} [/]
         │  │  ├─ CatalogHero {}
         │  │  └─ AsyncBoundary { title, fallback, children }
         │  │     ├─ CatalogSkeleton {} [loading]
         │  │     └─ CatalogResults {}
         │  │        ├─ CatalogControls { filters, categories, onChange, onReset }
         │  │        ├─ StateMessage { title, children } [empty/no match]
         │  │        ├─ ProductGrid { products }
         │  │        │  └─ ProductCard { product, loading? } [key: product.id]
         │  │        │     ├─ ProductImage { src, alt, loading }
         │  │        │     └─ AddToCart { product }
         │  │        └─ Pagination { page, pages, onChange }
         │  ├─ ProductPage { productId } [/products/[productId]]
         │  │  ├─ MissingProduct {} [invalid ID]
         │  │  └─ AsyncBoundary { title, fallback, children } [key: id]
         │  │     └─ ProductContent { id }
         │  │        ├─ MissingProduct {} [HTTP 404]
         │  │        └─ ProductDetailsView { product } [key: product.id]
         │  │           ├─ ProductGallery { images, title }
         │  │           │  └─ ProductImage { src, alt, loading?, className? }
         │  │           ├─ QuantityControl { name, value, max, onChange }
         │  │           └─ AddToCart { product, quantity }
         │  ├─ CartPage {} [/cart]
         │  │  ├─ StateMessage { title, children } [empty]
         │  │  ├─ CartRow { item, onRemove } [key: product.id]
         │  │  │  ├─ ProductImage { src, alt }
         │  │  │  └─ QuantityControl { name, value, max, onChange }
         │  │  └─ CartSummary { quantity, subtotalCents }
         │  ├─ CheckoutPage {} [/checkout]
         │  │  ├─ StateMessage { title, children } [empty cart]
         │  │  ├─ CheckoutForm { onComplete }
         │  │  │  └─ FormProvider → CheckoutField { name, label, autoComplete, type? }
         │  │  │     ├─ Label { htmlFor, children }
         │  │  │     └─ Input { register props, id, type, autoComplete, aria-* }
         │  │  ├─ CheckoutSummary {}
         │  │  └─ OrderConfirmation { receipt } [success]
         │  ├─ AuthPage { mode: 'login' | 'signup' } [/login or /signup]
         │  │  └─ AuthForm { mode } [key: mode]
         │  │     └─ TextField { id, label, error?, native input props }
         │  └─ NotFoundPage {} [*]
         │     └─ StateMessage { title, children }
         └─ Footer {}
```

`AsyncBoundary` composes QueryErrorResetBoundary → ErrorBoundary → Suspense → BrowserData. Its error fallback uses StateMessage and a retry Button. `MissingProduct` also renders StateMessage. `Button` accepts native button props plus `variant`; QuantityControl and AddToCart compose it. Input and Label accept their native/primitive props, including refs. Other reusable components use typed `Props` interfaces.

### State ownership

| State                                                      | Owner                                                                 |
| ---------------------------------------------------------- | --------------------------------------------------------------------- |
| Catalog and product request data/status/cache              | TanStack Query through `products.state.ts`                            |
| Search, category, sort, page                               | URL parameters managed by `CatalogResults`                            |
| Filtered/sorted products, categories, page count           | Derived by pure product rules during render                           |
| Cart items and persistence issues                          | `CartProvider` through Context; one persisted-state instance          |
| Cart quantity/subtotal and stock-limited buttons           | Derived from cart data, not duplicated in state                       |
| Local signed-in profile and persistence issues             | `AuthProvider` through Context; one persisted-state instance          |
| Form values, touched fields, submitted flag                | `AuthForm`; errors derived by `auth.logic.ts`                         |
| Checkout values, touched fields, errors, submission status | react-hook-form inside `CheckoutForm`                                 |
| Completed receipt snapshot                                 | `CheckoutPage`; local historical summary, not a copy of the live cart |
| Requested product quantity                                 | `ProductDetailsView`; effective quantity derives from remaining stock |
| Selected photograph                                        | `ProductGallery`                                                      |
| Image load failure                                         | Each `ProductImage` instance                                          |

## Debug lab and design

`debug-lab-log.md` records all five hosted lab bugs, with browser observations, source causes, and proposed fixes. `CLAUDE.md` carries the five resulting React rules. `DESIGN.md` describes the implemented visual system and asset sources. Font licensing is in `public/fonts/OFL.txt`.

The required Vercel skills are vendored under `.claude/skills/vercel-react-best-practices` and `.claude/skills/vercel-composition-patterns`, from [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) revision `1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62`. They are kept unformatted to preserve upstream content.

## Checks and hosting

Unit/component tests cover product ordering, immutable cart rules, Context ownership, cents, authentication/checkout validation, duplicate submissions, API mapping/scenarios, route and data-boundary retry, server-safe storage snapshots, storage corruption/failures, and reusable UI behavior. Browser tests intercept API responses for repeatable search/cart/auth/checkout flows, App Router transitions, server HTML without JavaScript, loading/error/empty states, stock limits, real unknown-route 404s, pagination, persistence, Console checks, and viewport overflow. Test fixtures are never imported by application code. Deliberately injected API errors and unknown-route 404s produce expected HTTP/development logs; normal-route Console checks must remain clean.

Run the same browser suite against the production server after building:

```sh
npm run build
SHOPBOARD_E2E_PRODUCTION=1 npm run test:e2e
```

This also checks that scenario endpoints return 404 in production. CI tests both server modes; production tests catch differences such as streamed metadata replacing browser-owned titles.

ESLint 9 is used because the accessibility plugin currently supports it. A scoped `minimatch` override patches the type-aware lint toolchain's dependency for [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249); no runtime package is overridden.

To host, use a Next.js-compatible platform, or run `npm run build` followed by `npm run start` on a Node server. The build output is `.next/`; it is not a static `dist/` bundle and does not use an `index.html` fallback. Direct visits to `/cart` and `/products/1` are handled by Next.js. No hosting account or deployment is configured by this project.
