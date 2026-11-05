# ShopBoard React

## Working here

This is a Vite React + TypeScript storefront. Product data comes from DummyJSON. Authentication is a local simulation; credentials are never checked or stored. Keep that implementation detail in the README, not storefront copy.

Use the scripts in `package.json`. Before handing off a change, run `npm run check` and `npm run test:e2e`. The browser suite needs `npx playwright install chromium` once.

## Boundaries

- Put feature code in `src/modules/products`, `cart`, or `auth`. Keep components and pages inside their feature. Share a component only when multiple features use it.
- Use `*.types.ts` for contracts and runtime schemas, `*.api.ts` for endpoint validation/mapping, `*.logic.ts` for pure rules, and `*.state.ts` for feature state and persistence. Logic must not import React, state, or storage.
- Only `src/shared/api/client.ts` calls `fetch`. Treat JSON as `unknown`; validate at the feature API boundary. A failed request must show the error state, never substitute products.
- Only `src/shared/storage.ts` accesses `localStorage`. Persist versioned, validated cart/profile data. Surface failures while retaining in-memory changes. Passwords must never leave the form.
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

Update the README component tree and state ownership when components change. Keep the debug log and both required skills in version control. Keep `.vscode`, generated reports, screenshots, and planning notes out of the repo. Leave `../shopboard-starter` unchanged. Let the owner review generated code before committing.
