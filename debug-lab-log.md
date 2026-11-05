# Debug lab log

Source: <https://shopboard-api.vercel.app/debug-lab> and its linked `debug-lab-src.zip`.

Verified on November 5, 2026 using Chromium browser automation, captured Console output, and the downloaded source inspected in memory. The observations below were reproduced, not inferred from the hints. The React DevTools extension's Components tab was not used; that manual course check remains for the project owner. File references below refer to the lab ZIP, not this project's files. Fixes are proposed lab changes, not claims that the hosted lab was modified.

## Bug 1: missing category keys

- **What I saw:** Reloading printed `Each child in a list should have a unique "key" prop` in the Console. The warning named `CategoryChips`.
- **Component:** `CategoryChips`.
- **How I found it:** Captured the browser Console during a reload, then inspected `src/components/CategoryChips.tsx` in the lab source.
- **Cause:** Line 9 maps categories into `<span className="chip">` without a key. React cannot reliably identify the sibling elements.
- **Fix:** Use the unique category value as the key.

```tsx
categories.map((category) => (
  <span key={category} className="chip">
    {category}
  </span>
));
```

## Bug 2: stray zeros

- **What I saw:** Mini Crossbody Bag and Wool Scarf showed a `0` where stock information belonged. The empty cart also showed a standalone `0` above its total.
- **Component:** `StockNote` and `CartPanel`.
- **How I found it:** Read the rendered sold-out cards and empty cart before interacting, then inspected both components in the lab source.
- **Cause:** `StockNote.tsx:6` uses `stock && ...`; `CartPanel.tsx:19` uses `cart.length && ...`. For zero stock or an empty array, those expressions evaluate to the number zero, which React renders.
- **Fix:** Compare explicitly and render a ternary branch. For example, replace the stock expression below; use `cart.length > 0 ? <ul>...</ul> : null` for the cart list.

```tsx
<p className="stock">{stock > 0 ? <span>Only {stock} left</span> : null}</p>
```

## Bug 3: saved heart moves to another product

- **What I saw:** Saved Leather Tote Bag, then selected Price: low to high. Wool Scarf had the filled heart instead of the tote.
- **Component:** `ProductList`, affecting `ProductCard`'s local saved state.
- **How I found it:** Clicked Save Leather Tote Bag, sorted, and checked which card had `aria-pressed="true"`. Inspected the keys in `ProductList.tsx` source.
- **Cause:** Lines 17–18 use the map index as the key. After sorting, React reuses the card at position zero for Wool Scarf, including the previous card's local heart state.
- **Fix:** Remove the index parameter and key the card by `product.id`.

```tsx
shown.map((product) => (
  <ProductCard key={product.id} product={product} onAdd={onAdd} />
));
```

## Bug 4: Featured cannot restore the initial order

- **What I saw:** Initial order was Leather Tote Bag, Canvas Backpack, Mini Crossbody Bag, White Sneakers, Running Shoes, Wool Scarf. After sorting by ascending price and returning to Featured, order remained Wool Scarf, Mini Crossbody Bag, Canvas Backpack, White Sneakers, Leather Tote Bag, Running Shoes.
- **Component:** `ProductList`.
- **How I found it:** Captured the card headings before sorting and after returning to Featured, then inspected the sorting expression.
- **Cause:** `ProductList.tsx:13` calls `products.sort(...)` directly. This mutates the shared `PRODUCTS` array. The Featured branch now reads the already-sorted array.
- **Fix:** Derive a new array without mutating the input.

```tsx
const shown =
  sort === 'price-asc'
    ? products.toSorted((a, b) => a.price - b.price)
    : products;
```

## Bug 5: quantity and total do not update immediately

- **What I saw:** Added Canvas Backpack. Cart showed `× 1` and `$49`. Clicked its plus button twice; both stayed unchanged. Added Leather Tote Bag; the backpack jumped to `× 3` and the total became `$236`.
- **Component:** `CartRow` and `App`.
- **How I found it:** Compared rendered cart text before and after both plus clicks, then added another product to force a rerender. Inspected the row handler and its parent callback.
- **Cause:** `CartRow.tsx:11` mutates the prop with `item.qty = item.qty + 1`. `App.tsx:35` then calls `setCart(cart)` with the same array reference. React can skip the update even though a nested item was mutated. A later immutable addition reveals the hidden changes.
- **Fix:** Pass an item ID to the parent. Let the parent create a new array and a new object for the changed row.

```tsx
function increase(id: number) {
  setCart((current) =>
    current.map((item) =>
      item.id === id ? { ...item, qty: item.qty + 1 } : item,
    ),
  );
}
```

Change the `onChange` prop in `CartPanel` and `CartRow` to `(id: number) => void`, pass `increase` from `App`, and call `onChange(item.id)` from the row button. The row must not mutate `item`.
