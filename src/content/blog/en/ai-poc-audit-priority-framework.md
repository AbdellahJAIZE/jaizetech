---
title: "AI POC Fix Priority: A 4-Axis Framework for the Punchlist"
description: "A practical AI POC fix priority framework: four axes, a tie-break rule, and a worked twelve-item example to sequence fixes before your demo."
published: "2026-09-22"
tags: ["AI POC", "fix priority", "technical debt", "RAG", "engineering leadership"]
ogImage: "/images/blog/ai-poc-audit-priority-framework/cover.jpg"
primaryService: "ai-audit"
---
The audit landed. Twelve findings, colour-coded, each one defensible. Somewhere in the same week the board demo got scheduled, and you have one engineer and about three weeks of real capacity between now and then. What the report does not hand you is an **AI POC fix priority** order that survives contact with that calendar — most reports stop at "here is what is wrong", and the sequencing judgment is left as an exercise for the reader.

That sequencing is the actual work. I have watched teams with an accurate punchlist ship something worse than teams with a sloppier one, purely because they worked top-to-bottom through a list that was sorted by severity label instead of by consequence.

This is the framework I use to turn a punchlist into an order: four axes, a tie-break rule, a worked example with a real-shaped twelve-item list, and the point at which you stop fixing and ship behind monitoring instead. You can run it yourself on a whiteboard in ninety minutes.

## The moment: twelve items, three weeks, and no order to work in

The list always looks roughly like this. An auth gap where the RAG assistant can retrieve documents the asking user is not entitled to see. A p95 latency of 9 seconds with an ugly tail. A cost leak — someone is re-embedding the whole corpus on every deploy. No prompt versioning, so last Thursday's "small tweak" silently changed refusal behaviour. No eval set. Logs that record the response but not the retrieved context. A single hardcoded API key. No rate limiting. Chunking that splits tables in half. No retry or fallback when the model provider 429s. PII going to a US endpoint with no DPA in place. And a UI that shows no citations, so users cannot check anything.

Every one of those is real. I described the general shape of them in [what actually breaks when AI hits production](/en/blog/what-breaks-in-ai-production), and a good report — the kind I lay out in [what a real POC audit report contains](/en/blog/ai-poc-audit-report-checklist) — will name all twelve with evidence.

Twelve items, one engineer, fifteen working days. Even at a generous two days per item you can close six. So the only question that matters is: which six?

## Why "fix everything before the demo" quietly burns your runway

The instinct is to treat the punchlist as a definition of done and grind it. That instinct costs you the runway twice over. First, you spend three weeks and arrive at the demo with eleven half-fixed things and no story. Second, and worse, you burn the credibility you need for the *next* budget conversation, because "we fixed a lot of technical debt" is not a sentence a board funds.

![AI POC Fix Priority: A 4-Axis Framework for the Punchlist](/images/blog/ai-poc-audit-priority-framework/1.jpg)

There is also a compounding problem. Several items on a typical punchlist are not independent. Fixing chunking without an eval set means you cannot tell whether you improved retrieval or just moved the failures somewhere else. Tuning prompts without versioning means the improvement is unreproducible the moment someone else touches the file. You will do the work twice. I have seen a team spend nine days on chunking strategy, ship it, and then discover from user complaints that faithfulness had dropped — because there was no measurement in place before or after. Nine days, negative value, and it looked like progress the whole time.

So the punchlist is not a to-do list. It is an input to a sequencing decision, and the sequence is decided on four axes.

## The four axes of AI POC fix priority

Score every item on the list against these four. Use small integers — 1 to 3 is plenty of resolution — and do it out loud with the engineer who will actually do the work, because their estimate is the only one that counts.

### 1. Blast radius: who gets hurt, how many, and can you undo it?

Not "how bad is the bug" but "what does the worst firing of this bug touch, and is it reversible?" A wrong answer shown to one internal user is reversible. A cross-tenant data leak is not — once user A has seen user B's contract, there is no rollback, there is a disclosure obligation. A cost leak is expensive but perfectly reversible: you notice, you fix it, you eat the bill.

Rank irreversible-and-wide above reversible-and-severe. Security, data leakage, and anything that creates a legal obligation sit at the top of this axis regardless of how likely they are, because likelihood is a thing you estimate badly and consequence is a thing you can reason about.

### 2. Cost to fix: engineer-days, including review and deploy

Estimate in days, by the person doing it, including code review, deploy and the half day of verification nobody budgets. Be honest about the items where the real cost is a decision rather than code — "move PII processing to an EU region" is two days of work behind a three-week vendor conversation. That item's cost to fix is three weeks, not two days, and it needs to start today even though nobody will touch it for a fortnight.

### 3. Cost of leaving it broken: per week, in something countable

This is the axis people skip, and it is the one that does the most work. For each item, answer: what does one more week of this cost us? Sometimes it is euros — the re-embedding leak burns roughly €400 a week, which you can actually compute from your provider dashboard and the numbers in [what a production LLM feature really costs](/en/blog/cost-of-production-llm-2026). Sometimes it is support hours. Sometimes it is "nothing, until we onboard the second customer in November", which is an enormously useful answer because it tells you the item has a deadline, not an urgency.

Items whose weekly cost is zero until a known future date go in the 90-day plan, not in the three weeks. Items whose weekly cost is a number you can say out loud go near the front.

### 4. Dependency order: what must exist before anything else is measurable

Some fixes are prerequisites for knowing whether other fixes worked. These are almost always observability and evaluation:

- **Tracing with retrieved context logged** comes before any retrieval or chunking work. Without it you are debugging blind, and the [latency work](/en/blog/llm-latency-audit-production) has no bottleneck to point at.
- **A golden set of 50–100 questions with expected behaviour** comes before prompt, model or chunking changes. Fifty questions is two days of work and it converts every later fix from an opinion into a measurement. The [continuous eval loop](/en/blog/llm-evaluation-production-continuous-eval) is the mature version; you do not need the mature version in week one, you need the fifty questions.
- **Prompt versioning** comes before prompt tuning, for the reason laid out in [stop silent prompt regressions](/en/blog/prompt-versioning-regression-testing).

Dependencies override the other three axes. Always.

Put together, the rule is short enough to write on the whiteboard:

text
1. Dependencies first — anything that makes other fixes measurable.
2. Then irreversible blast radius, sorted by consequence, not likelihood.
3. Then rank the rest by (cost of leaving it broken per week) / (days to fix).
4. Anything whose weekly cost is zero until a dated future event
   goes in the 90-day plan with the date attached, not in this sprint.

## Worked example: sequencing that twelve-item punchlist

Run the rule over the list above and the three weeks fall out almost mechanically.

**Days 1–2.** Tracing that logs the query, the retrieved chunk IDs and the full prompt sent to the model. Pure dependency. Nothing downstream is measurable without it, and it will immediately tell you things the audit could only infer.

**Days 3–4.** The auth gap. Irreversible blast radius, and in a RAG assistant it is usually a missing metadata filter rather than a rearchitecture — a day of work and a day of writing the test that proves it. Do not let it slip past the first week; every day it survives is a day of exposure you cannot undo later.

**Days 4–5, in parallel with someone else's calendar.** Open the PII-to-US-region conversation with legal and the vendor. Zero engineering days this sprint, but the clock starts now. This is the classic item where the cost to fix is dominated by waiting.

**Days 5–7.** The golden set. Fifty to eighty questions with expected answers and expected refusals, drawn from real user queries in your logs. Second dependency, and the thing that makes the rest of the quarter honest.

**Day 8.** The cost leak. One day, roughly €400 a week saved, best ratio on the list by a wide margin. This is also the item you can put on a slide with a number.

**Days 9–10.** Prompt versioning plus a CI job that runs the golden set on every prompt change. Third dependency, and it protects everything you do afterwards.

**Days 11–13.** Now, and only now, the retrieval work: chunking that stops splitting tables, plus citations in the UI. You have tracing to diagnose it, a golden set to score it, and versioning to keep it. Citations also do something no other fix does — they let users catch the model's errors themselves, which drops your effective error rate before you have improved the model at all.

**Days 14–15.** Rate limiting, retry with backoff and a fallback model. Cheap, and it removes the most embarrassing demo failure mode: a provider 429 on stage.

What did not make it: the hardcoded key (rotate it in five minutes, do not "fix secret management" this sprint), full latency optimisation, and the p95 tail. Which brings us to the honest part.

## What belongs in week one versus month two of the 90-day plan

Week one is dependencies and irreversible risk. Month two is everything that needs a decision, a vendor, or a rebuild: the latency architecture, model routing, the region move, the eval loop that runs continuously rather than in CI, on-prem or VPC hosting if the data classification demands it.

The split has a test. If the fix can be validated by the engineer who wrote it, within the sprint, it is a now item. If validating it requires a month of production traffic, a contract, or another team's roadmap, it is a 90-day item — and it belongs on a dated plan with an owner, not in the sprint where it will quietly consume everything.

## The trap: doing the cheap stuff first because it feels like progress

The most common failure I see is a punchlist worked in ascending order of effort. Eight small items closed in week one, a green dashboard, real morale — and the auth gap still open in week three because it was the scary one.

Cheap-first optimises for the count of closed tickets, which is a metric nobody outside the team cares about. It also front-loads exactly the items with the lowest cost of leaving them broken, because cheap and low-consequence correlate strongly. The ratio in step 3 of the rule exists precisely to stop this: a one-day fix only jumps the queue if the thing it stops is actually costing you something this week. That is the arithmetic behind [the audit cost versus a broken launch](/en/blog/poc-audit-cost-vs-failed-launch) — the expensive failures are rarely the expensive fixes.

Run the four axes before anyone opens an editor, write the order down, and make the engineer's estimate the one on the board.

## When to stop fixing and ship behind monitoring instead

At some point the remaining items stop being things you should fix and start being things you should *watch*. The signal is when your estimate of the fix's value becomes a guess. If you cannot say what a fix buys, you do not know enough yet, and the cheapest way to learn is controlled production traffic.

Shipping behind monitoring means something specific: a limited cohort (one friendly customer, or internal users), a dashboard with p95 latency, cost per request and refusal rate, alerts with thresholds somebody agreed to, an obvious kill switch, and a named person watching it for the first week. That configuration turns unknown risk into observed risk, and observed risk gets prioritised properly next sprint with real numbers instead of audit adjectives.

What must never ship behind monitoring: anything on the irreversible side of the blast-radius axis. Monitoring tells you a data leak happened. It does not un-leak it. Everything else — latency, cost, quality, the long tail of edge cases — is a candidate for ship-and-watch, and usually a better candidate than three more weeks of fixing in the dark.

## Where this becomes an engagement

If you have the punchlist but not the confidence to sequence it — or you have the symptoms and no punchlist at all — that is what a **POC Audit** is for: a one-week sprint where I go through the codebase, infrastructure, data flow, prompts and costs, and hand back the findings *plus* the 90-day plan with the order, the dependencies and the week-one/month-two split already decided.

You get the framework above applied to your actual system by someone who has sequenced these lists before, so your engineer spends the three weeks building instead of arguing about what to build. The scope is on the [services page](/en/services), and if you want to walk through your current list first, [tell me what is on it](/en/contact).
