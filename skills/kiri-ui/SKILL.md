---
name: kiri-ui
description: >-
  Dense, native-feeling desktop and developer-tool UI design system distilled from libracoder/kiri.
  Use this skill whenever designing, building, styling, or reviewing developer tools, dashboards,
  container/infra managers, native WebView apps (Tauri/Electron/WKWebView), settings panels,
  data-dense tables, built-in terminals, or dark-first technical interfaces — including color tokens,
  surface hierarchy, strict 4-step typography, color-mix() dynamic accents, custom cross-platform
  controls, GPU-only motion, RTL/i18n resilience, and automated CSS/DOM invariant verification.
---

# Kiri UI Design System

Build crisp, calm, high-density desktop and developer-tool interfaces that feel like native macOS/system software rather than web pages.

Distilled from the hand-written, zero-framework stylesheet and automated UI invariant suite of `libracoder/kiri`.

## Core Principles

1. **Surface clarity over ornament.** Separate hierarchy with five tight neutral surfaces (`--bg`, `--side`, `--panel`, `--raised`, `--line`) and 1px hairlines — never heavy drop shadows, glassmorphism noise, or decorative gradients on workspace chrome.
2. **Strict 4-step typography scale.** Every text element uses one of four UI tokens (`11px`, `12px`, `14px`, `18px`) plus `11.5px` for monospace values. Hardcoded `px` font sizes outside `:root` are forbidden.
3. **Derive tints mathematically with `color-mix()`.** Store one base hue per semantic color and accent; compute hover states, subtle backgrounds (`6%–16%`), and tinted borders (`30%–55%`) via `color-mix(in srgb, ...)`.
4. **Native app ergonomics.** Disable accidental text selection and browser context menus on chrome; restore `user-select: text` only on copyable data/logs/inputs; guarantee `cursor: pointer` on every clickable target; keep row actions anchored without hover jitter.
5. **Logical-first layout for RTL & 38+ languages.** Write `margin-inline-start`, `padding-inline`, `inset-inline-end`, and `border-inline-end` instead of physical `left`/`right`. Never let long translations break cards or push table actions off-screen.
6. **Zero-waste motion.** Animate only GPU-composited `transform` and `opacity`. Synchronize live status pulses on a single heartbeat, pause all animations when the window loses focus, and respect `prefers-reduced-motion: reduce`.
7. **Enforce design rules in code.** Back typography, pointer cursors, overflow safety, and theme switching with automated checks rather than prose guidelines alone.

## Quick Reference: Core Tokens

Copy the complete starter stylesheet from [resources/kiri-tokens.css](./resources/kiri-tokens.css).

### Surface & Text Tokens

| Token | Dark (Default) | Light | Role |
|---|---|---|---|
| `--bg` | `#0F1419` | `#F5F7FA` | Main content canvas |
| `--side` | `#121920` | `#EDF0F5` | Sidebar, top strip, bottom status bar |
| `--panel` | `#171D24` | `#FFFFFF` | Cards, dialogs, inputs, default buttons |
| `--raised` | `#1E252D` | `#F3F5F9` | Active nav items, hover buttons, badges, icon tiles |
| `--line` | `#2A313A` | `#DDE3EB` | 1px hairlines, dividers, table rules |
| `--text` | `#F2F0EB` | `#0F1419` | Primary text (warm off-white in dark mode) |
| `--muted` | `#98A1AC` | `#5E6773` | Secondary text, labels, icons |
| `--faint` | `#66707C` | `#8A929C` | Section headings, placeholders, timestamps, muted metadata |
| `--row-hover` | `rgba(255,255,255,.035)` | `rgba(15,20,25,.035)` | Subtle row/nav hover tint |
| `--term-bg` / `--term-fg` | `#0B0F13` / `#D7DCE1` | `#FFFFFF` / `#1F2328` | Embedded terminal & log consoles |

### Semantic & Contrast-Safe Text Tokens

| Semantic | Indicator / Fill | Small Text (WCAG 4.5:1+ Dark / Light) | Meaning |
|---|---|---|---|
| Accent | `--blue: #0D6EFD` | `--blue-light: #6EA8FE` / `--blue: #0D6EFD` | Primary actions, selection, links |
| Healthy / Live | `--moss: #3FB68B` | `--moss: #3FB68B` | Running, active, success |
| Warning / Share | `--sun: #FFC23D` | `--sun-text: #FFC23D` / `#8A6100` | Booting, warning, shareable, killed |
| Danger / Error | `--red: #DC3545` | `--red-text: #F87171` / `#B42318` | Failed, destructive, error |
| External / Remote | `--ext: #A78BFA` | `--ext-text: #C4B5FD` / `#6941C6` | Remote/external resources |
| Brand Highlight | `#E0B420` (lid `#F2CF5B`) | `#E8C04A` (dark) | Brand mark, onboarding wizard, what's-new |

### Typography Scale (Non-Negotiable)

```css
:root {
  --fs-small: 11px;  /* table headers, status bar, badges, timestamps, micro labels */
  --fs: 12px;        /* global body, sidebar nav, table cells, inputs, buttons */
  --fs-mono: 11.5px; /* IDs, commands, paths, env vars (0.5px smaller to match visual weight) */
  --fs-head: 14px;   /* section headings, dialog titles, card hero numbers */
  --fs-title: 18px;  /* page toolbar h2, major KPI figures */
  --fs-log: var(--log-size, var(--fs-small));
}
html { font-size: var(--fs); font-size-adjust: 0.5; }
```

- Apply `font-variant-numeric: tabular-nums` (`.num`) to every counter, byte size, CPU/RAM metric, port, and timestamp.
- Soften long read-only detail values in dark mode with `color: color-mix(in srgb, var(--text) 58%, var(--muted))`.

## App Shell & Spatial Rhythm

- **Desktop window grid**: `grid-template-columns: 212px 1fr` (folds to `60px` icon rail via `body.rail`) and `grid-template-rows: 44px minmax(0, 1fr) auto` (44px top strip, scrollable main pane, 24px bottom status bar).
- **Default window geometry**: `1280×800` (capped at 90% of screen), minimum `760×480`.
- **Control heights**: `24px` (status bar, terminal tabs), `26px` (`.btn.sm`, compact rows), `28px` (top strip icon buttons, filter pills, global search), `30–31px` (nav items, table icon actions, menu items), `32px` (`.btn`, `input.field`, custom select), `44px` (top strip), `62px` (page toolbar).
- **Border radius scale**: `4px` (checkboxes, badges, `kbd`), `5–6px` (buttons, menu items), `7–8px` (nav items, search bar, 30px icon tiles, popups), `9–10px` (cards, popovers, consoles, text fields), `12–14px` (dialogs, VM/share cards), `99px` (pills, meters, tracks), `50%` (status dots, spinners).
- **Spacing rhythm**: `6px` / `8px` / `10px` between related items; `12px` / `14px` inside cards & dialogs; `18px` / `22px` / `28px` between sections; `20px` start / `24–26px` end main page padding.
- **Hairline borders without layout shift**: Use `box-shadow: inset 0 0 0 1px var(--line)` on active nav items, tiles, and selected rows so focus/selection never jitters geometry.
- **ARIA as the styling API**: Style component state via semantic attributes (`[aria-current=page]`, `[aria-current=true]`, `[aria-pressed=true]`, `[aria-selected=true]`, `[aria-checked=true]`, `[aria-expanded=true]`, `[aria-sort]`) rather than ad-hoc `.active`/`.open` classes.

## Detailed References

Load these references only as needed for the task at hand:

- **Full tokens, dual themes, dynamic accents, font stacks, z-index & shadows, Tailwind v4 mapping, onboarding wizard palette**: [references/tokens-and-themes.md](./references/tokens-and-themes.md)
- **Component recipes & geometry (shell, buttons, data tables + `fitColumns`, tree rows, custom sliders/selects/scrollbars, popovers, dialogs, stack toasts, terminal drawer, settings)**: [references/components-and-layout.md](./references/components-and-layout.md)
- **Motion physics, CPU/battery guards, CSS logical properties, RTL mirroring & bidi, CJK/Arabic typography, native WebView chrome**: [references/motion-i18n-rtl.md](./references/motion-i18n-rtl.md)
- **Automated UI invariant tests & CI gates (CSSOM type scale check, hand-cursor sweep, multi-language overflow check, OS parity)**: [references/verification-and-ci.md](./references/verification-and-ci.md)

## Workflow When Applying This Skill

1. **Start from the token layer**: Import or adapt [resources/kiri-tokens.css](./resources/kiri-tokens.css) first. Never invent one-off hex colors or font sizes in component styles.
2. **Build the shell & hierarchy**: Establish the 5-surface separation (`--bg` / `--side` / `--panel` / `--raised` / `--line`), sticky table headers (`top: -4px; z-index: 3`), fixed-width action columns, and ARIA-driven interactive states.
3. **Apply native ergonomics**: Set `user-select: none` on chrome, restore selection on copyable values, use zero-specificity `:where(...) { cursor: pointer; }`, style custom sliders/selects/scrollbars for cross-engine parity, and wire `body.away` animation pause.
4. **Verify before finishing**: Run the static CSS auditor on your stylesheet(s):
   ```bash
   node scripts/audit-ui.mjs path/to/styles.css
   ```
   Confirm zero font-size scale violations, high logical-property adoption, `prefers-reduced-motion` support, and GPU-only keyframes. For browser/WebView projects, add the runtime CSSOM/DOM invariants from [references/verification-and-ci.md](./references/verification-and-ci.md).

## Acknowledgments

Distilled with gratitude from [libracoder/kiri](https://github.com/libracoder/kiri) (Apache-2.0), whose hand-written stylesheet and automated UI invariant suite originated the surface ladder, typography discipline, motion guards, and multi-language resilience documented here.
