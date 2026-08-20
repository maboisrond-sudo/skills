Quickstart:

```bash
npx skills add mattpocock/skills --skill=context7
```

```bash
npx skills update context7
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/context7)

## What it does

`context7` fetches a library's current documentation through the Context7 MCP tools rather than answering from training data. It treats what comes back as a primary source — version and all — and only falls back to a web search when those tools aren't available in the environment.

## When to reach for it

Type `/context7`, or the agent reaches for it automatically whenever it's about to write code against a library's API and isn't confident its knowledge of that API is current.

Reach for it when you need a specific library's real, current API — not a general web question. For broader investigation that ends in a cited write-up saved to the repo, use [research](https://aihero.dev/skills-research) instead.

## Prerequisites

Needs the Context7 MCP server's tools (`resolve-library-id`, `get-library-docs`) available in the environment. Without them, the skill says so and falls back to fetching official docs directly.

## Resolve, then fetch

Two calls, always in order: `resolve-library-id` turns a library's name into a Context7-compatible ID, then `get-library-docs` fetches the actual pages for that ID, scoped with a `topic` when you know which part of the library you need. Skipping the resolve step only works if you already have the ID in hand.

## Where it fits

A reach-for-it-anytime standalone that `/tdd` and `/implement` pull in whenever the code they're writing depends on a library's current API. For the whole map, see [ask-matt](https://aihero.dev/skills-ask-matt).
