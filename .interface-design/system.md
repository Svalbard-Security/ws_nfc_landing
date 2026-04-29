# Svalbard Security — Interface Design System

## Direction: Precision & Density

**Product**: NFC-triggered mobile phishing awareness experience.
**User**: SMB decision-makers who tap a card at an event or meeting. On mobile. Curious but skeptical.
**Intent**: Feel the weight of their exposure in 30 seconds. Cold like a terminal. Dense like a threat report.

---

## Palette

| Token | Value | Use |
|-------|-------|-----|
| Background | `#070809` | Page void |
| Surface | `#0d0f10` | Cards, inputs |
| Border | `#1a1d20` | Dividers, card outlines |
| Border active | `#2a2d31` | Secondary button borders |
| Green | `#22c55e` / `text-green-500` | Live indicator, primary CTA, PASS state |
| Red | `#ef4444` / `text-red-400` | CRITICAL severity, FAIL state, breach stats |
| Amber | `#f59e0b` / `text-amber-400` | HIGH severity, UNSURE state |
| Text primary | `#f0f0f0` | Headlines |
| Text body | `#e8eaed` | Body text |
| Text dim | `#6b7280` | Metadata, secondary info |
| Text faint | `#4b5563` | Prompt prefixes (`>`), section labels |

---

## Typography

- **Sans**: Outfit — headlines and prose questions only
- **Mono**: JetBrains Mono (`font-mono`) — ALL labels, numbers, buttons, codes, data values
- Section labels: `font-mono text-[10px] tracking-[0.2em] text-[#4b5563]` → format: `{"// SECTION_LABEL"}`
- Data keys: `font-mono text-[12px] text-[#9ca3af]`
- Data values: `font-mono text-sm font-bold text-[color]`
- Prose prompt: `font-mono text-[11px] text-[#4b5563]` → prefix with `&gt; `
- Buttons: `font-mono text-sm font-bold tracking-widest`

---

## Depth & Surfaces

No blur. No glassmorphism. Hard edges.

- **Cards**: `border border-[#1a1d20] bg-[#0d0f10]`
- **Danger card**: `border border-red-500/30 bg-red-500/5`
- **Inputs**: `border border-[#1a1d20] bg-[#0d0f10]` + `focus:border-green-500/60 focus:ring-1 focus:ring-green-500/20`
- **Dividers inside cards**: `border-b border-[#1a1d20]` with `px-3 py-2` header

---

## Severity Tags

```tsx
// CRITICAL: red
"border-red-500/50 bg-red-500/10 text-red-400"
// HIGH: amber
"border-amber-500/50 bg-amber-500/10 text-amber-400"
// LOW: green
"border-green-500/50 bg-green-500/10 text-green-400"

// Usage: <SevTag s={severity} />
// Style: rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-widest
```

---

## Buttons

- **Primary CTA**: `w-full bg-green-500 py-4 font-mono text-sm font-bold tracking-widest text-black transition active:brightness-90`
- **Secondary/ghost**: `w-full border border-[#2a2d31] py-3.5 font-mono text-xs font-bold tracking-widest text-[#6b7280]`
- **Answer YES**: `border border-green-500/40 bg-green-500/10 font-mono text-xs font-bold tracking-widest text-green-400`
- **Answer NO / danger**: `border border-red-500/40 bg-red-500/10 font-mono text-xs font-bold tracking-widest text-red-400`
- **Answer UNSURE**: `border border-amber-500/40 bg-amber-500/10 font-mono text-xs font-bold tracking-widest text-amber-400`
- No border-radius on buttons (sharp by default in Tailwind)

---

## Layout

- Root: `grid-bg relative flex h-dvh min-h-dvh w-full flex-col overflow-hidden text-[#e8eaed]`
- Scanlines overlay: `scanlines pointer-events-none absolute inset-0 z-20 opacity-30`
- Padding: `px-4` sides, `py-4` top/bottom content
- Header: `flex shrink-0 items-center justify-between border-b border-[#1a1d20] py-3`
- Step container: `key={step}` triggers `step-enter` animation on transition

---

## CSS Classes (globals.css)

```css
.grid-bg           /* dot matrix background: 24px grid, rgba white dots at 2.8% */
.scanlines         /* horizontal scan lines: 4px pattern, 1.2% white opacity */
.step-enter        /* fade + translateY(5px) → 0 in 0.16s ease-out */
```

---

## Information Architecture

Each screen follows the pattern:
1. Section label: `{"// SECTION_NAME"}` in dim mono
2. Primary content (headline or data table)
3. Supporting context or stats
4. Terminal-style prompt lines: `&gt; prose text`
5. Primary CTA pinned to bottom (green button)

Data tables: `border border-[#1a1d20] bg-[#0d0f10]` with `border-b border-[#1a1d20] px-3 py-2.5` rows.
Left-border callout: `border-l-2 border-red-500/50 pl-3` for alarming statistics.

---

## Scoring Logic

- `maturity = answers.sum()` (each Tri: 0=No, 1=Unsure, 2=Yes)
- `riskScore = round((1 - maturity/6) * 100)` → 0–100
- `overallSeverity`: ≥70 CRITICAL, ≥40 HIGH, else LOW
- `breachProb = min(95, round(40 + (riskScore/100) * 40))`
- Vector breakdown: `answers[0]`→Identity, `answers[1]+wouldClick`→Awareness, `answers[2]`→Detection
