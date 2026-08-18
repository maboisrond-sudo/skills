Quickstart:

```bash
npx skills add mattpocock/skills --skill=find-skills
```

```bash
npx skills update find-skills
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/productivity/find-skills)

## What it does

`find-skills` searches the external [skills.sh](https://skills.sh/) ecosystem for a third-party skill when you want a capability this repo doesn't already have. It never installs anything on its own — it surfaces the candidate, the evidence for trusting it (install count, source reputation, GitHub stars), and the exact install command for you to review and run yourself.

## When to reach for it

Type `/find-skills`, or the agent reaches for it automatically — but only on an explicit, narrow ask ("find a skill for X", "is there a skill that does X"), not on ordinary requests for help that happen to phrase as "how do I do X". For anything this repo's own skills might already cover, check [ask-matt](https://aihero.dev/skills-ask-matt) first instead of reaching outside.

## Trust, then install

The skill's job stops at evidence and a command, not execution. It checks install count, source reputation, and GitHub stars before recommending anything, then hands you `npx skills add <owner/repo@skill>` to run — no silent `-y`, and no `-g` (global) unless you asked for a global install. Global changes what's available across every project on the machine, so that flag is opt-in, never a default.

## Where it fits

A **reach-for-it-anytime standalone**, off the main build chain — it's a bridge to the wider skills ecosystem, not a step in it. Its neighbour is [ask-matt](https://aihero.dev/skills-ask-matt), which routes across this repo's own skills first; reach for `find-skills` only once that map comes up short.
