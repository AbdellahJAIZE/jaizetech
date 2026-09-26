---
title: "AI Feature Definition of Done: The Handover Checklist"
description: "A practical AI feature definition of done: five production facts, required artifacts, and an afternoon acceptance test before you sign off."
published: "2026-09-26"
tags: ["AI development", "acceptance criteria", "AI handover", "AI observability", "vendor management"]
ogImage: "/images/blog/ai-feature-definition-of-done/cover.jpg"
primaryService: "ai-features"
---
An external team just told you the AI feature is done. There is a handover call on the calendar, a final invoice attached to it, and a demo that will almost certainly go beautifully. You have maybe two days to decide whether to sign off. And nobody — not them, not you — ever wrote down what **AI feature definition of done** actually means for this build.

That gap is the single most expensive thing I see in AI delivery. Not bad engineers. Not the wrong model. Just a project where the scope document described *what to build* and said nothing about *how you would know it was finished*.

So here is the acceptance checklist I run when a founder or CTO asks me to sit in on a handover. Five production facts that must be true, a set of artifacts that must physically exist in your accounts, an afternoon-long run-through you can do yourself, and an honest section on when withholding the final payment is fair versus when it makes you the difficult client.

## The moment: they say it's done and you have no idea what to check

You are not being paranoid. You are being asked to convert a deliverable you cannot inspect into a release you are accountable for. The demo proves the happy path works on the builder's machine with the builder driving. That was also true in week three.

What you actually need to know before you sign: will this still work on a Tuesday morning with 200 real users, will it cost what you budgeted, and can your team fix it when it breaks at 22:00 without calling the people who just offboarded. Those are three different questions and the handover call answers none of them.

The awkward part is that most external teams are not hiding anything. They genuinely believe it's done, because their internal definition of done is "the acceptance criteria in the ticket pass." For traditional software that is often enough. For an AI feature it is nowhere near enough, because AI features fail probabilistically — they degrade rather than break, and degradation does not fail a ticket.

## Why a working demo is not an AI feature definition of done

A demo is a curated sample of size one. Every AI feature I have ever shipped has a distribution of outputs, and the demo shows you the mode. It shows you nothing about the tail, and the tail is where your support tickets, your compliance risk, and your cloud bill live.

![AI Feature Definition of Done: The Handover Checklist](/images/blog/ai-feature-definition-of-done/1.jpg)

Concretely, here is what a clean handover demo is fully compatible with. The retrieval step returning garbage for any question phrased in Dutch instead of English, because nobody tested cross-lingual queries. A p95 latency of eleven seconds while the demo hit 1.8 because the cache was warm. A prompt that was edited forty minutes before the call, untested against anything, because the model started refusing one example. Token spend that works out to €4 per user per month at pilot volume and €38 at real volume because of a retry loop nobody metered.

None of that is visible in a demo. All of it is visible in twenty minutes if you know what to ask for. And none of it is dishonesty — it is the predictable result of an engagement where [the build was scoped across seven layers but acceptance was never one of them](/en/blog/full-ai-feature-build-scope-cost).

The reframe that helps: stop asking "does it work?" and start asking "what evidence exists that it keeps working?" Those are different deliverables. The second one is what you are paying for and the one most likely to be missing.

## The five production facts that must be true

Everything on this list is binary. Either the artifact exists and you can open it yourself, or the item fails. "We're planning to add that" is a fail. "The logs would show that" is a fail.

**1. An eval suite exists, runs on command, and has a stated pass threshold.** Not a notebook with twelve examples. A versioned test set — in my experience 60 to 200 cases is where this becomes useful for a single feature — covering the real query distribution including the ugly inputs. It must produce a number, that number must have a committed floor, and you must be able to run it yourself with one command. Ask what the current score is and what the floor is. If the floor was invented this week to sit just under the current score, you now know something. For RAG specifically, retrieval quality and faithfulness need separate scores; one blended number hides which half is broken.

**2. Monitoring is live, and it is not just logs.** Logs tell you what happened after you already know something is wrong. You need traces per request with token counts, latency broken down by step, cost attributable per feature, and an alert that reaches a human. Open the dashboard during the call and look at yesterday's real traffic. If the answer is "it's all in CloudWatch," you have logs, not [observability, and "it seems fine" is exactly how that fails](/en/blog/llm-observability-production-monitoring).

**3. A latency and cost budget that was measured, not estimated.** Two numbers, written down: p95 latency under expected concurrency, and cost per unit of work — per conversation, per document, per user per month. Measured under load, not from a single sequential run on a quiet afternoon. Then ask what happens at 10x volume. A team that has measured will answer in thirty seconds with a specific bottleneck. A team that has not will talk about scaling in general terms.

**4. A security pass with named findings.** At minimum: prompt injection tested against the tool-calling and retrieval paths, tenant isolation verified so user A cannot retrieve user B's documents, secrets out of the repo and in a manager, PII handling documented, rate limits per user rather than global. I want to see a list with findings and resolutions, including the ones they decided not to fix and why. An empty security section means nobody looked.

**5. A rollback path someone has actually executed.** Not "we can redeploy the previous container." Executed, in staging, with a timestamp. And for AI features it has two dimensions: rolling back code and rolling back prompts and model versions. If prompts live in the codebase and deploy with it, say so explicitly; if they live in a separate store, you need version history and a documented revert. [Silent prompt regressions](/en/blog/prompt-versioning-regression-testing) are the most common post-handover failure I get called about, and they are undetectable without the eval suite from item one.

## The handover artifacts you should actually receive

Facts prove the system works. Artifacts prove your team can own it. Check these against your own accounts, not against a shared drive the vendor controls.

- **Access, in your name.** Cloud accounts, model provider keys, vector database, monitoring, CI, DNS, the repo. You are the owner; they are collaborators you can remove. Do the removal test mentally: if you revoked all their access tomorrow, does anything stop working?
- **A runbook, one page, boring.** The five most likely failures and the first action for each: model provider down, latency spike, eval score drop, cost spike, bad output reported by a customer. With the actual command or dashboard link, not a description.
- **An architecture note with the decisions and the rejected alternatives.** Why this retrieval strategy, why this model, why this chunking. Three pages beats thirty. Six months from now the reasoning is worth more than the diagram.
- **The eval set as a repo artifact**, with instructions to run it and to add cases. This is the asset that keeps paying.
- **A recorded walkthrough, 45 to 90 minutes, of the code and the deploy path**, done live with your engineer asking questions. Recorded, because the person who watches it in March is not in the room today.
- **A known-limitations list.** Every honest AI build has one. Its absence is a signal about the team, not about the build.

## A worked acceptance run-through you can do in an afternoon

Budget three hours, get the builder on a call, and go in this order.
0:00  Run the eval suite yourself, from a clean clone, on your machine.
      Pass = it runs and hits the stated floor. Failure to run is itself a finding.
0:30  Load test. 20 concurrent users for 5 minutes. Read p50, p95, p99
      and the cost meter before and after. Compare to the stated budget.
1:00  Break it live: revoke the model key, send a 300-page document,
      send empty input, send a prompt-injection string, send Dutch.
      You are checking what the *user* sees, not whether it is graceful.
1:30  Log in as tenant A, try to retrieve tenant B's data. Then check
      whether that attempt appears in the monitoring dashboard.
2:00  Execute the rollback in staging, timed, with them watching not driving.
2:30  Access audit: revoke one vendor account and confirm nothing breaks.
      Open the runbook and follow one entry end to end.

The load test is the one people skip and the one that pays for the afternoon. Twenty concurrent users is not a real load test, but it is enough to expose an unbounded retry, a missing connection pool, or a rate limit you'll hit on launch day. If you want to go deeper on the numbers you get back, [the latency bottleneck is almost never where the team assumes it is](/en/blog/llm-latency-audit-production).

Anything that fails, write as one line: the check, the observed behaviour, the expected behaviour. Not a judgement. A list of eight factual lines lands very differently from "I'm not comfortable signing this off."

## What to withhold payment for, and what's a fair fix-it clause

Be honest about severity, because using the final invoice as a hammer for cosmetic items is how you lose a good team you will want again next year.

**Withhold on:** no eval suite with a threshold, no rollback that has been executed, an unresolved tenant-isolation or secrets finding, no access transferred to your accounts, or a measured cost that comes in materially above the agreed budget with no plan. These are not polish. These are the difference between a feature you own and a dependency you rent from people who have left.

**Fix-it clause instead:** documentation thinner than you wanted, a dashboard missing a panel, eval coverage at 60 cases where you wanted 120, a p95 that is 20% over target with the bottleneck identified and a fix scoped. Agree a two-week window, hold back 10–15% against it, release the rest. Everyone stays professional and the work gets finished.

The structural fix, of course, is to put this checklist in the statement of work before anyone starts building, which is also [what separating a real vendor from a confident one looks like at the buying stage](/en/blog/vet-ai-vendor-before-you-sign). Acceptance criteria written at the end are a negotiation. Written at the start, they are just the plan.

## Where this becomes an engagement

If you are staring at a handover you cannot verify, or you are about to commission a build and want acceptance criteria written into the contract before the first sprint, that is the shape of a [Full Build](/en/services): six to twelve weeks where a senior engineer builds the AI feature and the product around it end-to-end and owns it — including the evals, monitoring, cost budget, rollback path and handover artifacts on this list, not as an afterthought but as the definition of finished.

I also sit in on other people's handovers as a second pair of eyes, which is a much cheaper afternoon than a bad sign-off. Either way, [tell me where the build stands](/en/contact) and we'll be specific about what's missing.
