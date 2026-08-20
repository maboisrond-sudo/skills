---
name: superpower
description: Think through the task in front of you, get grilled on it, and leave with a short confirmed plan before writing any code — a quick pre-coding gut check for a single task, not a multi-session spec.
disable-model-invocation: true
---

Before you touch the code, know what you're building and why.

## Process

1. Run the `/grilling` skill against the task in front of you. Walk the decision tree until you and the user share the same understanding of what's being built, why, and how — don't stop at the first plausible answer.

2. Once the interview settles, write a short plan back to the user:

<plan-template>

## Goal

One or two sentences — what "done" looks like, from the user's perspective.

## Steps

A short, ordered list of the concrete steps you'll take.

## Open risks

Anything still uncertain that could change the plan mid-flight. Empty is fine.

</plan-template>

3. Wait for the user to confirm the plan before writing any code.

## Boundary

This is a **single-task, single-session** gut check — nothing gets published, nothing persists once the conversation ends. If the work spans multiple sessions, or needs a paper trail other agents can pick up, use `/grill-with-docs` → `/to-spec` → `/to-tickets` instead.
