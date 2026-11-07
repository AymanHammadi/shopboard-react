# ShopBoard React

## Working here

This is a Vite React + TypeScript storefront with lazy routes and a shared layout. Product data comes from DummyJSON. Authentication and checkout are local simulations: no credentials are checked, no payments are taken, and no backend order is created. Keep implementation explanations in the README.

Use the scripts in `package.json`. Before handing off a change, run `npm run check` and `npm run test:e2e`. The browser suite needs `npx playwright install chromium` once.

The pre-commit hook runs the full `check`, including build; staged-only linting missed type/build failures. Keep related changes in separate commits and keep the hook enabled. Never claim manual lesson-note, device, DevTools, or GitHub verification without performing it.

## Boundaries

- Put feature code in `src/modules/products`, `cart`, `auth`, or `checkout`. Keep components and pages inside their feature. Shared application components and the adapted shadcn primitives live in `src/shared/components`.
- Use `*.types.ts` for contracts and runtime schemas, `*.api.ts` for endpoint validation/mapping, `*.logic.ts` for pure rules, and `*.state.ts` for feature state and persistence. Logic must not import React, state, or storage.
- Only `src/shared/api/client.ts` calls `fetch`. Treat JSON as `unknown`; validate at the feature API boundary. A failed request must show the error state, never substitute products.
- Only `src/shared/storage.ts` accesses `localStorage`. Persist versioned, validated cart/profile data. Surface failures while retaining in-memory changes. Passwords must never leave the form.
- `CartProvider` owns one persisted cart instance. Read it and change it through `useCart` and its actions; a module-global cart would bypass Context ownership. Derive totals and stock limits, and keep form fields, requested quantities, and gallery selection local.
- `AuthProvider` likewise owns the profile used by the header, authentication pages, and checkout. Use `useAuth().actions` for sign-in/out instead of exported global mutation functions.
- Wrap lazy pages inside the shared layout's Suspense/Error Boundary. Product data belongs inside its local `AsyncBoundary`; putting it above the boundary would hide the whole page during slow requests. Reset Query and the boundary together on retry. Reload failed lazy imports, because React caches their rejection.
- Checkout validation belongs only in `checkoutSchema`, connected through `zodResolver`. Keep form state in react-hook-form and never persist shipping details. Confirm and clear the cart in the submit handler, not an effect; snapshot the receipt before clearing.
- Keep scenario endpoints in `tooling/api-scenarios.ts`, which runs only in Vite development. Production requests must use the configured API and must never substitute fixture inventory.
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

Read `.claude/skills/vercel-react-best-practices/SKILL.md` for React data fetching or rendering work, and `.claude/skills/vercel-composition-patterns/SKILL.md` for component API changes. Apply the relevant client-side guidance; this app has no Next.js server components.

Update the README component tree and state ownership when components change. Keep the debug log and both required skills in version control. Keep `.vscode`, generated reports, screenshots, and planning notes out of the repo. Leave `../shopboard-starter` unchanged. Commit only when the owner authorizes it; use focused commits rather than bundling unrelated work.
