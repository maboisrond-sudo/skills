---
"mattpocock-skills": patch
---

Add `scripts/validate-skills.js` (`npm run validate`), which checks the structural invariants `CLAUDE.md` documents: every promoted skill (`engineering/`, `productivity/`) is listed, under the right User-invoked/Model-invoked group, in the top-level README, its bucket README, and `.claude-plugin/plugin.json`, and has a docs page with the required Quickstart/Source/sections; non-promoted skills are absent from all three; and every README link resolves. Wired into a new `pull_request` CI workflow (`.github/workflows/validate.yml`).

Fixed the pre-existing gaps it surfaced: `implement` was missing from `skills/engineering/README.md`, and `resolving-merge-conflicts` was missing from both READMEs and `plugin.json` entirely despite already having a docs page.
