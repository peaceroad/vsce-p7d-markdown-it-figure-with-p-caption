# AGENTS.md

## Purpose

This repository is a VS Code markdown extension that:

- registers a markdown-it plugin (`main: ./dist/extension.js`)
- injects preview scripts (`./dist/js/set-img-attribute.js`, `./dist/js/set-img-figure-caption.js`)

`dist/` is runtime output. `src/` is source of truth.

## Source Layout

- `src/extension.js`: extension runtime source
- `src/preview/set-img-attribute.js`: preview script entry (image attributes)
- `src/preview/set-img-figure-caption.js`: preview script entry (figure caption sync)
- `src/preview/resize-dimension-stability.js`: resize live-edit dimension stabilization helper
- `src/preview/resize-hint-cleanup.js`: stale resize hint cleanup helper
- `src/preview/frontmatter-meta.js`: shared frontmatter meta reader/cache
- `src/core/extension-host-utils.js`: extension-side frontmatter/parser/path utilities
- `build.js`: bundles source to `dist/`
- `dist/`: build artifacts consumed by VS Code/package

Do not hand-edit `dist/*` unless debugging generated output.

## Build and Validation Workflow

1. Edit source files under `src/` (and related config/docs as needed).
2. Run preview smoke tests:
   - `npm run test:preview-scripts`
3. Build extension artifacts:
   - `npm run build`
4. Confirm `package.json` references still point to `dist/*`:
   - `main: ./dist/extension.js`
   - `contributes.markdown.previewScripts: ./dist/js/...`
5. Package if needed:
   - `vsce package`
   - `vscode:prepublish` already runs `npm run build`.

## Preview Script Contract

- Preview scripts run in the markdown preview DOM, not in Node extension host.
- They rely on `<meta name="markdown-frontmatter" ...>` injected by `src/extension.js`.
- Runtime settings needed by preview scripts should be passed via `_extensionSettings` in that meta.
  - Example: `disableStyle` is sent from `src/extension.js` and consumed by `src/preview/set-img-attribute.js`.
- `src/preview/set-img-attribute.js` keeps `enableSizeProbe: true` by design.
  - Disabling it breaks live `resize:` behavior in preview.
  - It also enables `keepPreviousDimensionsDuringResizeEdit: true` and
    `onResizeHintEditingStateChange` from `@peaceroad/markdown-it-renderer-image` to reduce
    live-edit jumps.
  - To reduce preview glitches, `onImageProcessed` applies `height:auto` and `maxWidth:100%`
    only when those inline styles are not already set.
- `src/preview/resize-hint-cleanup.js` cleans stale resize hint attributes during live edits.
- `src/preview/resize-dimension-stability.js` keeps previous dimensions during transient invalid
  resize input and falls back after a short delay (current internal hold/fallback timing: 600ms).
- Keep scripts defensive:
  - tolerate missing meta
  - avoid throwing on malformed content
  - avoid repeated event handlers (`DOMContentLoaded` with `{ once: true }`).

## Testing Notes

- `test/smoke-preview-attribute.mjs`
- `test/smoke-preview-resize-hint-cleanup.mjs`
- `test/smoke-preview-resize-dimension-stability.mjs`
- `test/smoke-preview-figure-caption.mjs`
- `test/smoke-preview-frontmatter-priority.mjs`
- `test/smoke-disable-style.mjs`
- `test/smoke-renderer-fence-em-lines.mjs`
- `test/smoke-extension-host-utils.mjs`
- `test/helpers/fake-dom.mjs`

These are lightweight smoke tests for preview entry behavior and should stay fast.
When changing preview script initialization logic, update these tests first.

## Safety Rules for Changes

- Preserve backward-compatible config keys unless intentionally deprecated.
- Keep extension behavior stable for existing markdown files.
- Prefer small, reviewable diffs.
- If updating bundled dependency behavior, rerun:
  - `npm run test:preview-scripts`
  - `npm run build`

## General VS Code Markdown Extension Notes

These points are useful when building other VS Code extensions that extend markdown:

- Understand execution boundaries:
  - `markdown.markdownItPlugins` runs in extension host (Node context).
  - `markdown.previewScripts` runs in preview webview (browser-like DOM context).
  - Bridge data explicitly (for example via injected meta), do not assume shared memory.
- Keep package paths production-safe:
  - `package.json` should reference build artifacts (`dist/*`), not source files.
  - Use `vscode:prepublish` to enforce build before `vsce package`.
- Prefer non-destructive styling control:
  - avoid writing into extension installation files at runtime.
  - toggle style behavior in preview DOM or by rendering logic instead.
- Be selective about reload strategy:
  - heavy markdown-it option changes may require `workbench.action.reloadWindow`.
  - preview-only changes should prefer `markdown.preview.refresh`.
- Escape injected HTML attribute payloads:
  - when embedding JSON in HTML attributes, escape at least `&`, `"`, `<`, `>`.
- Design for coexistence with other markdown extensions:
  - avoid assuming plugin order.
  - make transformations idempotent when possible.
  - guard against already-processed nodes/tokens.
- Keep preview observers lightweight:
  - observe minimal attribute sets.
  - debounce or schedule expensive reprocessing.
  - keep `childList` observation when live preview tends to replace image nodes; relying only on
    `attributes` can reintroduce resize flicker on node replacement.
- Test in layers:
  - fast smoke tests for preview entry behavior.
  - build validation for packaging integrity.
  - optional manual check in actual VS Code preview for end-to-end behavior.
