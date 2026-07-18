# Emotion adapter (reader)

Lands from **M1**. This directory will hold the library-specific side of the
seam: `detect.js` (find Emotion style sites), `read.js` (style sites ->
neutral `declarations`), `rewriteSites.js` (binding map -> `stylex.props`
call sites), and `imports.js` (Emotion import/pragma cleanup).

Invariant: `src/core/` never imports from this directory. The seam is
enforced by `__tests__/seam-test.js`.
