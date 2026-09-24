---
title: "LLM Observability in Production: Why 'It Seems Fine' Fails You"
description: "Most AI features fail silently in production. Here's the LLM observability production stack — five signals, real thresholds, and how to wire it cheaply."
published: "2026-09-24"
tags: ["LLM observability", "AI monitoring", "production AI", "MLOps", "AI reliability"]
ogImage: "/images/blog/llm-observability-production-monitoring/cover.jpg"
primaryService: "hardening"
---
Your AI feature shipped five weeks ago. It has not fallen over. Support has not escalated anything. The dashboard you check is the same one you had before the feature existed: uptime, error rate, p95 on the HTTP layer — all green. And somewhere in the back of your head is the question that made you open this page: if the answers got worse last Tuesday, how would I know?

You would not. That is the honest answer for most teams a month after launch. **LLM observability production** work is the part of hardening that everyone defers because nothing is currently broken, and it is the only part that determines whether the next breakage is caught by you or reported by a customer with your CEO on cc.

This is the dashboard-and-alerting layer, specifically. Not evals, not logs — I will draw those lines hard in a minute. Five signal families, the thresholds that justify waking a human versus the ones that belong in a Monday review, how to wire it from tools you almost certainly already pay for, and what a handed-over setup looks like so you can either self-assess or paste it into a vendor's scope.

## The moment: it's live, it "seems fine," and nobody would know if it wasn't

The pattern repeats with almost comic reliability. Launch week everyone watches. Week two the Slack channel goes quiet. Week four someone asks "how's the assistant doing?" and the answer is a shrug plus "no complaints." Week seven a provider ships a silent model update, or your content team reindexes the knowledge base, or a retry loop starts firing on a malformed tool call, and quality drops by a third. Nobody notices for eleven days.

Eleven days is not a number I invented for drama. It is roughly how long it takes for enough users to hit a degraded path, conclude the feature is mediocre, tell each other rather than you, and for one of them to finally write a ticket. By then the damage is trust, not tokens.

What makes AI features different from the rest of your stack is that they fail *without erroring*. A broken payment endpoint returns a 500 and your existing alerting catches it in ninety seconds. A broken RAG assistant returns a confident, well-formatted, grammatically perfect wrong answer with a 200 status code, in 1.4 seconds, for €0.004. Every signal your infrastructure monitoring watches says the system is healthy. I wrote the general version of this in [the punchlist of what actually breaks when AI hits production](/en/blog/what-breaks-in-ai-production); this post is about the instrumentation that would have caught those failures on day one instead of day eleven.

## Why your logs are not monitoring and your eval suite is not monitoring

Two things teams point at when I ask what they monitor, and neither one is monitoring.

![LLM Observability in Production: Why 'It Seems Fine' Fails You](/images/blog/llm-observability-production-monitoring/1.jpg)

**Logs are not monitoring.** Almost everyone has request logging — prompt in, completion out, a trace ID, maybe token counts. That is genuinely valuable and you should keep it. But a log is a forensic artefact. It answers "what happened in this specific request" *after* you already know to look. It is a pile of text nobody reads until something is on fire, and its value is measured in how fast it resolves an incident you have already detected. Detection is a different job.

**Evals are not monitoring either.** A good eval suite — the kind I argue for in [the continuous eval loop nobody runs](/en/blog/llm-evaluation-production-continuous-eval) — is a gate. It runs on a fixed, curated set of cases, on a trigger: a prompt change, a model version bump, a retrieval config edit. It tells you whether the *change you are about to ship* is better or worse than what is live. It says nothing about the traffic that arrived at 02:00 on a Sunday against inputs no one in your test set imagined.

Monitoring is the third thing: a small set of **continuous, aggregated** signals computed over live traffic, with thresholds attached, that degrade visibly before a user has to say so. Continuous, not triggered. Aggregated, not per-request. Thresholded, not "look at it sometimes."

The distinction matters commercially too. Teams that buy a dedicated LLM observability platform in month one usually get trace viewers — a beautiful UI for reading logs — and then discover six months later that nobody configured a single alert. You bought forensics and called it detection.

## The five signal families an LLM observability production dashboard actually needs

Five families. Not fifty metrics. If your dashboard has more than about a dozen tiles, nobody reads it, which is functionally the same as not having one.

### 1. Quality drift, via sampled judge scores

The only signal that directly proxies "is it still good." Sample a fixed percentage of live interactions — 1–5% is enough for most B2B volumes — and score each one with a cheap judge model against three or four rubric dimensions that match your feature. For a support assistant that is usually: grounded in retrieved context, answers the question asked, correct refusal when it should not know. Store the score, plot the **daily median and p10**, not the mean. The mean hides a bimodal collapse; the p10 is where degradation shows up first.

The trap: judge scores drift on their own when the judge model version changes. Pin the judge model explicitly and treat a judge bump like a deploy.

### 2. Cost per interaction

Not monthly spend — spend per *completed user interaction*, plotted daily. Monthly spend is a lagging aggregate that mixes traffic growth with efficiency regressions. Cost per interaction isolates the thing you control. When it jumps 40% overnight with flat traffic, something changed: a prompt got longer, retrieval started returning ten chunks instead of four, or a retry loop is silently doubling calls. I broke down where the money actually goes in [what it really costs to run a production LLM feature in 2026](/en/blog/cost-of-production-llm-2026); the monitoring version of that post is this single tile.

### 3. Latency percentiles — p50, p95, p99, split by path

One number is useless here. AI features have multi-stage pipelines, and the aggregate p95 tells you nothing about which stage moved. Split at minimum into retrieval, model call, and total. Track time-to-first-token separately from total completion time if you stream, because those two failing feel completely different to a user. The methodology for decomposing this is in [finding the real latency bottleneck](/en/blog/llm-latency-audit-production) — monitoring is just that audit, run forever, on a chart.

### 4. Failure and fallback rate

Every production AI feature has fallbacks: provider timeouts, rate-limit retries, a secondary model, a canned "I couldn't process that" response, an empty retrieval result. Count each of them as a rate, per hour. This family is the highest-value-per-hour-of-work signal on the list, because fallbacks are already instrumented in your code — you just never aggregated them. An empty-retrieval rate creeping from 2% to 9% is a reindex that half-failed, and it is invisible in every other metric.

### 5. Output anomaly rate

Cheap, deterministic, no model required. Count the share of responses that trip structural rules: length outside expected bounds, JSON that fails schema validation, a refusal phrase, zero citations when your format requires citations, a language mismatch with the user's input. These catch the stupid catastrophic failures — truncation, format collapse after a provider update, the model suddenly answering in English to Dutch users — within minutes and for essentially zero cost.

## Setting thresholds: what pages someone at 3am vs. what waits for Monday

The failure mode here is not missing alerts. It is alerts that fire, get muted after the third false positive, and then fail silently forever. So split your thresholds into exactly two tiers and be ruthless about what qualifies for the top one.

**Page a human now** — reserve this for fast, unambiguous, user-visible breakage where waiting costs real money or trust:

- Failure or fallback rate above ~10% sustained over 15 minutes
- Output anomaly rate above ~5% over 15 minutes (schema failures, truncation)
- p95 total latency above twice your stated budget for 10 minutes
- Cost per interaction more than 3× the trailing 7-day median for an hour — this is your runaway-loop tripwire and it has paid for itself more than once
- Zero successful completions for 5 minutes at non-trivial traffic

**Wait for the weekly review** — slow-moving, statistically noisy, needs a human to interpret:

- Judge score p10 down more than 15% week-over-week
- Cost per interaction drifting up more than 20% week-over-week
- p95 latency creeping within 20% of budget
- Empty-retrieval rate trending up
- Any distributional change in query topics

Two rules that make the difference between an alerting setup that survives and one that gets muted. Always alert on a *rate over a window*, never on a single request. And write the runbook link into the alert body: what to check first, what the rollback is, who owns it. An alert that arrives without a next action trains people to ignore alerts.

## Building this cheaply from tools you likely already run

You do not need to buy an LLM observability platform to get all five families. Before you spend a cent on a new vendor, wire version one from what you have — a competent engineer does this in three to five days.

The pattern that works almost everywhere: emit one structured event per interaction from your application, ship it to whatever you already use for metrics or analytics, and compute the five families as aggregations on top.

json
{
  "ts": "2026-09-24T09:14:02Z",
  "feature": "support-assistant",
  "prompt_version": "v7",
  "model": "<pinned-model-id>",
  "retrieval_chunks": 4,
  "retrieval_empty": false,
  "tokens_in": 3120, "tokens_out": 240,
  "cost_eur": 0.0041,
  "latency_ms": {"retrieval": 180, "model": 1240, "total": 1480},
  "fallback": null,
  "anomaly_flags": [],
  "judge_sampled": true, "judge_score": 0.82
}

One event, every family derivable from it. Then:

- **Already on Grafana/Prometheus or Datadog?** Emit these as metrics with labels and build one dashboard. Alerting is already there.
- **Warehouse-first shop (BigQuery, Snowflake, Postgres)?** Stream events to a table, write five SQL views, put Metabase or Grafana on top, schedule one query as the alert.
- **Small team, no metrics stack?** A Postgres table, a daily cron computing the aggregates, and a Slack webhook for threshold breaches. Unglamorous. Works.

The judge scoring runs as an async job over the sampled rows, not in the request path — never put a judge call in front of your user.

Buy the dedicated platform later, when you actually need cross-request trace visualisation, prompt playgrounds tied to live traffic, or a team of five debugging concurrently. Buying it first means paying for forensics you will not configure while still having no detection. Pair the event stream with [prompt versioning](/en/blog/prompt-versioning-regression-testing) and every metric becomes sliceable by prompt version, which is where root cause usually lives.

## What a hardened, handed-over monitoring setup looks like

Use this as a self-assessment, or paste it into a vendor's statement of work. A finished setup has:

1. One structured event per interaction, versioned schema, with prompt version and model ID on every row
2. One dashboard, under a dozen tiles, covering all five signal families, that a non-engineer can read
3. A sampled judge pipeline running async with a pinned judge model and a documented rubric
4. Page-now alerts wired to whoever is actually on call, each with a runbook link
5. A weekly review ritual — fifteen minutes, a named owner, with the drift signals on screen
6. A documented baseline: the numbers the feature ran at in its first healthy week, so "degraded" has a reference point
7. A tested rollback path: prompt version pinned, previous model ID known, one command

Item six is the one almost everyone misses. Without a recorded healthy baseline, every threshold is a guess and every argument about whether quality dropped is vibes. Capture it in the first two weeks after launch.

Realistically this is three to five engineering days for version one and another week to tune thresholds against real traffic, which is why it fits inside a hardening engagement rather than being one.

## Where this becomes an engagement

If your feature is live, quality is unverified, and you have no idea how you would find out it broke, that is Production Hardening: three to six weeks in which I build the eval and monitoring layer, versioned prompts, latency and cost controls, and a hardened deploy — then hand over the dashboard, the alerts, the runbooks, and the baseline so your team owns it.

Scope is on the [services page](/en/services). If you want to walk through what your feature currently emits and what it should, [get in touch](/en/contact).
