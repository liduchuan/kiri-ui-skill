# Component Specifications & Layout Geometry

Structural rules, state transitions, and layout invariants for every major UI pattern in Kiri.

## 1. Desktop App Shell

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ .strip (44px, --side, border-bottom: --line)                            │
│ [lights 74px] [rail-btn] [back][fwd] [   drag spacer   ] [search ⌘K][⚙] │
├──────────────┬──────────────────────────────────────────────────────────┤
│ aside        │ main (flex column, min-width: 0, min-height: 0)          │
│ (212px /     │ ┌──────────────────────────────────────────────────────┐ │
│  60px rail,  │ │ .toolbar (62px, pad-inline: 20px 26px)               │ │
│  --side)     │ │ [h2 18px] [spacer] [filter pills] | [quiet] [primary]│ │
│              │ ├──────────────────────────────────────────────────────┤ │
│ .navlabel    │ │ .content (flex: 1, overflow-y: auto, overflow-x:hid) │ │
│ nav buttons  │ │ [table / detail / settings / map / builds]           │ │
│              │ ├──────────────────────────────────────────────────────┤ │
│ [.vm card    │ │ .htdrawer (optional docked terminal, resizable top)  │ │
│  at bottom]  │ └──────────────────────────────────────────────────────┘ │
├──────────────┴──────────────────────────────────────────────────────────┤
│ .statusbar (24px, --side, border-top: --line, 11px)                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### Top Strip (`.strip`)
- Spans `grid-column: 1 / -1`, height `44px`, background `var(--side)`.
- Reserves `.lights { width: 74px; flex: none; }` on macOS for native traffic lights (`display: none` on Windows/Linux).
- `.drag { flex: 1; align-self: stretch; min-width: 24px; }` acts as the draggable window region.
- Strip buttons (`.sb`): `28×28px`, `border-radius: 6px`, transparent until hover (`color-mix(in srgb, var(--text) 8%, transparent)`), `disabled` at `opacity: .3`.
- Global search (`.gfind`): `280px × 28px`, expands smoothly on `:focus-within` to `400px` (`transition: ..., width .2s ease`), hides its `⌘K` `<kbd>` pill on focus (`opacity: 0`). At `<= 900px`: `200px` → `300px`.

### Collapsible Sidebar (`aside` & `body.rail`)
- Default `212px`, `padding: 8px 12px 14px`, `gap: 2px`, `border-inline-end: 1px solid var(--line)`.
- Group headers (`.navlabel`): `12px`, `font-weight: 600`, `color: var(--faint)`, `text-transform: uppercase`, `letter-spacing: .06em`, `padding: 10px 8px 4px`.
- Nav buttons: `height: 31px`, `padding: 0 8px`, `gap: 9px`, `border-radius: 7px`, `17px` icons.
  - Active page (`[aria-current="page"]`): `background: var(--raised); color: var(--text); box-shadow: inset 0 0 0 1px var(--line);` with icon colored `var(--blue)`.
  - Counts (`.count`): `margin-inline-start: auto; color: var(--faint); font-variant-numeric: tabular-nums;`.
- **Folded Rail (`body.rail`)**: width `60px` (`--rail`), `.navlabel` collapses into a `1px` horizontal divider (`border-top: 1px solid var(--line)`), labels/counts/beta tags hide, buttons center their icon, and the bottom VM card collapses into a centered status dot that pulses on `--beat`.

### Bottom Engine Card (`.vm`)
- Anchored with `margin-top: auto`, `background: var(--panel)`, `border: 1px solid var(--line)`, `border-radius: 12px`, `padding: 12px`, `gap: 10px`.
- **Overflow-proof wrapping**: `.vm-head` uses `flex-wrap: wrap` with `.vm-id { display: flex; align-items: baseline; gap: 7px; min-width: 0; }` so long translations wrap the status word cleanly onto a second right-aligned line while keeping the status dot on line 1.
- Metrics `<dl>` uses `grid-template-columns: auto auto; justify-content: space-between;`, `tabular-nums`, and non-breaking spaces (`\u00a0`) between numbers and units (`812\u00a0MB /\u00a08\u00a0GB`) so readings wrap only before `/` and never split a number from its unit.
- Memory meter: `height: 4px; border-radius: 99px; background: var(--line);` with inner `var(--blue)` bar transitioning `width .4s`.

## 2. Toolbar, Filter Pills & Bulk Selection

- **Filter pills (`.ltabs`)**: Pill-shaped (`border-radius: 99px`, `height: 28px`, `padding: 0 11px`), containing an optional `7px` status dot, label, and `tabular-nums` count. Selected pill (`[aria-pressed="true"]`) gets `16%` blue wash + `50%` blue border.
- **Visual separator**: `.ltabs:not([hidden]) + .hright:not(:empty)::before` inserts a `1px × 18px` vertical rule automatically between filter pills and right-side action buttons.
- **Quiet cleanup button (`.btn.quiet`)**: Borderless & backgroundless until hover, paired with a `14px` semantic cue icon (`var(--red-text)`).
- **In-progress indicator rule**: Work in progress (`.hbusy` with `.hspin`) sits **beside** toolbar buttons, never replacing or resizing a toolbar button.
- **Bulk pick mode (`body.picking`)**: Replaces `.ltabs` with `.bulk` pill bar (`14%` blue tint + count + clear `×` + bulk actions) using a 140ms slide-in (`ppin`).
- **Narrow window (`<= 900px`)**: Primary toolbar button hides its text label (`.hright .btn.primary .hlbl { display: none; }`) and keeps its icon + `title` tooltip.

## 3. Data Tables, Column Resizing & Row Actions

### Visual Anatomy
- `table { width: 100%; border-collapse: separate; border-spacing: 0; }`
- Sticky headers: `th` uses `11px`, `600`, uppercase, `letter-spacing: .05em`, `color: var(--faint)`, `background: var(--bg)`, `border-bottom: 1px solid var(--line)`, `position: sticky; top: -4px; z-index: 3;` (flush over `.content`'s `4px` top padding).
- Sortable headers (`th.sortable`): hover or `[aria-sort]` lifts color to `var(--text)` and renders a `10px` `var(--blue)` arrow.
- Resize grips (`th .col-resize`): `8px` hit target on `inset-inline-end: 0` with a centered `1px × 50%` hairline that brightens from `--line` to `--faint` on hover.

### `fitColumns()` Proportional Layout Rule
1. Checkbox column (`th.ck`, `34px`) and right-most `Actions` column keep exact pixel widths.
2. `Actions` width is measured dynamically from the widest row's buttons (never from a stale saved width), so row actions **never clip or overflow** even in verbose languages (e.g., German).
3. Remaining room is distributed by saved user shares or `data-share` weights with a floor of `COL_MIN = 110px`. Shortfalls are borrowed proportionally from wider columns; rounding remainders go to the widest column so total width equals container width exactly.
4. `table.sized` switches to `table-layout: fixed` with `overflow: hidden; text-overflow: ellipsis;` on all non-action cells.

### Row Actions & No-Jitter State
- Actions live in their own column (`td.actions { width: 1%; white-space: nowrap; }`) — always visible, never overlapping text.
- `.acts-row` applies a `24px` directional fade (`linear-gradient(var(--fwd), transparent, var(--bg) 24px)`) that adapts to `--row-hover` on hover and `14%–18%` blue tint on selected rows (`tr.row.chosen`).
- **Icon action buttons (`.btn.ic`)**: `30×32px` (or `30×26px` with `.sm`), `15px` icons. Colored semantic icons (`.go` moss, `.halt`/`.danger` red, `.hold` sun) retain their hue on hover with a subtle tinted border (`30%`), `6%` wash, and `0 0 6px` `15%` glow.
- **Loading state (`.rolling`)**: Strips button border/background/shadow and replaces the icon with a centered `13px` yellow spinner ring (`::after`) — preserving exact `30px` button footprint so the row never shifts.
- **Disabled placeholder (`.btn.ghost:disabled`)**: Renders at `opacity: .22` instead of disappearing, keeping column alignment stable.

### Multi-Select & Keyboard Cursor
- Checkboxes (`.cb`): `16×16px`, `border-radius: 4px`, `1.5px solid var(--faint)`, `background: var(--panel)` inside a `24×30px` hit target (`.ckbox`). Checked/indeterminate fills `var(--blue)`.
- Picked row (`tr.row.chosen`): `14%` blue wash across cells (`18%` on hover) + `inset 2px 0 0 var(--blue)` edge bar on `td.ck`.
- Keyboard focus row (`tr.row.cur`): `2px` inset blue outline drawn via `box-shadow` inside the row's cells (`border-radius: 6px` on outer corners) with `scroll-margin: 34px 0 4px` to clear sticky `th`.

### Tree Hierarchy (Grouped / Compose Rows)
- Parent group row (`tr.group`): `color-mix(in srgb, var(--raised) 55%, transparent)` tint + keyboard-focusable fold chevron button + `30px` icon tile.
- Child member rows (`tr.member`): `16px` `.tree` connector using `::before` (vertical `1px` line, `bottom: 50%` on `.last`) and `::after` (`8px` horizontal branch) + **scaled-down `24px` icon tile** (`border-radius: 6px`, `14px` SVG) to visually reinforce hierarchy.

## 4. Custom Cross-Platform Controls

Because macOS WebKit, WebView2 (Chromium), and WebKitGTK render native form widgets inconsistently, Kiri draws its own:

1. **Range Slider (`.range input`)**: `height: 9px`, `border-radius: 999px`, `background: linear-gradient(var(--fwd), var(--blue) var(--fill, 0%), var(--line) var(--fill, 0%))`, white pill thumb `26×18px` with `0 1px 3px rgba(0,0,0,.35)`.
2. **Custom Select (`.ssb` + `.sspop`)**: Hidden native `<select>` for form/a11y compatibility, paired with a `32px` trigger button (`.ssb`, `border-radius: 7px`) and a fixed portal menu (`.sspop`, `z-index: 1000`, `border-radius: 8px`, `padding: 4px`, `26px` rows with checkmark icon and optional search bar `.lfind`). Width stabilization uses an invisible `.ssz` sizing ghost in `grid-area: 1 / 1`.
3. **Segmented Control (`.seg`)**: Inline-flex container with `1px solid var(--line)`, `border-radius: 7px`, `overflow: hidden`; `30px` buttons separated by `border-inline-start: 1px solid var(--line)`; active `[aria-pressed="true"]` fills `var(--blue)` with `#fff` text.
4. **Quiet Scrollbars**: `7px` width/height, transparent track, `45%` muted thumb (`70%` on hover). Deliberately omits `scrollbar-width` so WebKit honors the custom pixel sizing.

## 5. Popovers, Dialogs, Alerts & Toasts

- **Fixed-height Search Popover (`.pp`)**: `500px × min(560px, calc(100vh - 140px))` with top caret arrow (`::before` rotated `45deg`), `46px` search header, scrollable body, and `36px` keyboard-shortcut footer (`kbd.key`). Keeping height constant prevents the popover from jumping under the pointer as async results stream in.
- **Dialogs (`.scrim` + `.dialog`)**: `background: rgba(0,0,0,.45)`, centered grid, `width: min(460px, calc(100% - 32px))`, `background: var(--panel)`, `border: 1px solid var(--line)`, `border-radius: 12px`, `padding: 20px`, `gap: 14px`.
- **Typed Alerts (`.dialog.alert`)**: 2-column grid `28px minmax(0, 1fr)` with a `28px` tinted icon on the left (`--ink`: blue info, moss ok, sun warn, red error/remove) aligned to line 1 of `h3`, body copy and footer buttons cleanly aligned in column 2.
- **Anchored Contextual Popover (`.need`)**: `360px` wide, flips `.above`/`.below` with `--ax` arrow offset, includes password strength meter (4 × `18×4px` rounded bars), `:has(> input:checked)` radio option cards, and disclosure expander.
- **Storytelling Toasts (`.toasts`)**: Fixed `inset-inline-end: 18px; bottom: 18px; z-index: 9;`, `320–340px` wide (`420–440px` for error/OOM detail toasts). Features a `46×40px` container-stack micro-illustration (`.yard`) with physical motion (`settle`, `jolt`, `lower`/`land`, `hoist`, `relight`), a `2px` bottom countdown progress bar (`.life`) that **pauses on `:hover`**, and a top-end close button (`.tclose`).
- **Inline Copy Feedback (`.copied-tip`)**: Fixed `z-index: 1000` emerald pill (`#0F2A1F` bg, `#B9F0D2` text, `55%` moss border, downward caret) rising `4px` on appear and fading out cleanly.

## 6. Detail Views, Settings & Built-In Terminal Drawer

- **Detail Page Header (`.dhead`)**: `40px` icon tile + title + status pill + right-aligned actions; `.dfacts` metadata strip indented `margin-inline-start: 52px` to align directly under the title text, with `11px` uppercase faint `<dt>` labels.
- **Underline Sub-Tabs (`.dtabs`)**: `border-bottom: 1px solid var(--line)`, `padding: 8px 12px`, `2px` bottom indicator colored `var(--blue)` on `[aria-current="true"]`, right-aligned contextual actions (`.dacts`).
- **Two-Column Settings (`.settings`)**: `grid-template-columns: 180px 1fr; gap: 28px; max-width: 860px;`. Every preference row (`.pref`) uses `grid-template-columns: minmax(0, 1fr) auto; gap: 4px 20px; padding-bottom: 18px; border-bottom: 1px solid var(--line);` where the control spans both title and description rows (`grid-row: 1 / span 2; grid-column: 2;`) so long translated descriptions wrap cleanly without pushing controls out.
- **In-Place Editable Key-Value Grid (`.env-ed`)**: Uses CSS `subgrid` (`grid-template-columns: minmax(120px, 210px) 1fr minmax(40px, max-content)`) so action buttons (`×` or translated `Undo`) stay vertically aligned across every row.
- **Docked Split Terminal Drawer (`.htdrawer`)**: Resizable via `6px` top grip (`.htgrip`), lifted visually with an upward shadow + lighter `16%` top edge + `32px` header (`.hthead`). Supports split panes (`.htsplit.h`/`.v`) with `4px` dividers (`.htdiv`, expanded hit area via `inset: -3px`, highlighted `var(--blue)` on hover/drag), dimmed unfocused panes (`opacity: .62`), and pane zoom mode (`.htbody.zoomed`).
- **Interactive Topology Map (`.map`)**: `18×18px` subtle dot-grid background (`radial-gradient` at `6%` `--text`), pan/zoom viewport (`cursor: grab`/`grabbing`), `84px`-tall service cards with status pills, left accent bar (`inset 3px 0 0`), and semantic diff states (`.add` moss, `.chg` blue, `.rm` dashed red at `opacity: .55`).
