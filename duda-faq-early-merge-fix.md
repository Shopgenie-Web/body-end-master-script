# Duda-side fix: `faq-early-merge` inline script

This note is for whoever manages the **Duda template** for roosterridgecarcare.com. It is a
companion to the fix already applied to `faq-merge-script.js` in this repo.

## Why this is needed

The site has **two** copies of the FAQ-merge logic, and both share the same bug:

1. `faq-merge-script.js` (in this repo, loaded via the master script loader) — **already fixed.**
2. An **inline script with `id="faq-early-merge"`** pasted directly into the site's **Body End HTML**
   in the Duda editor — **still broken, must be fixed here.**

Both scripts collect every `application/ld+json` block on the page, harvest FAQ content from the
ones that are FAQs, and then **delete all of them** — FAQ or not. On the location pages
(The Woodlands, Conroe, Cypress, Pearland), which carry `LocalBusiness` schema but no FAQs,
this deletes the location "ID cards" before Google can read them. Google's Rich Results Test
reports **"No items detected"** as a result.

Fixing only the repo copy is **not enough**: this inline copy runs on the same page and will keep
deleting the cards. Both must be fixed.

## How to find the script

1. Open the site in the **Duda editor**.
2. Go to **Settings → Head HTML / Body End HTML** (the panel where custom site-wide code lives;
   in Duda this is usually under **Site Settings → Head HTML** or the page/template "Developer
   Tools" → Body End HTML).
3. Look for a `<script>` block containing `id="faq-early-merge"` (or text that mentions
   `faqDone` / merging FAQ schema). It will contain a loop that ends with an unconditional
   `.remove()` call on each schema block.

## The fix

The script should **only delete a schema block if it actually harvested FAQ content from it.**
Add a `hadFaq` flag and gate the removal on it.

**Find** the loop that removes each block. It looks like this (variable names may differ slightly —
the giveaway is a `.remove()` that runs for every block, outside the FAQ check):

```js
blocks.forEach(s => {
  try {
    /* ...checks if the block is an FAQPage and, if so,
       copies its questions into the combined card... */
  } catch (e) { }
  s.dataset.faqDone = 'y';
  s.remove();              // <-- BUG: deletes EVERY block, FAQ or not
});
```

**Replace** it with this — only the `hadFaq` flag and the `if (hadFaq)` guard are new:

```js
blocks.forEach(s => {
  let hadFaq = false;
  try {
    const d = JSON.parse(s.textContent);
    (Array.isArray(d?.['@graph']) ? d['@graph'] : [d]).forEach(n => {
      if ((n['@type'] || '').toLowerCase() === 'faqpage'
          && Array.isArray(n.mainEntity)) {
        combo.mainEntity.push(...n.mainEntity);   // use whatever the combined-card variable is named
        hadFaq = true;
      }
    });
  } catch (e) { }
  s.dataset.faqDone = 'y';
  if (hadFaq) s.remove();   // only remove blocks we actually harvested
});
```

Notes:
- Keep the existing variable names from the inline script (e.g. the combined-card object may be
  called `combo`, `combined`, etc.). Only the **logic change** matters: set `hadFaq = true`
  whenever you push into the combined card, and wrap the `.remove()` in `if (hadFaq)`.
- Leave `s.dataset.faqDone = 'y'` (or its equivalent) **unconditional** — non-FAQ blocks should
  still be marked so they aren't re-scanned, just not removed.
- Do **not** delete the script entirely. It is intentionally installed and its FAQ-merging behavior
  may matter on other pages.

## After saving

1. **Republish** the Duda site so the change goes live.
2. Run Google's Rich Results Test: <https://search.google.com/test/rich-results>
3. Enter `https://www.roosterridgecarcare.com/the-woodlands` and run the test.
   - **Before the fix:** "No items detected."
   - **After the fix:** detected **Local Business** items. That screen is pass/fail proof.
4. Repeat for the **Conroe**, **Cypress**, and **Pearland** pages — the same cards appear
   site-wide, so all should pass together.

## Optional schema cleanups (while you're in there)

These concern the schema cards themselves (authored in the Duda site), not the merge scripts:

- The Woodlands card's `@id` and `url` point to the homepage rather than the `/the-woodlands`
  page. Each location's card should reference its own page so Google doesn't see multiple
  locations claiming to be the same entity.
- The public contact email in the cards is an agency address (`jmiller@srsandco.com`). Confirm
  this is intentional; normally the business's own email (or none) is preferred in public schema.
- One card references a Pearland storefront photo — verify each location's card uses an image of
  that location.
