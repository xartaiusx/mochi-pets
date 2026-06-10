# Upstream Policy

Mochi Social is not a forked copy of RPGJS. RPGJS is a dependency and a fetch-only upstream reference for source comparison.

Expected remotes:

```text
origin   https://github.com/xartaiusx/mochi-social.git
upstream https://github.com/RSamaium/RPG-JS.git
```

Expected upstream push behavior:

```text
upstream push URL = DISABLED
```

The `.githooks/pre-push` hook also blocks accidental pushes to the RPGJS upstream.

Use upstream only for reading, comparing, and intentionally updating RPGJS package usage.
