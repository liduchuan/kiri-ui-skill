# Tokens, Color System, Typography & Elevation

Complete design token inventory extracted from `crates/kiri/src/ui/index.html` (2,499 lines of CSS) and `crates/kiri-win/src/setup.html` (269 lines of CSS).

## 1. Dual-Theme Surface Architecture

Kiri supports `dark` (default), `light`, and `system`. Because some WebView engines (notably WebKitGTK) do not always propagate runtime theme toggles to `prefers-color-scheme`, both a media-query rule and an explicit `[data-theme="light"]` attribute rule are required:

```css
@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) { /* light overrides */ }
}
:root[data-theme="light"] { /* identical light overrides */ }
```

### Workspace Neutral Palette (5-Tier Surface Ladder)

Each elevation step shifts luminance smoothly without relying on heavy drop shadows:

| Step | Token | Dark | Light | Structural Usage |
|---|---|---|---|---|
| 0 (Sunk) | `--term-bg` / `#0A0E12` | `#0B0F13` / `#0A0E12` | `#FFFFFF` (terminal) / `#0A0E12` (log console) | Recessed terminal, diagnostic log well |
| 1 (Canvas) | `--bg` | `#0F1419` | `#F5F7FA` | Main content area, sticky `th` backing |
| 2 (Chrome) | `--side` | `#121920` | `#EDF0F5` | Sidebar (`aside`), top strip (`.strip`), status bar (`.statusbar`) |
| 3 (Surface) | `--panel` | `#171D24` | `#FFFFFF` | Cards, dialogs, popovers, inputs, default buttons, checkboxes |
| 4 (Raised) | `--raised` | `#1E252D` | `#F3F5F9` | Selected nav, button hover, icon tiles, tags, segmented hover, tooltips |
| Hairline | `--line` | `#2A313A` | `#DDE3EB` | 1px borders, table dividers, inset frames |
| Hover Wash | `--row-hover` | `rgba(255, 255, 255, .035)` | `rgba(15, 20, 25, .035)` | Subtle row and nav hover highlight |

### Ink & Contrast Tokens

| Token | Dark | Light | Usage |
|---|---|---|---|
| `--text` | `#F2F0EB` | `#0F1419` | Primary headings, names, active labels (warm chalk off-white reduces dark-mode halation) |
| `--muted` | `#98A1AC` | `#5E6773` | Secondary text, inactive nav items, table descriptions, icons |
| `--faint` | `#66707C` | `#8A929C` | Uppercase micro headings, placeholders, disabled states, timestamps |
| Soft Value | `color-mix(in srgb, var(--text) 58%, var(--muted))` | same formula | Long key-value details (`.kv dd`, `.dfacts dd`) so dense metadata reads calmly |

## 2. Semantic Palette & Contrast Separation

Never reuse raw indicator hues directly for 11–12px text on light panels. Kiri splits fill/dot colors from small-text tokens guaranteed to hit **>= 4.5:1** contrast:

| Role | Indicator / Border | Small Text (Dark) | Small Text (Light) |
|---|---|---|---|
| Primary / Link | `--blue: #0D6EFD` | `--blue-light: #6EA8FE` | `--blue: #0D6EFD` |
| Healthy / Running | `--moss: #3FB68B` | `--moss: #3FB68B` | `--moss: #3FB68B` |
| Spark Highlight | `--lit-hi` | `#A8F5D4` | `#0F9E6A` |
| Warning / Share | `--sun: #FFC23D` | `--sun-text: #FFC23D` | `--sun-text: #8A6100` |
| Danger / Error | `--red: #DC3545` | `--red-text: #F87171` | `--red-text: #B42318` |
| External / Remote | `--ext: #A78BFA` | `--ext-text: #C4B5FD` | `--ext-text: #6941C6` |
| Brand Ember | `#E0B420` (lid `#F2CF5B`) | `#E8C04A` | `#1A1400` on `#E0B420` fill |

### Severity & Multi-Series Colors

- **Security severity chips**: Critical `#F0506E`, High `#FB8B4B`, Medium `var(--sun)`, Low `var(--blue-light)`, Negligible/Unknown `var(--muted)`.
- **Compose multi-service log prefixes**: `--c0: #6EA8FE`, `--c1: #3FB68B`, `--c2: #A78BFA`, `--c3: #E0A060`, `--c4: #F87171`.
- **Log console levels (on `#0A0E12`)**: text `#D9DEE4`, error `#FF8C8C`, warn `#FFC23D`, info `#8FD3FF`, debug/time `#6B7682`, part `#8C96A3`.

## 3. Dynamic Accent Derivation via `color-mix()`

Six user-selectable accents live in a tiny table (`ACCENTS`):

| ID | Label | Base Hex |
|---|---|---|
| `blue` | Blue (default) | `#0D6EFD` |
| `purple` | Purple | `#8C6EF5` |
| `orange` | Orange | `#F58228` |
| `teal` | Teal | `#14B4A5` |
| `pink` | Pink | `#EC408C` |
| `green` | Green | `#28AA5A` |

Switching accents updates four CSS variables on `:root` using `color-mix(in srgb, ...)`:

```js
r.setProperty("--blue", accent);
r.setProperty("--blue-hover", `color-mix(in srgb, ${accent} 88%, black)`);
r.setProperty("--blue-active", `color-mix(in srgb, ${accent} 78%, black)`);
r.setProperty("--blue-light", `color-mix(in srgb, ${accent} 60%, white)`);
```

### Standard `color-mix()` Opacity Recipe Across Components

Kiri uses `color-mix()` nearly 200 times with consistent perceptual tiers:
- **6%–10% tint** (`color-mix(in srgb, var(--hue) 8%, var(--panel))`): subtle banner, row highlight, failed/warn inline box, icon hover wash.
- **14%–18% tint** (`color-mix(in srgb, var(--hue) 16%, transparent)`): selected filter pill, bulk selection bar, selected table row, icon badge fill, status chip.
- **22%–28% tint**: focus rings (`0 0 0 3px color-mix(in srgb, var(--blue) 22%, transparent)`), text selection, dot glow halos.
- **30%–55% tint** (`color-mix(in srgb, var(--hue) 40%, var(--line))`): semantic borders on alerts, toast outlines, active filter pill borders.

## 4. Typography Scale & Multi-Script Font Stacks

### Strict 4-Size UI Scale + Mono Half-Step

| Token | Size | Weight Convention | Letter Spacing | Line Height | Role |
|---|---|---|---|---|---|
| `--fs-small` | `11px` | `500`–`600` (uppercase headers `600`–`700`) | `.05em`–`.06em` on uppercase labels | `1.35`–`1.5` | `th`, status bar, badges, timestamps, hints, `kbd` |
| `--fs` | `12px` | `400` body, `500` nav/tabs/links, `600` buttons/titles | `0` (`0.06em` on uppercase `.navlabel`) | `1.4`–`1.45` | Body, sidebar, table rows, inputs, buttons, dialogs |
| `--fs-mono` | `11.5px` | `400`–`600` | `0` (`0.12em`–`0.18em` for auth codes) | `1.5`–`1.6` | IDs, image tags, ports, paths, env inputs, YAML editor |
| `--fs-head` | `14px` | `600` | `-.01em` | `1.3` | Settings `h3`, dialog `h3`, detail header name, KPI stats |
| `--fs-title` | `18px` | `600`–`700` | `-.01em` to `-.02em` | `1.2` | Page `.toolbar h2`, Share hero numbers, About name |
| `--fs-log` | `var(--log-size, 11px)` | `400` | `0` | `1.5`–`1.65` | Streaming logs, request tables, diagnostics (`11`/`13`/`15px` user options) |

- **Lowercase x-height normalization**: `html { font-size: var(--fs); font-size-adjust: 0.5; }` keeps custom user fonts visually equivalent to SF Pro / Segoe UI / Menlo.
- **Window zoom**: Global text scaling applies `document.body.style.zoom` (`0.9`, `1`, `1.1`, `1.25`), while xterm.js undoes body zoom via `zoom: var(--ht-unzoom, 1)` so canvas character cell measurement stays pixel-exact.

### Cross-Platform Multi-Script Font Stacks

Latin base:
- UI: `-apple-system, BlinkMacSystemFont, "SF Pro Text", ..., sans-serif`
- Mono: `ui-monospace, "SF Mono", Menlo, monospace`

Language-specific CJK & script fallbacks appended dynamically after Latin (macOS → Windows → Linux Noto) so Han characters never render in the wrong regional glyph variant:
- `zh-Hans`: `"PingFang SC", "Microsoft YaHei UI", "Noto Sans CJK SC", "Source Han Sans SC"`
- `zh-Hant`: `"PingFang TC", "Microsoft JhengHei UI", "Microsoft JhengHei", "Noto Sans CJK TC", "Source Han Sans TC"`
- `ja`: `"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic UI", "Meiryo UI", Meiryo, "Noto Sans CJK JP", "Source Han Sans JP"`
- `ko`: `"Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans CJK KR", "Source Han Sans KR"`
- `ar / fa / ckb`: `"SF Arabic", "Geeza Pro", "Segoe UI", "Noto Sans Arabic", "Noto Naskh Arabic"`

## 5. Spatial, Radius, Z-Index & Shadow Scales

### Control Height Scale

| Height | Components |
|---|---|
| `18px` | `kbd`, compact inline strip buttons, diagnostics part tags |
| `24px` | Bottom `.statusbar`, terminal `.httab`, compact popover buttons |
| `26px` | `.btn.sm`, compact inputs, dropdown rows (`.ssrow`), map search |
| `28px` | Top strip `.sb` icon buttons, `.gfind` global search, `.ltab` filter pills |
| `30px` | Table icon action buttons (`.btn.ic`, `.btn.more`), `.menu button`, segmented `.seg button` |
| `31px` | Sidebar `nav button`, Settings `.tabs button` |
| `32px` | Standard `.btn`, `input.field`, `.ssb` custom select |
| `44px` | Top window `.strip` (matches macOS traffic-light bar) |
| `62px` | Page `.toolbar` header |

### Border Radius Scale

| Radius | Usage |
|---|---|
| `4px` | Checkboxes (`.cb`), `kbd.key`, `.beta` / `.role` micro tags, scrollbar thumb |
| `5px`–`6px` | `.btn.sm` (5px), `.btn` (6px), `.sb` (6px), menu items (5–6px), 24px sub-tiles (6px) |
| `7px`–`8px` | Nav buttons (7px), `.seg` (7px), `.gfind` (8px), `.tile` 30px (8px), `.menu` (8px), banners (8px) |
| `9px`–`10px` | `input.field` (9px), `.scard` (10px), `.pp` popover (10px), `.console` / `.term` (10px), 40px `.dhead .tile` (10px) |
| `12px`–`14px` | `.dialog` (12px), `.vm` card (12px), `.updcard` (12px), `.wn-dialog` / `.sh-stat` / `.sh-row` (14px) |
| `99px` / `999px` | Filter pills (`.ltab`), tags (`.tag`), progress bars (`.meter`, `.pbar`), slider tracks & thumbs |
| `50%` | Status dots (`6–8px`), circular badges, spinners |

### Elevation & Shadow Tiers

| Tier | Box-Shadow | Usage |
|---|---|---|
| Hairline (no shift) | `inset 0 0 0 1px var(--line)` | Active nav, tiles, selected list rows, tag buttons |
| Focus Ring (input) | `0 0 0 3px color-mix(in srgb, var(--blue) 22%, transparent)` | Focused `input.field`, `.gfind:focus-within`, inline inputs |
| Focus Ring (button) | `0 0 0 .25rem color-mix(in srgb, var(--blue) 25%, transparent)` | `.btn:focus-visible` |
| Tier 1 (Float) | `0 8px 24px rgba(0, 0, 0, .25–.35)` | Toasts, custom select popups (`.sspop`), language popup |
| Tier 2 (Popover) | `0 14px 36px rgba(0, 0, 0, .38), 0 2px 6px rgba(0, 0, 0, .2)` | Pull popover (`.pp`), update card, context menus, `.need` popover |
| Tier 3 (Modal Hero) | `0 24px 60px rgba(0, 0, 0, .35)` | Release notes dialog (`.wn-dialog`), error details dialog |
| Drawer Up-Shadow | Dark: `0 -10px 28px rgb(0 0 0 / .32), 0 -1px 0 rgb(0 0 0 / .25)` / Light: `0 -8px 22px rgb(0 0 0 / .10)` | Bottom terminal drawer (`.htdrawer`) lifting above content |

### Z-Index Stacking Architecture

| z-index | Layer |
|---|---|
| `1`–`2` | Sticky list section labels (`.lsect`), split-pane dividers (`.htdiv`) |
| `3` | Sticky table headers (`th`), sticky detail sub-tabs, docked terminal drawer (`.htdrawer`) |
| `5` | Inline hover tooltips (`.tip`), terminal resize grip (`.htgrip`) |
| `6` | Floating non-modal cards (`.updcard`, `.toolsbar`) |
| `7` | Row action context menus (`.menu`) |
| `8` | Popovers (`.pp`, `.regmenu`, `.langpop`) and modal scrims (`.scrim`, `.sh-float`) |
| `9` | Toasts (`.toasts`, `.run-tip`) — deliberately above modal scrims (`8`) so feedback is never blurred |
| `10` | Anchored action popovers (`.need`), maximized terminal drawer (`.htdrawer.max`) |
| `20`–`35` | Terminal overlays (`htfind: 20`, `htask: 25`, `htpop/htmenu: 30`, `htctx: 35`) & full-screen onboarding (`#onb: 30`) |
| `40` | Language onboarding scrim (`.scrim.langstep`), terminal toast (`.httoast`) |
| `1000` | Global portal overlays (`.sspop` custom select dropdowns, `.copied-tip` floating copy bubble) |

## 6. Companion Mode: Spacious Onboarding / Setup Wizard (`setup.html`)

When building first-run installers or onboarding flows alongside a dense workspace, Kiri shifts to a slightly roomier dark palette with warm Ember highlights:
- Surfaces: `--bg: #0F1419`, `--rail: #131920`, `--surface: #171E26`, `--sunk: #0B0F13`, `--line: #26303A`, `--line-2: #1B232C`, `--stroke: #3A4652`.
- Ink: `--ink: #F6F2EA`, `--text-2: #C9CDD2`, `--muted: #9AA3AE`.
- Warm brand highlight: `--ember: #E0B420`, `--lid: #F2CF5B`, `--ember-text: #E8C04A`, `--ember-deep: #CC9A0C`.
- Layout: `280px` left step rail + spacious `main` (`padding: 44px 56px 28px`), `15px` base body, `34px–40px` display headings, `18px` card radius, `40–44px` primary buttons, sticky footer bar when viewport height `<= 768px`.

## 7. Tailwind CSS v4 `@theme` Mapping (Optional Adapter)

If implementing Kiri UI in a Tailwind v4 project, map the tokens directly rather than using default Tailwind gray/blue ramps:

```css
@theme {
  --color-bg: var(--bg);
  --color-side: var(--side);
  --color-panel: var(--panel);
  --color-raised: var(--raised);
  --color-line: var(--line);
  --color-ink: var(--text);
  --color-muted: var(--muted);
  --color-faint: var(--faint);
  --color-accent: var(--blue);
  --color-accent-light: var(--blue-light);
  --color-moss: var(--moss);
  --color-sun: var(--sun);
  --color-sun-text: var(--sun-text);
  --color-danger: var(--red);
  --color-danger-text: var(--red-text);
  --color-ext: var(--ext);
  --color-ext-text: var(--ext-text);

  --text-xs: var(--fs-small);   /* 11px */
  --text-sm: var(--fs);         /* 12px */
  --text-mono: var(--fs-mono);  /* 11.5px */
  --text-base: var(--fs-head);  /* 14px */
  --text-lg: var(--fs-title);   /* 18px */
}
```
