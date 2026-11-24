#!/usr/bin/env node
/**
 * Kiri UI Static CSS Auditor (zero dependencies)
 *
 * Audits one or more CSS or HTML files against core Kiri UI invariants:
 *   1. Font-size scale discipline (no hardcoded px font sizes outside :root)
 *   2. CSS logical properties vs physical left/right properties
 *   3. Reduced-motion media query coverage when motion is declared
 *   4. GPU-composited @keyframes discipline (transform/opacity preferred)
 *   5. Dual-theme light override completeness (media query + [data-theme="light"])
 *
 * Usage:
 *   node audit-ui.mjs <file1.css|file1.html> [file2 ...]
 */

import fs from "node:fs";
import path from "node:path";

const files = process.argv.slice(2);
if (!files.length) {
  console.error("Usage: node audit-ui.mjs <file.css|file.html> [...]");
  process.exit(2);
}

const GLYPH_ALLOW = [
  /\.xterm/,
  /\.close\b/,
  /\.chev\b/,
  /\.sh-chev\b/,
  /\.arr\b/,
  /\.sh-x\b/,
  /\.sc-close\b/,
];

const NON_COMPOSITED = new Set([
  "box-shadow",
  "width",
  "height",
  "top",
  "left",
  "right",
  "bottom",
  "margin",
  "margin-top",
  "margin-left",
  "padding",
  "background-position",
  "border-width",
]);

function extractCss(filePath, raw) {
  if (filePath.endsWith(".css")) return raw;
  const blocks = [];
  const re = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = re.exec(raw))) blocks.push(m[1]);
  return blocks.join("\n");
}

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function auditFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const css = stripComments(extractCss(filePath, raw));
  const fails = [];
  const warns = [];
  const passes = [];

  if (!css.trim()) {
    warns.push("No CSS rules found.");
    return { fails, warns, passes };
  }

  // 1. Font-size scale check (outside :root)
  const badFontSizes = [];
  const ruleRe = /([^{}@]+)\{([^{}]+)\}/g;
  let m;
  while ((m = ruleRe.exec(css))) {
    const sel = m[1].trim();
    const body = m[2];
    if (!sel || sel.startsWith(":root") || sel.startsWith("from") || sel.startsWith("to") || /^\d+%/.test(sel)) continue;
    if (GLYPH_ALLOW.some((rx) => rx.test(sel))) continue;
    const fsRe = /(?:^|;)\s*font-size\s*:\s*([^;]+)/gi;
    let fm;
    while ((fm = fsRe.exec(body))) {
      const val = fm[1].trim();
      if (/\d(?:\.\d+)?px\b/.test(val) && !val.includes("var(--")) {
        badFontSizes.push(`${sel} -> font-size: ${val}`);
      }
    }
  }
  if (badFontSizes.length) {
    fails.push(`Font-size outside token scale (${badFontSizes.length}): ${badFontSizes.slice(0, 6).join("; ")}${badFontSizes.length > 6 ? " ..." : ""}`);
  } else {
    passes.push("All font-size declarations use CSS custom property tokens (no rogue px values).");
  }

  // 2. Logical vs physical properties
  const logicalCount = (css.match(/\b(?:margin|padding|border|inset)-(?:inline|block)/g) || []).length;
  const physicalMatches = css.match(/\b(?:margin|padding|border)-(?:left|right)\s*:/g) || [];
  const physicalCount = physicalMatches.length;
  if (physicalCount > 0 && logicalCount === 0) {
    warns.push(`Uses ${physicalCount} physical left/right spacing/border properties and 0 logical (inline/block) properties — RTL will not mirror automatically.`);
  } else if (physicalCount > 0) {
    passes.push(`Logical properties: ${logicalCount} inline/block vs ${physicalCount} physical left/right.`);
  } else {
    passes.push(`Logical properties: ${logicalCount} inline/block, 0 physical left/right.`);
  }

  // 3. Reduced motion guard
  const hasMotion = /\b(?:animation|transition)\s*:/.test(css);
  const hasReducedMotion = /@media\s*\([^)]*prefers-reduced-motion\s*:\s*reduce[^)]*\)/.test(css);
  if (hasMotion && !hasReducedMotion) {
    fails.push("Declares animation/transition without @media (prefers-reduced-motion: reduce).");
  } else if (hasMotion) {
    passes.push("Includes @media (prefers-reduced-motion: reduce) safeguard.");
  }

  // 4. GPU-only keyframes
  const badKeyframes = [];
  const kfRe = /@keyframes\s+([a-z0-9_-]+)\s*\{((?:[^{}]*|\{[^{}]*\})*)\}/gi;
  while ((m = kfRe.exec(css))) {
    const name = m[1];
    const body = m[2];
    for (const prop of NON_COMPOSITED) {
      if (new RegExp(`(?:^|[;{]\\s*)${prop}\\s*:`, "i").test(body)) {
        badKeyframes.push(`@keyframes ${name} animates ${prop}`);
      }
    }
  }
  if (badKeyframes.length) {
    warns.push(`Non-composited keyframe properties (${badKeyframes.length}): ${badKeyframes.slice(0, 5).join("; ")}`);
  } else if (/@keyframes\s+/.test(css)) {
    passes.push("All @keyframes stick to GPU-composited properties (transform/opacity).");
  }

  // 5. Dual-theme light override completeness
  const hasPrefersLight = /@media\s*\([^)]*prefers-color-scheme\s*:\s*light[^)]*\)/.test(css);
  const hasAttrLight = /\[data-theme\s*=\s*["']?light["']?\]/.test(css);
  if (hasPrefersLight && !hasAttrLight) {
    warns.push("Defines prefers-color-scheme: light without an explicit [data-theme=\"light\"] override (can break manual theme switching on WebKitGTK).");
  } else if (hasPrefersLight && hasAttrLight) {
    passes.push("Supports both prefers-color-scheme: light and explicit [data-theme=\"light\"] overrides.");
  }

  return { fails, warns, passes };
}

let exitCode = 0;
for (const f of files) {
  const resolved = path.resolve(f);
  const { fails, warns, passes } = auditFile(resolved);
  console.log(`\n=== Kiri UI Audit: ${f} ===`);
  for (const p of passes) console.log(`  PASS  ${p}`);
  for (const w of warns) console.log(`  WARN  ${w}`);
  for (const e of fails) {
    console.log(`  FAIL  ${e}`);
    exitCode = 1;
  }
}

process.exit(exitCode);
