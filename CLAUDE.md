# ShopBoard

## Working here

This is a Next.js App Router + React + TypeScript storefront. Initial DummyJSON products render on the server and hydrate TanStack Query. Authentication remains a local simulation. Demo checkout validates requests and prices against fresh inventory on the server, without payments, inventory reservations, or durable orders. Keep implementation explanations in the README.

Use the scripts in `package.json`. Before handing off a change, run `npm run check` and `npm run test:e2e`. The browser suite needs `npx playwright install chromium` once.

The pre-commit hook runs the full `check`, including build. Keep related changes in separate commits and keep the hook enabled.

## Boundaries

- Put feature code in `src/modules/products`, `cart`, `auth`, or `checkout`. Keep components and pages inside their feature. Shared application components and the adapted shadcn primitives live in `src/shared/components`.
- Compose feature state with shared shell components in `src/app/storefront.tsx`. Shared code cannot import features or the app; features cannot import the app. ESLint enforces these directions. Cross-feature imports of contracts, rules, and feature controls remain intentional.
- Keep Next.js route files, metadata, loading/error/not-found conventions, and the root provider composition in `src/app`. Route files and the shared layout are Server Components; mark interactive entry points with `use client`. Keep QueryClient and persisted stores provider-owned, with stable server snapshots for storage hydration.
- Use `*.types.ts` for contracts and runtime schemas, `*.api.ts` for endpoint validation/mapping, `*.logic.ts` for pure rules, and `*.state.ts` for feature state and persistence. Logic must not import React, state, or storage.
- Only `src/shared/api/client.ts` calls `fetch`. Treat JSON as `unknown`; validate at the feature API boundary. A failed request must show the error state, never substitute products.
- Only `src/shared/storage.ts` accesses `localStorage`. Persist versioned, validated cart/profile data. Surface failures while retaining in-memory changes. Passwords must never leave the form.
- `CartProvider` owns one persisted cart instance. Read it and change it through `useCart` and its actions; a module-global cart would bypass Context ownership. Derive totals and stock limits, and keep form fields, requested quantities, and gallery selection local.
- `AuthProvider` likewise owns the profile used by the header, authentication pages, and checkout. Use `useAuth().actions` for sign-in/out instead of exported global mutation functions.
- Use Next.js loading/error files for route boundaries. Keep `QueryHydration` inside a local Suspense boundary so fetching never hides the hero, back link, or shell. Each server request owns its QueryClient. Hydrate successful queries; pass initial failures to `AsyncBoundary` for an explicit browser retry. Keep that initial-retry state outside its resettable ErrorBoundary. Reset Query and the boundary together on subsequent failures.
- Keep auth and checkout form state in react-hook-form with `zodResolver` and feature schemas. Passwords stay in the auth form. Checkout sends contact/shipping values and product IDs/quantities, never prices. Validate requests again on the server and derive totals from fresh inventory. Only a validated server receipt may remove purchased quantities; retain additions made while the request was pending. Never persist shipping details.
- Keep scenario rules in `tooling/api-scenarios.ts`, called by `src/app/api/[...path]/route.ts` only in development. That route returns 404 in production; `/api/checkout` remains available. Browser inventory uses `NEXT_PUBLIC_API_BASE_URL` or DummyJSON; server inventory can override it with `API_BASE_URL`. Use the same inventory source in both. Fixtures run only in the separate browser-test HTTP server, never in application code.
- Use integer cents for calculations. Retail quantities start at 1 and cannot exceed the last known stock. DummyJSON wholesale minimums are intentionally ignored.
- `Category` is a closed union inferred from `categorySchema`. Add API categories there and to `categoryNames`, never widen it to `string`.
- Use typed `Props` interfaces on reusable components and native HTML attributes on shared controls. No explicit `any`, type assertions, non-null assertions, logical-not operators, or TypeScript/ESLint suppression comments.

## Rules from the debug lab

1. Key every mapped element, including simple category labels. Missing keys generate React warnings.
2. Key products and cart rows by product ID, never by array position. Local component state belongs to the product even after sorting.
3. Use explicit comparisons and ternaries in JSX. A numeric `&&` condition can render a stray `0`.
4. Sort with `toSorted()` or a copied array. Mutating an API array destroys the original order and breaks Default sorting.
5. Update cart arrays and changed items immutably. Reusing the same array reference can leave quantities and totals stale.

The evidence and proposed lab fixes are in `debug-lab-log.md`. Do not replace observations with invented React DevTools steps.

## Interface and handoff

Read `DESIGN.md` when changing the interface. Keep field labels, visible focus rings, 44px targets, and hover rules gated by pointer capability. Do not add project explanations, technology badges, or demo notices to the storefront.

Read `.claude/skills/vercel-react-best-practices/SKILL.md` for React/Next.js data fetching or rendering work, and `.claude/skills/vercel-composition-patterns/SKILL.md` for component API changes.

Update the README component tree and state ownership when components change. Keep the debug log and both required skills in version control. Keep `.vscode`, generated reports, screenshots, and planning notes out of the repo. Leave `../shopboard-starter` unchanged. Commit only when the owner authorizes it; use focused commits rather than bundling unrelated work.
