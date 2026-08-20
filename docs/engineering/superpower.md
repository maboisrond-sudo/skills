Quickstart:

```bash
npx skills add mattpocock/skills --skill=superpower
```

```bash
npx skills update superpower
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/superpower)

## What it does

`superpower` gets you grilled on a single task and hands you back a short confirmed plan before you write any code. It does not persist anything — no `CONTEXT.md`, no issue tracker, no file left behind — it exists only for the length of the conversation it runs in.

## When to reach for it

You invoke this by typing `/superpower` — the agent won't reach for it on its own.

Reach for it right before you start coding on a single, session-sized task and want a fast think-first pass rather than a full pipeline. For work that spans sessions or needs a paper trail another agent can pick up, use [grill-with-docs](https://aihero.dev/skills-grill-with-docs) into [to-spec](https://aihero.dev/skills-to-spec) instead.

## The interview, then the plan

The defining shape is two beats, always in order: first `/grilling` walks the decision tree with you until you share one understanding of the task, then that understanding gets written down as a short plan — goal, steps, open risks — that you confirm before any code gets touched. Skipping straight to the plan without the interview defeats the point; the plan is only as good as what the grilling surfaced.

## It's working if

- You get asked real, one-at-a-time questions about the task before any plan appears.
- The plan that comes back is short — a goal, an ordered list of steps, and whatever's still genuinely uncertain — not a spec-sized document.
- Nothing gets written to disk or published anywhere; the plan lives in the conversation.

## Where it fits

A reach-for-it-anytime standalone — the lightweight sibling of the `grill-with-docs` → `to-spec` chain, for when that chain is more ceremony than the task deserves. For the whole map, see [ask-matt](https://aihero.dev/skills-ask-matt).
