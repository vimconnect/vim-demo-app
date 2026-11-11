# Demo App

## UI follows the Vim Design System

The look of every screen here comes from the Vim Design System: the `vim-design-system` plugin in `bookmd/vim-ai` (`Design System.html`, `tokens.css`). Read it before writing or reviewing UI here, and match its components and tokens instead of inventing new ones.

- **Tokens:** `src/app/globals.css` styles the app on DS tokens only: `shared/styles/design-tokens.css`, plus a short block of DS-only tokens at the top of `globals.css`. Use a token, never a literal colour, size, radius or shadow. Where the shared file and the DS disagree, the DS value wins.
- **Themes:** dark is `:root`, light is `body.light-mode` (set in `src/app/layout.tsx`). Check every change in both.
- **Components and classes:** `.claude/skills/ui-design-system/` maps the DS to this repo's components; the Console and side-panel maps there show the recipes to reuse.
- **A look the DS doesn't have yet** lands in `vim-ai` first. See "UI and the Vim Design System" in the root `CLAUDE.md`.
