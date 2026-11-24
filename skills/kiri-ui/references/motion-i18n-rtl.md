# Motion Physics, Performance, i18n, RTL & Native Shell Integration

How Kiri achieves silky desktop motion at near-zero idle CPU, supports 38 languages including RTL scripts without layout breakage, and fuses seamlessly with native macOS/Windows/Linux window frames.

## 1. Motion Discipline & Idle CPU Protection

### Strict Compositor-Only Rule
Animate **only** `transform` and `opacity` (and occasional deliberate `width` / `grid-template-columns` transitions on user interaction). Never animate `box-shadow`, `background-position` inside SVGs, or continuous SVG path transforms in idle states.

Measured real-world lessons recorded directly in Kiri's stylesheet:
- A pulsing `box-shadow` on live status dots caused every-frame repaints costing **~18% of a CPU core**. Replacement: a `::before`/`::after` circle scaling via `transform: scale(var(--ring, 2.3))` + `opacity: 0`.
- An endless CSS animation inside an inline SVG repainted the whole SVG every frame even during static keyframes, costing **~15% of a CPU core**. Replacement: trigger a 1.2s class (`body.sway`) once every 20 seconds and remove it between runs.
- On WebKitGTK without a GPU (VMs / software GL), GL compositing redraws the whole window on animations (~26% CPU idle vs `<1.5%` CPU with software 2D compositing).

### Unified Heartbeat & Window-Blur Freeze
1. **Single synchronized beat**: Instead of dozens of desynchronized infinite CSS animations, one 4-second interval toggles `body.beat` (only when `document.hasFocus() && !document.hidden` and at least one live dot is on screen). Every pulsing indicator binds `animation: var(--beat)` so all dots breathe together and sit completely idle between beats.
2. **Instant freeze on blur/hide**:
   ```js
   const away = () => document.body.classList.toggle("away", document.hidden || !document.hasFocus());
   addEventListener("focus", away);
   addEventListener("blur", away);
   document.addEventListener("visibilitychange", away);
   ```
   ```css
   body.away *, body.away *::before, body.away *::after { animation-play-state: paused !important; }
   ```
3. **Reduced motion**: Global `@media (prefers-reduced-motion: reduce)` kills decorative transitions/animations while slowing essential indeterminate spinners (e.g. `.hspin`, `.sh-spin`, `.usb-busy .spin`) from `0.8s–0.9s` to `2s–2.4s` instead of hiding loading feedback.

### Standard Timing & Easing Curves
- Micro state transitions (hover, border, color): `0.12s`–`0.15s`
- Panel/search/rail geometry transitions: `0.2s ease`
- Popover/bulk-bar entrances (`ppin`, `need-in`, `sh-fade`, `rise`): `0.14s`–`0.22s ease-out`
- Tactile spring entrances (toast stack, tick pop, row action enter): `cubic-bezier(.2, 1.4, .4, 1)` or `cubic-bezier(.2, .8, .3, 1.2)`
- Meter/progress fill smoothing: `0.25s`–`0.6s`

## 2. CSS Logical Properties & Automatic RTL Mirroring

Kiri's stylesheet uses **224 logical properties** (`margin-inline-start`, `padding-inline`, `inset-inline-end`, `border-inline-end`, `border-end-start-radius`) and only **4 physical left/right rules** (reserved strictly for always-LTR code/log line-number gutters).

### The 4 Direction Variables
For properties that lack native logical keywords (`text-align`, `linear-gradient` angles, horizontal `translateX` directions):

```css
:root { --start: left; --end: right; --fwd: 90deg; --dir: 1; }
:root[dir="rtl"] { --start: right; --end: left; --fwd: 270deg; --dir: -1; }
```
- Text alignment: `text-align: var(--start)` / `var(--end)`
- Directional fades & range tracks: `linear-gradient(var(--fwd), ...)`
- Horizontal slide animations: `transform: translateX(calc(16px * var(--dir)))`

### Bidirectional Text (Arabic / Persian / Sorani Kurdish)
Technical UIs mix RTL prose with LTR identifiers (container names, image tags, ports `5432→5432`, file paths, byte sizes `50.0 MB`):

1. **Per-element first-letter direction**: `[dir="rtl"] body :not(svg, svg *) { unicode-bidi: plaintext; }` combined with `[dir="rtl"] body { text-align: right; }` keeps Latin names readable left-to-right while pinning them to the right edge of RTL columns.
2. **Always-LTR islands**: Logs, terminals, `<pre>`, code editors, breadcrumb paths (`.crumbs { direction: ltr; justify-content: flex-end; }`), and SVG diagrams stay `direction: ltr`.
3. **Unicode bidi marks in dynamic strings**:
   - Prefix RTL translations that start with a Latin product name (`Docker`, `Compose`, `Kiri`) with Right-to-Left Mark (`\u200F`).
   - Wrap interpolated Latin values (sizes, addresses, engine names) in First-Strong Isolate (`\u2068` … `\u2069`) so surrounding RTL punctuation never scrambles them. Bare numbers need no isolate.
4. **Never space Arabic letters**: `[dir="rtl"] body :not(.sh-codebox span, .sh-code) { letter-spacing: 0 !important; }` — letter-spacing disconnects joined Arabic glyphs.
5. **Mirror directional glyphs**: Flip carets, back/forward buttons, breadcrumbs `›`, group chevrons `▸`, and port arrows `→` with `transform: scaleX(-1)` in `[dir="rtl"]` (preserving downward-rotated open carets at `rotate(90deg)`).
6. **Arabic inside monospace fields (`setup.html`)**: Define a `@font-face` restricted to Arabic Unicode ranges (`U+0600-06FF`, etc.) mapped to a proportional Arabic UI font before the monospace fallback, preventing monospaced Arabic distortion.

## 3. CJK & Multi-Language Layout Resilience

- **Prevent CJK short-label wrapping**: Chinese and Japanese allow line breaks between any two characters, which can wrap short labels like `关闭`/`开启` inside segmented buttons or pills. Guard with `.cjk .seg button, .cjk .ltabs button, .cjk .pill { white-space: nowrap; }`.
- **Korean word wrapping**: `:root:lang(ko) { word-break: keep-all; }` wraps between words rather than splitting Hangul syllables mid-word.
- **No-break units**: Join numbers and units with `\u00a0` (`812\u00a0MB /\u00a08\u00a0GB`) so tight cards wrap before `/` and never orphan `GB` onto its own line.
- **Responsive breakpoints**:
  - `<= 1160px`: hide secondary ID columns (`.col-id`)
  - `<= 1080px`: hide secondary timestamp columns (`.col-created`)
  - `<= 900px`: shrink global search (`280px → 200px`), hide primary toolbar text labels (keep icons), stack Compose 3-column editor to 1 column (hide outline), switch 4-card stats grid to 2×2, wrap diagnostic log messages to a full-width second line
  - `<= 760px`: collapse 2-column detail disclosures to 1 column
  - `max-height: 520px`: compact modal hero padding and hide decorative background word clouds

## 4. Native WebView Shell Integration

To eliminate the "web page inside a window" seam across desktop OSes:
- **macOS (`WKWebView` + AppKit)**:
  - `NSWindowStyleMask::FullSizeContentView`, `setTitlebarAppearsTransparent(true)`, `setTitleVisibility(Hidden)`.
  - Disable WebView white flash via `drawsBackground = false`.
  - Programmatically reposition native traffic-light buttons vertically centered inside the `44pt` `.strip` (20pt inset from leading edge; mirrored to trailing edge in RTL; re-applied on window resize and exit-fullscreen).
- **Windows (`WebView2`) & Linux (`WebKitGTK`)**:
  - Keep native OS title bars, hide `.strip .lights` via `body.win` / `body.linux`, and match default window bounds (`1280×800`, min `760×480`, capped at 90% of work area).
  - Sync native window dark/light chrome with the page's `theme` preference.
- **Icon & Asset Pipeline**:
  - Bundle all UI icons (Phosphor Regular, 256 viewBox) and minified brand SVG paths (Simple Icons, rounded to 1 decimal place, capped at `2500B`) at build time — zero CDN font/icon requests at runtime.
  - Generate macOS app icons with a `100px` safe margin (`1024×1024` canvas, `rx=185`) and Windows taskbar icons full-bleed (`m=0`, `rx=230`) from a single parametric SVG generator script.
