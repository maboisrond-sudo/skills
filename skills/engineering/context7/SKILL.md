---
name: context7
description: Fetch current, version-accurate documentation for a library, framework, or API through the Context7 MCP tools instead of relying on training data that may be stale. Use when the user asks about a specific library's API or usage, when implementing against a fast-moving dependency, or whenever you're about to write code against a library and aren't confident your knowledge of its current API is fresh.
---

Training data goes stale; a library's docs don't. When you're about to write code against a library's API, go read it instead of guessing from memory.

## Process

1. **Resolve the library.** Call the Context7 `resolve-library-id` tool with the library's name to get its Context7-compatible ID. Skip this step if you already have an ID in `/org/project` form.

2. **Fetch the docs.** Call `get-library-docs` with that ID. Pass a `topic` when you know which part of the library you need (e.g. `"routing"`, `"hooks"`) to scope what comes back.

3. **Treat the result as a primary source.** Prefer it over what you remember, and note the version it reflects when the response states one — an answer that doesn't match the project's installed version is a reason to look further, not to fall back to memory.

4. **No Context7 tools available?** Say so, then fall back to fetching the library's official docs directly (`WebFetch`/`WebSearch`) rather than guessing from training data.
