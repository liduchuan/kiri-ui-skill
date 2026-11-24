# Automated UI Invariant Verification & CI Gates

What makes Kiri's UI stay razor-sharp across hundreds of PRs is that visual rules are **executable invariants**, not passive guidelines.

## 1. Static CSS Audit (`scripts/audit-ui.mjs`)

Run the bundled zero-dependency static auditor against any CSS or HTML file:

```bash
node skills/kiri-ui/scripts/audit-ui.mjs path/to/styles.css
```

Checks enforced:
1. **Typography scale compliance**: Flags any hardcoded `px` `font-size` outside `:root` (ignoring glyph/icon exceptions).
2. **Logical property discipline**: Reports ratio of logical (`inline`/`block`) vs physical (`left`/`right`) margin/padding/border/inset properties and flags unexpected physical rules.
3. **Reduced-motion guard**: Verifies `@media (prefers-reduced-motion: reduce)` exists whenever animations or transitions are declared.
4. **GPU-only keyframes**: Warns if `@keyframes` animate layout/paint-heavy properties (`box-shadow`, `width`, `height`, `top`, `left`, `margin`, `padding`, `background-color`) instead of `transform`/`opacity`.
5. **Dual-theme completeness**: Verifies both `@media (prefers-color-scheme: light)` and `[data-theme="light"]` exist if light mode tokens are declared.

## 2. Runtime Headless-Browser Invariants (Kiri Pattern)

When building a web or WebView app, replicate Kiri's 5 highest-leverage browser tests (run in headless Chrome / Playwright / Vitest Browser):

### A. CSSOM Typography Scale Lock (from `tests/ui/type.js`)
Inspects `document.styleSheets` at runtime and fails if any non-glyph selector declares a literal `px` `font-size` outside `:root`:

```js
const GLYPHS = [".xterm", ".close-glyph"];
const off = [];
for (const sheet of document.styleSheets) {
  for (const r of sheet.cssRules) {
    if (!r.style || GLYPHS.some((g) => r.selectorText?.startsWith(g))) continue;
    const fs = r.style.getPropertyValue("font-size");
    if (fs && /\dpx/.test(fs) && r.selectorText !== ":root") {
      off.push(`${r.selectorText}: ${fs}`);
    }
  }
}
expect(off).toEqual([]);
```

### B. Universal Clickable Hand-Cursor Sweep (from `tests/ui/hand-cursor.js`)
1. Collect every standard interactive selector (`button`, `a[href]`, `[role=button]`, `[role=link]`, `[role=tab]`, `[role=menuitem]`, `[role=checkbox]`) plus every `[data-*]` attribute handled by click delegation.
2. Navigate through every view, tab, detail page, settings pane, and menu.
3. Assert every visible, enabled interactive element computes `getComputedStyle(el).cursor === "pointer"`.

### C. Responsive & Multi-Language Overflow Matrix (from `tests/ui/vmcard.js`, `tests/ui/actionswidth.js`)
- Test constrained cards across all supported locales × states × fonts using `el.scrollWidth <= el.clientWidth + 1` and `Range.getClientRects()` (with `Intl.Segmenter` for space-less scripts like Thai/Lao) to catch mid-word breaks and split number-unit pairs.
- Test data tables at multiple viewport widths (`760px`, `900px`, `1440px`, `1650px`) asserting the last action button's `right <= td.right + 0.5`.

### D. Live Theme & Contrast Sync (from `tests/ui/theme-pick.js`)
Switch `light → dark → system → dark` and assert computed `backgroundColor` of `body`, primary panel, heading text `color`, `documentElement.colorScheme`, and `--term-bg` all flip in lockstep.

### E. Cross-OS Feature Parity & i18n Integrity (from `tests/ui/parity.js`, `scripts/i18n-check.py`)
- Render the page under simulated `macos`, `windows`, and `linux` modes and assert identical navigation items, table columns, tabs, and settings sections unless explicitly documented in a `parity-allow.txt` allowlist.
- Statically verify every `tr(...)` / `data-i18n*` key exists in every locale JSON with matching `{placeholders}`, matching HTML tags, zero unused keys, and no raw ASCII `"` quotes that break HTML attributes.
- For RTL locales (`ar`, `fa`, `ckb`), assert sidebar flips to the right (`aside.left > main.left`), table headings align right, logs/terminals stay `ltr`/`left`, and bidirectional prose contains no unintended LTR runs.
