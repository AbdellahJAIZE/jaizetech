---
title: "AI Feature SLA: Why 95% Accuracy Clauses Are Unsignable"
description: "An AI feature SLA with customer-measured accuracy and a two-second max is a breach waiting to happen. Here's the clause rewritten line by line."
published: "2026-10-24"
tags: ["AI SLA", "enterprise contracts", "LLM latency", "AI accuracy", "contract negotiation"]
ogImage: "/images/blog/ai-feature-sla-clause/cover.jpg"
primaryService: "hardening"
---
The contract arrives as a PDF with tracked changes, forwarded at 19:40 with "legal came back, mostly fine, can you look at 7.3?" Section 7.3 is the service level schedule, and someone on the buyer's side has pasted their standard hosting SLA into it and replaced the word "Platform" with "AI Assistant". It now promises 99.9% monthly availability, a two-second maximum response time, and "accuracy of no less than 95% as measured by Customer". Procurement wants it signed by Friday.

That forwarding step is where most AI feature SLA trouble begins. Not in the clause itself, which is boring and copy-pasted, but in the fact that the lawyer who can read the indemnity and the engineer who can read the latency dashboard review it separately, never in the same hour. The commitments that nobody can measure survive in that gap.

What follows is one clause taken apart line by line. The contract is hypothetical, assembled from the shapes I keep seeing in enterprise deals, but the reasoning is what I would say on the call.

## Uptime is the easy half of an AI feature SLA

Availability is the one number in the clause that behaves like a normal engineering commitment. It is defined, it is measurable with tooling you probably already have, and the arithmetic is not open to interpretation: 99.9% monthly leaves you 43 minutes of downtime, 99.5% leaves about 3 hours and 40 minutes. Pick the one your on-call reality supports, not the one that looks impressive next to a competitor's marketing page.

The part that gets signed carelessly is the definition of "available". Three questions decide whether you can honour it. What endpoint is being measured, yours or your model provider's? Does an HTTP 200 carrying a refusal, a truncated answer or an empty object count as available? And who measures, from where, at what interval? If the buyer's synthetic monitor polls from their own network every 60 seconds and you measure at your load balancer, you will have two different uptime numbers during the first incident and no agreed tiebreaker.

Then there is the dependency question, which is specific to AI features and which generic hosting SLAs never anticipate. If OpenAI, Anthropic or Azure OpenAI degrades for 90 minutes, that time lands in your availability bucket unless the clause says otherwise. There are two honest ways to handle it: carve out third-party model provider outages explicitly, or keep the full commitment and build real failover before signing. I prefer the second where the deal justifies the work, because the carve-out tends to get rejected in negotiation anyway, and because [what most teams call failover is a retry loop against the same endpoint](/en/blog/llm-provider-outage-failover-strategy). A retry loop does not survive a regional outage, and a regional outage is exactly what eats 43 minutes.

## The clause, line by line

Here is the version that came back from the buyer's legal team, trimmed to the three operative sentences:

![AI Feature SLA: Why 95% Accuracy Clauses Are Unsignable](/images/blog/ai-feature-sla-clause/1.jpg)
7.3 Service Levels. Supplier warrants that the AI Assistant shall
(a) be available 99.9% of each calendar month;
(b) return responses within two (2) seconds; and
(c) maintain accuracy of no less than 95% as measured by Customer.
Failure to meet any Service Level constitutes a material breach.

Clause (a) is signable after the definitional work above, probably at 99.5% rather than 99.9% unless you have multi-provider failover and someone awake at 03:00.

Clause (b) is not signable as written, and the reason is mechanical rather than negotiable. "Within two seconds" against a streaming LLM response has no single meaning: time to first token, time to a complete answer and time to a complete answer after a tool call are three different distributions, and the third one is often five to ten times the first. A "maximum" is also the wrong statistic, because any single slow request breaches it. What you can commit to is an LLM latency SLA stated as a percentile over a measurement window: p95 time to first token under 1.5 seconds and p95 full completion under 8 seconds, measured server-side, excluding requests where the customer's own systems are the bottleneck. Before you write any of those numbers down, measure them. I have seen teams quote a p95 from a dev environment and discover in week two that [the real bottleneck was retrieval, not the model](/en/blog/llm-latency-audit-production), and that the production p95 was nowhere near the figure in the contract.

Clause (c) is the one to stop everything for. And the final sentence, "failure to meet any Service Level constitutes a material breach", is what turns an unmeasurable promise into an exit ramp for the buyer.

## What "95% accuracy" has to become

An AI feature accuracy guarantee measured by the customer is a guarantee that someone on their side will forward three bad answers in March and call it a breach. That is not cynicism about buyers, it is the only thing the clause as written can mean. There is no defined task, no defined test set, no defined grader and no defined denominator. Nobody can compute it, so it gets computed from anecdote.

The rewrite has five parts, and all five have to be in the contract, not in a side email:

- **The task.** Not "the AI Assistant" but a named capability with a named input type. Extraction of six specific fields from supplier invoices scores very differently from open-ended question answering over the same documents.
- **The test set.** A frozen set of representative cases, sized so the number means something (a few hundred rather than twenty), agreed by both parties at signature, with a documented process for adding cases later.
- **The grader.** Exact-match, field-level F1, a rubric applied by a named human reviewer, or an LLM judge with a published prompt and a measured agreement rate against human labels. Say which.
- **The denominator and window.** Per calendar month, over the frozen set plus any mutually agreed additions, excluding inputs outside the documented scope.
- **The remedy.** What happens on a miss, which is almost never "material breach" (more on that below).

That rewrite does something uncomfortable: it forces you to know your real score before you sign. Most teams at this stage do not. They have a demo everyone liked and a vague sense that it is "about right", which is not a number you can put next to the word "warrants". If the feature retrieves from documents, the honest starting point is [retrieval and faithfulness metrics with explicit ship gates](/en/blog/rag-evaluation-metrics-production), run before the signature and not after the first complaint.

## What has to exist before you can honestly commit

Each line of the rewritten clause has an infrastructure prerequisite. If the prerequisite is missing, you are not making a commitment, you are making a bet with your own balance sheet.

Availability and latency percentiles need per-request tracing with token counts, model version, retrieval timings and error classes, retained long enough to settle a dispute about last month. "It seems fine" is not a defence in a credit negotiation, and [observability built after the fact never covers the incident you are arguing about](/en/blog/llm-observability-production-monitoring).

The accuracy number needs an eval suite that runs on a schedule and on every change, not a notebook someone ran once. [The continuous eval loop is the part almost nobody actually runs](/en/blog/llm-evaluation-production-continuous-eval), and it is the only way you will notice a score sliding from 94% to 88% before the customer does.

It also needs prompt and model versioning, because when the score moves you have to answer "what changed" within hours. Without [versioned prompts and regression tests](/en/blog/prompt-versioning-regression-testing), the honest answer is "we don't know", and that answer costs you the renewal even if the feature recovers.

And it needs change control over the model itself. [Providers update models under stable-looking aliases](/en/blog/silent-model-updates-ai-feature), which means your accuracy number can move without a single commit on your side. Pin versions, and reserve in the contract the right to substitute an equivalent model with notice.

## The credit clause, and what actually trips it

Negotiators spend their energy on the credit percentage. In practice, the service credit is the least dangerous part of a service level agreement for an AI feature. A 5% or 10% monthly fee credit on a mid-six-figure contract is a bad month, not an existential one.

What hurts is everything attached to it. "Material breach" on a single missed service level gives the buyer termination rights, often with a refund of prepaid fees. Repeated-miss clauses ("three consecutive months or any four months in a rolling twelve") are what end contracts, so negotiate the cure period and the consecutive-month threshold rather than the percentage. And watch for an uncapped indemnity sitting elsewhere in the document that quietly covers "errors in Supplier's output", which reintroduces unlimited accuracy liability after you carefully bounded it in 7.3.

One more thing to insist on: service credits as the sole and exclusive remedy for service level misses, with a disputed-measurement process that gives both sides ten business days and uses your telemetry as the reference record. That last detail matters more than it sounds, because [identical inputs do not produce identical outputs](/en/blog/llm-non-determinism-production), and a customer re-running a failed case next week will not reproduce the failure or the fix.

## Redlines worth spending goodwill on

If you only get three changes through, take these. Replace the maximum response time with percentiles and a measurement method. Replace customer-measured accuracy with a frozen test set, a named grader and credits as the sole remedy. Add a dependency carve-out or an exclusion window for third-party model provider incidents, plus the right to swap pinned model versions with notice.

Then do the unglamorous part, which is making the numbers true. Hardening is what turns the clause into something you can defend: evals that run continuously, tracing that can reconstruct any request from last month, failover that survives a provider outage, pinned versions, and a definition of done that [names who owns the feature after launch](/en/blog/ai-feature-definition-of-done). That is a three to six week [Production Hardening engagement](/en/services), and the sequencing matters: it belongs before the signature, not after the first breach notice. If an enterprise clause is sitting in your inbox this week, [send it over](/en/contact) and we will go through what is safe to sign.
