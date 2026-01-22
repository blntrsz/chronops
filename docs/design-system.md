# Chronops design system

Goal: trustworthy compliance (GRC) + modern AI energy. Default theme: dark.

## Principles

- Calm surfaces, low noise, high contrast
- Brand accents only for CTAs + state
- Prefer semantic tokens (`bg-card`, `text-muted-foreground`) over raw `slate-*`
- "AI" vibe via subtle gradients + glow, not neon everywhere

## Tokens

Source of truth: `packages/web/src/styles.css`.

### Brand

- `--brand-1`, `--brand-2`: cyan → indigo
- `--gradient-brand`: primary gradient

Tailwind colors (via `@theme`):

- `bg-brand`, `text-brand`, `bg-brand-1`, `bg-brand-2`

### Surfaces

- `--background`, `--card`, `--popover`
- `--border`, `--input`, `--ring`

Tailwind usage:

- `bg-background`, `bg-card`, `bg-popover`
- `border-border`, `ring-ring`, `text-foreground`

### Status

- Success: `--success`
- Warning: `--warning`
- Info: `--info`
- Error: `--destructive`

Tailwind usage:

- `bg-success text-success-foreground`
- `bg-warning text-warning-foreground`
- `bg-info text-info-foreground`
- `bg-destructive text-destructive-foreground`

## Typography

- Base font is system sans (`--font-sans`)
- Keep headings tight; body text relaxed

Recommended Tailwind patterns:

- Page title: `text-2xl font-semibold tracking-tight`
- Section title: `text-lg font-medium`
- Body: `text-sm text-muted-foreground` (or `text-foreground` for critical)

## Layout

- App background: `ds-app-bg`
- Top bar: `ds-topbar`
- Card/panel: `ds-panel`
- Glass overlay: `ds-glass`

Example:

```tsx
<div className="ds-app-bg">
  <header className="ds-topbar">...</header>
  <main className="mx-auto max-w-6xl p-6">
    <section className="ds-panel p-6">...</section>
  </main>
</div>
```

## Buttons

- Default = primary (solid brand)
- Use gradient only for "hero" CTA

Patterns:

- Standard CTA: `<Button>Save</Button>`
- Secondary: `<Button variant="secondary">Cancel</Button>`
- Destructive: `<Button variant="destructive">Delete</Button>`
- Hero gradient: `className="ds-gradient-brand text-white"`

## Data-heavy UI (GRC)

- Prefer dense, readable tables: clear row separators, muted headers
- Use `text-muted-foreground` for metadata (IDs, timestamps)
- Use status colors only as small badges / dots

## Motion

- Keep motion subtle (trust): 150–250ms transitions
- Use glow/gradient on hover for emphasis, not on load

## Accessibility

- Always keep contrast > 4.5:1 for text
- Focus ring uses `--ring` (Tailwind: `focus-visible:ring-ring`)
- Don’t rely on color alone for status (add icon/label)
