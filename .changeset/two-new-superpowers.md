---
"mattpocock-skills": minor
---

Add two new engineering skills:

- **`/superpower`** (user-invoked) — get grilled on a single, session-sized task and leave with a short confirmed plan (goal, steps, open risks) before writing any code. The lightweight sibling of `/grill-with-docs` → `/to-spec` for work that doesn't need a paper trail.
- **`/context7`** (model-invoked) — fetch current, version-accurate library documentation through the Context7 MCP tools (`resolve-library-id`, `get-library-docs`) instead of relying on stale training data, falling back to a direct docs fetch when those tools aren't available.

Both are wired into the top-level and `engineering/` READMEs, `.claude-plugin/plugin.json`, `ask-matt`, and have docs pages under `docs/engineering/`.
