# Write on English – Devlog

> Repository: WoE-APP
> Brand: **Write on English**
> Mode: **Light theme default**

---

## 2025-08-25 — Label: `updated_toolbar_basic`

### Summary

* Integrated **superdesign** theme CSS and enabled tokens globally (light mode everywhere).
* Mapped Tailwind to brand tokens (colors, radii, shadows, fonts) so utilities like `bg-primary`, `border-border`, `shadow-brand` work.
* Resolved Tailwind `@apply` errors by defining `--primary-dark`, `--shadow-soft`, and `--shadow-brand` and extending Tailwind config.
* Added small UI primitives: **Button**, **Card**, **Input**, **Toolbar** (using lucide icons) that wrap superdesign classes.
* Added a demo route **`/sd-demo`** to visually verify theme + primitives + toolbar.
* Fixed CSS import paths to **`.superdesign/design_iterations/...`** and removed `dark` class from `<html>`.

### Changes

* **app/layout.tsx**

  * Import superdesign CSS from `.superdesign/design_iterations/`
  * Set `<html class="sd">` (namespace + light mode)
* **tailwind.config.js**

  * Extend `colors`, `boxShadow`, `borderRadius`, `fontFamily` to use CSS variables
  * Added `primary-dark`, `shadow-soft`, `shadow-brand`
* **components/ui/**

  * `Button.tsx` (wraps `.btn` + variant classes)
  * `Card.tsx` (wraps `.card`)
  * `Input.tsx` (wraps `.form-input`)
  * `Toolbar.tsx` (lucide-based toolbar demo)
* **app/sd-demo/page.tsx** (demo page)
* **.superdesign/design\_iterations/student\_workspace\_theme.css**

  * Added `--primary-dark`, `--shadow-soft`, `--shadow-brand`

### How to test

1. `pnpm dev -p 3000`
2. Visit `http://localhost:3000/workspace-editor`
3. Confirm:

   * Buttons use brand colors; hover states look right.
   * Toolbar renders with icons; range input uses accent color.
   * Canvas shell card shows light theme (white card, brand borders/shadows).

### Known issues / Next up

* **Namespace**: optional CSS namespacing (`.sd`) is in place via `<html class="sd">`. If collisions appear, we can re-introduce a scoped helper sheet or CSS Modules.
* **Workspace integration**: port `Toolbar` into `/workspace-editor` and connect to real canvas actions.
* **Theming toggle**: currently light-only. Optional `<ThemeToggle />` ready for later.
* **Purge/Minification**: consider trimming `.superdesign` CSS via PostCSS purge or Lightning CSS if bundle grows.

---

## 2025-08-24 — Excalidraw + Canvas groundwork

### Summary

* Brought Excalidraw fork/assets into the repo and began reworking **canvas** and **`/workspace-editor`** toward a **static canvas** approach to reduce hydration mismatch issues on tablets.
* Investigated SES/hydration errors and removed SSR pitfalls in client-only areas.

### Changes

* Scaffolded the new **Workspace Editor** page and client boundaries.
* Adjusted bundling/dev server and cleaned up local module resolution warnings.

### Notes

* Some hydration warnings observed previously from SSR + dynamic client combos.
* iPad/tablet support remains a focus; static canvas reduces reflow issues.

### Next steps from 8/24

* Finalize toolbar and integrate with canvas actions (select, pencil, text, eraser, highlighter).
* Hook brand tokens into any inline styles that still hardcode colors.
* Validate performance on student devices (Chromebooks/iPads).

---

## Tag & Release

* Annotated tag for this checkpoint: **`updated_toolbar_basic`**
* Suggested commit message: `chore(ui): integrate superdesign light theme + toolbar primitives and demo`

---

## Checklist (quick)

* [x] Imports fixed to `.superdesign/design_iterations/...`
* [x] Light theme only (no `<html class="dark">`)
* [x] Tailwind mappings for tokens
* [x] Demo page reachable
* [ ] Wire primitives into `/workspace-editor`
* [ ] Smoke test on tablet
