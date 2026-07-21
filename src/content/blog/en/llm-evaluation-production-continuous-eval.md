---
title: "LLM evaluation that survives production: the continuous eval loop nobody runs"
description: "Most teams run an eval suite once and never touch it again. Here's the continuous eval workflow that catches regressions before customers do, with the trade-offs of building it."
published: "2026-05-12"
tags: ["LLM evaluation", "production AI", "AI engineering", "regression testing"]
ogImage: "/og-image.png"
primaryService: "hardening"
---

Most AI teams run an eval once and ship. Maybe they run it again when a vendor releases a new model. Then six months later a customer complains about a regression and the team has no way to tell whether they introduced it, when, or which change broke things.

This is the eval gap. Most production LLM systems have a "did this commit make things worse" answer somewhere between "no idea" and "we ran it through ten queries and it seemed fine". That is not a quality program. That is hoping.

This post is the continuous eval workflow I use in production. It is more work to set up than a one-shot eval, less work to run than most teams expect, and it catches roughly 80 percent of regressions before customers do. If you have shipped an LLM feature and you are not running this, you have a quality program that exists on paper and not in practice.

## What "continuous eval" actually means

Continuous eval is not "run the eval more often". It is a workflow with four properties:

1. **Triggered automatically on every change that could affect output quality.** Prompt changes, model swaps, retrieval-config changes, context-window changes, library upgrades.
2. **Versioned alongside code, so historical evals can be compared.** Not a notebook somebody re-runs.
3. **Has a pass/fail threshold, not just a score**. The threshold is set in advance and gates merges.
4. **Includes adversarial and hard-case inputs**, not just happy-path examples.

If your current eval setup is missing any of these, it is a quality measurement, not a quality gate. The difference matters.

## The 5-layer eval pipeline

A production-grade eval pipeline has five layers. You can run with just three for a few months, but the missing two come back to bite you.

### Layer 1: Unit-test-style assertions

The cheapest, fastest layer. Asserts on specific properties of the LLM output without judging quality.

Examples: "the output is valid JSON", "the output contains a date in YYYY-MM-DD format", "the output is between 50 and 500 tokens", "the output does not contain the placeholder string [REDACTED]".

These catch formatting regressions and obvious failures. They run in under a second per example. They should run on every commit.

Tooling: pytest with custom assertions, or LangSmith's structured assertions, or just plain Python.

### Layer 2: Reference-based scoring

Compare LLM output to a known-good reference. Use either exact-match, BLEU, ROUGE, embedding similarity, or LLM-as-a-judge for fuzzy matching.

Examples: "the output should match this golden answer with cosine similarity > 0.85", "the output should classify this input as 'positive'".

These are great for tasks with a clear right answer (classification, extraction, structured generation). Less useful for open-ended generation where there is no single right answer.

Tooling: scikit-learn for classification metrics, sentence-transformers for embedding similarity, OpenAI's evals framework, or LangSmith for managed.

### Layer 3: LLM-as-a-judge

Use a stronger LLM (or the same one with a different prompt) to grade the output of your production LLM. Ask it specific questions: "does this output answer the question correctly?", "is the tone appropriate for a customer support context?", "does this output contain unsupported claims?".

Pros: scales to subjective qualities humans usually need to grade. Cons: expensive, slow, can be inconsistent.

Useful guardrail: calibrate your LLM judge against human ratings on a sample of 50-100 outputs first. If the judge agrees with humans 85+ percent of the time, you can trust it. Less than 75 percent, do not.

Tooling: OpenAI Evals, LangSmith Evaluators, custom with gpt-4o judge.

### Layer 4: Adversarial / red-team set

A set of inputs designed to break your system. Edge cases, ambiguous queries, prompt injection attempts, requests in unexpected languages, requests with malicious intent (if your use case has that risk).

This set should grow over time. Every production incident should add at least one entry. Every customer complaint that turned out to be a legitimate edge case should add an entry. This is your institutional memory of "things that have broken before".

If your adversarial set is not growing, you are not learning from production.

### Layer 5: Real production sampling

Sample a small percentage of production traffic (1-5 percent), log inputs and outputs, run them through your eval suite. This is the only layer that catches drift in real input distributions.

Why this matters: your other four layers test your system against eval data you constructed. Your production users are constructing inputs you did not anticipate. The only way to know if your system handles those is to sample them and check.

The hard part is privacy. You cannot just log everything verbatim if your users are sending sensitive data. Solutions: hash personally identifiable parts, sample only inputs that meet a non-sensitive heuristic, or use a privacy-preserving eval (only log embeddings, not raw text).

## The continuous part: when each layer runs

Different layers run at different cadences. Running everything on every commit is expensive and slow. Here is the practical schedule.

| Layer | When it runs | Why this cadence |
|---|---|---|
| Layer 1 (unit assertions) | Every commit, pre-merge | Cheap and fast. No reason not to. |
| Layer 2 (reference-based) | Every commit that touches prompts, models, or retrieval | Catches obvious regressions before merge. |
| Layer 3 (LLM-as-judge) | Nightly, on the full eval set. On-demand for major prompt changes. | Expensive enough that you do not want it on every commit. |
| Layer 4 (adversarial) | Weekly. On-demand when a new edge case is discovered. | Less time-sensitive but critical. |
| Layer 5 (production sampling) | Continuously, with eval running daily on the sampled traffic | The only one that catches input drift. |

This gives you fast feedback on most changes (Layers 1-2) and deeper feedback on a slower cadence (Layers 3-5). Total monthly cost for a mid-sized application: 200 to 600 euro in LLM judge calls plus your monitoring stack.

## Pass/fail thresholds and what to do when they fail

This is where most teams get stuck. They have evals running but no clear "this commit cannot ship" decision.

Set explicit thresholds before you ship anything. Examples:

- Layer 1: 100 percent of unit assertions pass. Hard gate.
- Layer 2: ≥85 percent of reference-based examples pass. Hard gate.
- Layer 3: ≥80 percent rated "good" by the LLM judge. Soft gate (review required).
- Layer 4: ≥90 percent of adversarial cases handled correctly. Hard gate.

When a threshold fails, three responses are valid:

1. **Fix the regression and re-run.** Default response.
2. **Lower the threshold with an explicit decision logged.** Sometimes the eval set has gotten stricter than the real product needs. Document why.
3. **Acknowledge the regression and ship anyway with a tracked issue.** Rare and dangerous. Only use when the regression is in a known-acceptable area and the change provides bigger value elsewhere.

The principle is that the threshold gate exists, you respect it, and when you do override it the override is a logged decision a future engineer can audit. "We pushed without thinking about it" is the failure mode the gate exists to prevent.

## What this catches that simpler workflows miss

If you only run a single one-shot eval, you miss:

- **Prompt regressions across commits.** Layer 1-2 catch these in seconds.
- **Subtle drift in vendor model behaviour.** Layer 5 catches these because you are sampling real inputs against your historical baseline.
- **Edge cases your team never thought to test.** Layer 4 grows over time and remembers what you forgot.
- **Production input distributions that diverge from your eval set.** Layer 5 is the only protection against this.

The single biggest win from continuous eval is not catching a specific regression. It is making the team aware of when quality is moving, which way, and why. Quality conversations are different when you have data.

## What it costs to set up

Realistic time to build this from scratch for a mid-sized AI product:

- Layer 1: 2-3 days of engineering. Plus 1 day per new prompt or feature to extend.
- Layer 2: 1 week to build, plus ongoing cost of curating reference examples (1 day per month).
- Layer 3: 1 week to build the judge prompt and calibrate against human ratings.
- Layer 4: ongoing. Start with 10 cases. Grow to 50-100 over six months as you learn.
- Layer 5: 2-3 weeks to build the sampling pipeline with privacy controls.

Total: roughly 4-6 weeks of engineering to set up, 3-5 days per month to maintain. For a production AI product, that is significantly less than the cost of one customer-impacting regression.

## What this looks like for a small team

If you have one engineer on the AI side and limited time, prioritise:

1. Layer 1 unit assertions. Two days. Highest ROI per hour.
2. A 50-example Layer 2 reference set with a pass threshold. One week.
3. A 10-case adversarial set that grows over time. Started in an hour.

Skip Layer 3 and 5 initially. Add them when you have an actual production-quality issue and need to prevent recurrence.

If you want a structured outside read on your current eval setup, the [AI integration audit](/services) format covers exactly this kind of review. The output is a written assessment with specific gaps in your eval coverage and the cheapest fix for each.

Related reading: [what actually breaks when AI hits production](/blog/what-breaks-in-ai-production) covers the failure modes evals are meant to catch. [What it really costs to run a production LLM feature in 2026](/blog/cost-of-production-llm-2026) includes eval reruns as a significant cost line.
