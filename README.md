# Kiri UI Skill

An Agent Skill that distills the dense, native-feeling desktop and developer-tool UI design system of [`libracoder/kiri`](https://github.com/libracoder/kiri) into reusable rules, CSS tokens, component specifications, RTL/i18n safeguards, and an automated CSS invariant auditor.

Compatible with **Antigravity**, **Claude Code**, **Cursor**, **Codex**, **Windsurf**, and any AI coding assistant supporting the Agent Skills format.

---

## What's Inside

```text
skills/kiri-ui/
├── SKILL.md                           # Core principles, token quick-ref, layout rhythm, workflow
├── references/
│   ├── tokens-and-themes.md           # 5-tier dark/light surfaces, WCAG 4.5:1 semantic text hues,
│   │                                  # dynamic color-mix() accents, 4-size type scale, font stacks,
│   │                                  # z-index/shadow scales, Tailwind v4 adapter, setup wizard mode
│   ├── components-and-layout.md       # App shell, collapsible rail, data tables + fitColumns(),
│   │                                  # tree rows, custom sliders/selects/scrollbars, dialogs,
│   │                                  # animated stack toasts, split terminal drawer, topology map
│   ├── motion-i18n-rtl.md             # GPU-only motion, unified heartbeat, blur freeze, logical
│   │                                  # properties, RTL/bidi isolates, CJK/Arabic rules, native WebViews
│   └── verification-and-ci.md         # CSSOM type-scale lock, hand-cursor sweep, 38-lang overflow
│                                      # matrix, live theme sync, cross-OS parity gate
├── resources/
│   └── kiri-tokens.css                # Drop-in zero-framework CSS starter tokens & base primitives
└── scripts/
    └── audit-ui.mjs                   # Zero-dependency Node.js static CSS invariant auditor
```

---

## Installation

### Antigravity / Claude Code / Agent Skills CLI

```bash
# Project-level (recommended)
mkdir -p .agents/skills
git clone https://github.com/liduchuan/kiri-ui-skill.git /tmp/kiri-ui-skill
cp -r /tmp/kiri-ui-skill/skills/kiri-ui .agents/skills/

# Or for Claude Code (.claude/skills)
mkdir -p .claude/skills
cp -r /tmp/kiri-ui-skill/skills/kiri-ui .claude/skills/

# Or globally for Antigravity
mkdir -p ~/.gemini/config/skills
cp -r /tmp/kiri-ui-skill/skills/kiri-ui ~/.gemini/config/skills/
```

### Cursor

Copy `skills/kiri-ui/SKILL.md` into `.cursor/rules/kiri-ui.mdc` (or paste into **Settings → Rules**).

---

## Static CSS Audit Script

Validate any CSS or HTML file against Kiri UI's core static invariants (4-step font-size scale, logical properties, `prefers-reduced-motion`, GPU-only `@keyframes`, dual-theme light overrides):

```bash
node skills/kiri-ui/scripts/audit-ui.mjs path/to/styles.css
```

---

## Credits & License

- Design system analysis and distilled patterns inspired by [`libracoder/kiri`](https://github.com/libracoder/kiri) (Apache-2.0).
- This skill package is licensed under the [MIT License](./LICENSE).
