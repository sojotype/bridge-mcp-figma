# Design system tokens (CSS variables)

Canonical reference for plugin UI tokens. Prefer these when choosing CSS variables. Source: `packages/plugin/frontend/globals.css` (`@theme`, `@layer theme`).

## Colors

Scales (steps 1–12): `gray`, `grayA`, `ruby`, `rubyA`, `blue`, `blueA`, `jade`, `jadeA`, `orange`, `orangeA`.  
CSS: `--color-<scale>-<1..12>`. Light/dark: `.figma-dark` in globals.css.

## Typography

`text-title`, `text-body`, `text-caption`, `text-label` — each: `--text-<name>`, `--text-<name>--line-height`, `--text-<name>--font-weight`. Font: `--font-sans`.

## Other

Spacing, radius, shadows: to be added in same style when present in globals.css.
