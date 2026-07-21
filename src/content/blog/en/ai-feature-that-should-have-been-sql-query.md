---
title: "The AI feature that should have been a SQL query"
description: "A field guide to over-engineered AI. How to tell when you actually need an LLM, and when you are adding cost, latency and unpredictability to a problem that plain code already solved."
published: "2026-07-14"
tags: ["AI features", "over-engineering", "LLM", "product engineering"]
ogImage: "/og-image.png"
primaryService: "ai-features"
---

I get asked to build a lot of AI features. A good chunk of them should not exist. Not because AI is useless, but because the specific problem in front of us was already solved by a database query, a rules engine, or fifty lines of ordinary code. Someone reached for a language model because it was the exciting tool, and now the roadmap has an unreliable, expensive feature where a boring reliable one would have shipped weeks earlier.

This is the most common way I see AI budgets wasted. So here is how to catch it before you build.

## The tell: you know the answer in advance

The simplest test. If, for any given input, there is one correct output that you could describe with a rule, you do not need a model. You need the rule.

"Flag orders over 10,000 euros from new customers" is a WHERE clause, not a classifier. "Route this ticket to billing if it mentions an invoice" is mostly keyword matching with a small model as a fallback, not a full LLM pipeline on every ticket. The moment you can write down the logic, an LLM is the slower, pricier, less predictable way to run it.

## What LLMs are actually good at

Language models earn their cost on problems that are genuinely fuzzy: free text that does not fit a schema, tasks where the input varies infinitely, judgement calls where "close enough" is the goal and there is no single right answer. Summarising a messy support thread. Extracting structured data from documents that are all laid out differently. Drafting a first version of something a human will edit.

Notice what these have in common. The input is unstructured, the output tolerates variation, and a human was doing it slowly before. That is the sweet spot. Push outside it and every strength becomes a liability.

## The three questions I ask before building

1. **Could a rule or a query produce the right answer?** If yes, build that. You can always add a model later for the long tail.
2. **Does this run once, or a million times a day?** A model in a rarely-used admin tool is fine. The same model in a hot path is a latency and cost problem you will be managing forever.
3. **What is the cost of being wrong?** LLMs are probabilistic. If a wrong answer is embarrassing, fine. If it moves money or makes a legal claim, you need deterministic guardrails around the model, or no model at all.

## The hybrid that usually wins

The best designs are rarely all-or-nothing. Do the deterministic 90% with code and a database, and call the model only for the genuinely ambiguous 10%. Classify with a rule first, fall back to the model when the rule is unsure. This keeps your costs down, your latency predictable, and your model doing the one thing it is uniquely good at instead of impersonating a WHERE clause.

## Why this matters more in 2026

Model calls are cheaper than they were, which makes over-engineering easier to hide. A feature that makes an unnecessary LLM call still works in the demo and still passes review. The cost shows up later, as latency you cannot explain, a bill that grows with usage, and a feature that fails in ways plain code never would.

Good AI engineering is as much about knowing when not to use a model as when to use one. If you have a feature on the roadmap and you are not sure which side of that line it sits on, that is exactly the question worth answering before you build it, not after.
