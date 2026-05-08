---
title: "What actually breaks when AI hits production: a punchlist from 2.5 years"
description: "Seven failure modes I see most often when AI features go from working in dev to running 24/7 in production. Concrete fixes, no theory."
published: "2026-05-08"
tags: ["production AI", "AI engineering", "operations", "reliability"]
ogImage: "/og-image.png"
primaryService: "hardening"
---

Two thirds of organisations have AI in development. Fewer than one in four have it running reliably in production. That gap is the most expensive thing in the AI engineering market right now, and almost nobody writes about what actually closes it.

I have spent two and a half years as the sole engineer on an AI computer-vision platform that runs 24/7 in industrial production. Real users, real money, real stakes when the model is wrong. This post is the punchlist of failure modes I keep seeing across that work and adjacent client engagements. Seven categories. Each one has crashed an AI feature I or someone I have talked to ran. Each one has a fix. None of them are theoretical.

If you are reading this with an AI demo that works on your laptop and a roadmap that says "ship to production by Q3", save this page.

## 1. Vendor model behaviour changes overnight

You wake up Tuesday and a feature that worked Monday is now returning malformed JSON. You did not change anything. The vendor pushed a model update.

This happened twice in 2025 (OpenAI tweaked GPT-4 turbo to add a leading newline before JSON, Claude Sonnet shifted its summary structure under instructions) and once already in 2026. If your output parsing is tight, you break. If it is loose, you waste tokens and time on retries.

**Fix.** Two layers. First, pin model versions where the vendor allows it (snapshot models like `gpt-4-2024-12-...` style versions, not just `gpt-4`). Second, parse with intent, not regex. Ask the model for a strict format AND validate via JSON schema, with one automatic retry on parse failure. Log every parse failure. When you see a spike, you have caught a vendor drift the same day.

## 2. Rate limit cliffs at peak load

A LangChain analysis showed 60% of LLM call errors in February 2026 were caused by exceeded rate limits. That is not an edge case. That is the dominant production failure mode right now.

The pattern is always the same. Your dev environment hits the API casually. Your evals run sequentially. Your demo works fine. Then production ships, real users arrive in bursts, and your queue floods the vendor's per-minute quota. Errors cascade. Retries make it worse.

**Fix.** Three things in order. First, request a higher rate limit before launch. Most vendors lift quietly if you explain the use case. Second, queue and concurrency-limit at your edge. Do not let your code make more requests per second than the limit allows. Third, exponential backoff with jitter on 429s. Never linear retry, never instant retry. If your concurrency control is correct, the third thing barely fires.

## 3. Prompt regression after a "small" change

You tweak a prompt to fix one weird output. Two weeks later, you notice three other outputs got worse. Then you cannot reproduce the original good behaviour because you do not have the old prompt anywhere.

This is the single biggest reason teams "feel like the AI got worse" without being able to prove it. They are right. It did. They just do not have the data to show why.

**Fix.** Treat prompts like code. Version them in git. Run an eval suite of 50 to 200 representative prompt-input pairs on every change, with a passing threshold. Do not ship a prompt that drops below the threshold without an explicit "I accept this regression" decision logged. The eval set takes a day to build the first time. After that it pays back forever.

## 4. Retrieval goes stale and your team thinks it is fresh

Your RAG indexes 1,400 documents on launch. Six weeks later, the docs are at 1,540. Your index is still at 1,400. You answer a customer question with information that is two weeks old. The customer files a ticket.

This is context staleness, and it is the most common quality complaint I see in shipped RAG systems.

**Fix.** Build the re-indexing pipeline before launch, not after. Cron-based for slow-moving sources like knowledge bases and contracts. Webhook-triggered for fast-moving ones like Notion or Confluence pages. Surface "indexed at" timestamps in admin tooling so somebody can verify. And add an eval question whose correct answer is "I do not have current information about that". Your retrieval should know its limits, and you should be able to tell when it stops knowing.

## 5. Cost runs away in an agent loop

You build an agent. It can call tools. It can call itself. Then a user asks an ambiguous question and the agent spends 47 turns calling sub-tools, racking up 18 euros in tokens for a single conversation. Multiply by 200 users.

Agent cost runaway is the production failure that is the most expensive and the easiest to miss because it is not an error. It is just an invoice.

**Fix.** Hard limits at three layers. First, max turns per conversation. Eight to twelve is plenty for most use cases, way more than that means you are using the wrong architecture. Second, max token budget per session, enforced at your wrapper. Third, daily and weekly cost dashboards with alerts at thresholds you set before launch. If you cannot tell me your cost per 1000 sessions within an order of magnitude, you do not have cost monitoring.

## 6. Evals pass, production breaks, and you are holding two truths

This is the failure mode I have seen most often in the last year. Your eval suite passes. Real users complain. You re-run your evals, still passing. The mismatch makes you doubt your evals AND your users at the same time.

What is actually happening: your eval set was built from idealised inputs, not real ones. Production users misspell, paste broken context, ask in two languages mid-sentence, attach images at unexpected resolutions. Your eval saw none of that.

**Fix.** Continuous eval-from-production. Sample 1 to 3% of real production interactions, scrub for PII, score them with the same eval rubric as your dev set, and feed the new examples back into your eval suite weekly. After a quarter of this, your eval is real. Before this, it is wishful thinking.

## 7. Inference latency under real concurrent load

Single-request latency is fine. Ten requests at once and your p95 jumps from 1.2s to 14s. Your users notice. Some of them leave the page before the response arrives.

This is mostly a serving problem, especially for self-hosted models on GPUs. The single-request happy path uses one batch slot. Concurrent requests queue and the batch logic might not be optimised for your traffic pattern.

**Fix.** Three knobs. First, profile under realistic concurrency, not just single-call benchmarks. Vendor-hosted APIs need their own load test against your actual prompts and lengths. Self-hosted serving (Triton, vLLM, and similar) needs batching configured for your traffic. Second, fall back gracefully. If p95 starts climbing, return a "we will get back to you" path or switch to a smaller cheaper model. Third, monitor latency p50, p95, p99. Averages lie at this layer.

## The pattern across all seven

Every one of these failure modes shares the same underlying cause. The system was tested in conditions that do not match production, and the gap was discovered only when real traffic hit. Fixing each requires the same engineering discipline: a real eval, real instrumentation, and the willingness to put hard limits on a system that was designed without them.

This is not glamorous work. It is the difference between a feature that ships and a feature that gets pulled at week three because the team cannot keep it up.

## How I help

If three or more of these failure modes match where you are, that is not bad luck. That is a system that was not designed for production from day one, which is most systems.

Two of my engagements are built specifically for this:

- **POC Audit** (one week, fixed price). I look at your stack and map exactly which of these seven (or others) are about to bite you. You leave with a written report and a 90-day plan.
- **Production Hardening** (3 to 6 weeks). I work alongside your team to actually fix the failure modes. Eval suite, monitoring, cost controls, prompt versioning, retrieval freshness, the lot.

If you are reading this and recognise three or more, [let us talk](/contact). A 15-minute call is usually enough for both of us to know which of the seven you are standing on.

## Related reading

- [RAG vs fine-tuning: a 20-minute decision](/blog/rag-vs-fine-tuning-decision-flowchart). Decide what to use before you worry about scaling it.
- [How to hire an AI engineer in the Netherlands](/blog/hire-ai-engineer-netherlands). The hiring side of the same problem. Who actually has the production scars.
