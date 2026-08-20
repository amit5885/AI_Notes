# Design

## Color

### Palette (OKLCH)

```css
:root {
  --bg: oklch(1.000 0.000 0);
  --surface: oklch(0.975 0.005 280);
  --ink: oklch(0.145 0.010 280);
  --primary: oklch(0.500 0.180 279);
  --primary-hover: oklch(0.450 0.180 279);
  --accent: oklch(0.600 0.120 175);
  --muted: oklch(0.550 0.010 280);
  --border: oklch(0.900 0.005 280);
  --error: oklch(0.550 0.200 25);
  --success: oklch(0.550 0.160 155);
}
```

### Strategy

Restrained. Violet primary on pure white. Accent carries secondary actions.

## Typography

- **Font**: Inter (system-ui fallback)
- **Scale**: Fixed rem, ratio 1.2
  - xs: 0.75rem (12px)
  - sm: 0.875rem (14px)
  - base: 1rem (16px)
  - lg: 1.125rem (18px)
  - xl: 1.25rem (20px)
  - 2xl: 1.5rem (24px)
  - 3xl: 1.875rem (30px)
  - 4xl: 2.25rem (36px)
- **Line height**: 1.5 (body), 1.2 (headings)
- **Line length**: 65ch max for prose
- **Weight**: 400 (body), 500 (medium), 600 (semibold headings), 700 (bold hero)

## Spacing

Tailwind default scale. Content max-width: 42rem (672px) for notes, 64rem for landing.

## Components

- **Buttons**: rounded-lg (8px), primary filled, secondary ghost
- **Input**: rounded-lg, 1px border, focus ring in primary
- **Cards**: none on landing (content-first), surface bg for note sections
- **Tags/pills**: rounded-full, surface bg, ink text

## Layout

- Landing: centered single column, generous whitespace
- Note: single column, max-width 42rem, clear section hierarchy
- No sidebar, no nav chrome — content is the interface
