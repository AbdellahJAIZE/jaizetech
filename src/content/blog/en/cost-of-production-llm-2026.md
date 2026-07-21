---
title: "What it really costs to run a production LLM feature in 2026"
description: "Token spend is the smallest line on the bill. Here are the hidden costs of taking an LLM feature live, with rough numbers from real systems."
published: "2026-04-10"
tags: ["LLM economics", "production AI", "AI engineering", "cost"]
ogImage: "/og-image.png"
primaryService: "hardening"
---

Every CTO I have talked to in the last six months has asked the same question. What does this actually cost to run? Not the OpenAI bill. The whole thing.

The honest answer is that token spend is the smallest line. Eval reruns, monitoring, vendor model upgrades, on-call hours, and the rate-limit dance together cost more than the API calls in most production setups I have seen. This post breaks down what each of those line items looks like in 2026, with numbers from real systems I have worked on or audited.

If you are budgeting a production LLM feature for next quarter, save this page.

## The line items nobody puts on the slide

Six cost categories that show up in a production LLM bill. Each one is easy to miss in a build estimate.

### 1. Token spend including retries

The obvious one. Prompt tokens plus completion tokens, multiplied by your traffic.

What is not obvious is the retry overhead. Vendor rate limits, transient 5xx, parse failures on malformed JSON, agent loops that time out. Each one re-bills tokens. In one audit I ran on a chatbot doing 80,000 sessions per month, retries were 18 percent of total spend. Eight thousand euros a month wasted on retries that succeeded on attempt two or three.

Rough numbers for a mid-tier chatbot in 2026: 4,000 tokens per session blended. At gpt-4o-mini rates that is around 0.0006 euro per session. 80,000 sessions a month is 48 euros pure API. Sounds great. Add 18 percent retry overhead and you are at 57 euros. Still cheap.

But this is the smallest number on the bill. Wait for the rest.

### 2. Evaluation reruns

This is where it gets expensive.

Every prompt change reruns the eval suite. Every model version change reruns the eval suite. Every weekly QA reruns the eval suite. If your eval set is 200 examples and each takes 4,000 tokens, one full pass costs around 0.20 euro at gpt-4o-mini rates. Forty reruns a month from active development is about 8 euros. Cheap.

But if you eval with a stronger model than you serve with (a common pattern, you serve gpt-4o-mini and eval with gpt-4 or Claude Sonnet), the cost is 10 to 30 times higher per call. Same 40 reruns becomes 80 to 240 euros a month.

If you swap to a frontier model for eval, account for it explicitly. Most teams forget this until the bill arrives.

### 3. Monitoring stack

You need something watching your LLM calls. Options in 2026, with rough monthly costs at the 80,000-session scale:

- Helicone or Langfuse self-hosted: 0 euro plus your infra
- Helicone or Langfuse cloud: 30 to 200 euro depending on tier
- Datadog APM with LLM observability addon: 200 to 600 euro
- Homegrown logging to your own warehouse: free in tooling, 1 to 2 days of engineering per month to maintain

Most teams underbudget this. They start with raw logs in Postgres and discover three months in that they have no way to answer "what was our parse-failure rate last week" without writing custom queries.

### 4. Vendor model upgrades forcing retests

OpenAI deprecates a model. Anthropic releases a new one. The frontier moves and you have to retest your prompts against the new version because the old one is being sunset.

This is not a recurring monthly cost. It is a quarterly tax. Plan for one to three days of focused engineering per quarter to retest, port, and possibly re-tune your prompt against the new model. At a 100 euro per hour engineer cost that is 800 to 2400 euros per quarter. Roughly 267 to 800 euros per month amortised.

This is the cost line that ambushes finance teams. It does not appear in any vendor invoice. It appears as "why is our engineering velocity dropping in Q3".

### 5. On-call coverage

If your LLM feature is in the critical path of a paying customer experience, somebody needs to wake up when it breaks. That means PagerDuty or equivalent (50 to 100 euro per month for a small team), plus the actual engineering hours.

Realistic incident rate in the first six months of production: one minor incident per week, one major per month. Minor is 30 to 60 minutes to triage. Major is 3 to 6 hours of focused work plus a writeup. At 100 euro per hour, that is roughly 400 to 800 euros per month in incident-response cost alone.

This drops after six months as you harden the system, but it never goes to zero.

### 6. The infrastructure around the LLM call

Vector database for RAG. Queue for async processing. Cache for repeated calls. File storage for uploads. CDN for outputs that get served to users. Each of these has a cost.

Rough monthly numbers for a mid-tier RAG application:

- Vector DB (Pinecone serverless or Qdrant cloud): 30 to 150 euro
- Redis cache: 20 to 80 euro
- Queue (SQS or BullMQ on Redis): 0 to 30 euro
- File storage (S3): 5 to 50 euro
- CDN: 10 to 100 euro depending on traffic

Easily 65 to 410 euros a month for the surrounding infrastructure. Often more than the API calls.

## Worked example, three system shapes

To put it together, here is what three production-grade LLM features cost per month at scale. All numbers are blended estimates from systems I have audited or built, with the actual organisation details abstracted out.

### Small chatbot, 80,000 sessions per month

- API tokens including retries: 60 euro
- Eval reruns with frontier model: 250 euro
- Monitoring (Helicone cloud): 80 euro
- Quarterly vendor-upgrade amortisation: 400 euro
- On-call (PagerDuty plus engineer time): 500 euro
- Infrastructure around (cache, storage, CDN): 80 euro

**Total: ~1,370 euro per month.** Of which API calls are 4 percent.

### Mid-tier RAG knowledge base, 12,000 queries per month, 8,000 documents indexed

- API tokens including retries: 200 euro
- Eval reruns: 300 euro
- Monitoring: 100 euro
- Vendor upgrade amortisation: 500 euro
- On-call: 800 euro
- Infrastructure (vector DB, cache, storage): 200 euro
- Re-indexing pipeline runs: 100 euro

**Total: ~2,200 euro per month.** Of which API calls are 9 percent.

### Multi-step agent, 3,000 sessions per month, average 8 LLM calls per session

- API tokens including retries and loop overhead: 600 euro
- Eval reruns (more expensive because agent paths are complex): 600 euro
- Monitoring including trace storage: 250 euro
- Vendor upgrade amortisation: 600 euro
- On-call (agents fail in more interesting ways): 1,200 euro
- Infrastructure: 200 euro

**Total: ~3,450 euro per month.** Of which API calls are 17 percent.

## Where to cut without breaking things

The pattern is the same across all three shapes. The big spend is operational, not computational. So the cuts that move the needle are operational too.

**Cut eval frequency, not eval quality.** Run the full suite weekly and on prompt changes, not on every commit. Same coverage at half the cost.

**Right-size your monitoring.** If you have fewer than 100,000 calls a month, self-hosted Langfuse on a small VPS does everything Datadog does for your use case. The 100 euro a month difference is the difference between profitable and not at small scale.

**Pin your models.** Snapshot model versions where the vendor allows it. Pinning means no surprise quarterly retest tax. The cost is missing minor improvements, which most teams can tolerate.

**Reduce retry rate with concurrency control at your edge.** I described this in [what actually breaks when AI hits production](/blog/what-breaks-in-ai-production). A queue with a per-second rate limit kills 90 percent of retries.

**For agents, hard cap turns and budget.** Most agent runaway is a single ambiguous query that spirals for 40 turns at 0.6 euro per turn. Cap at 8 to 12 turns and your worst case is bounded. Cap budget per session as a backstop.

**Cache common responses.** For chatbots especially, the top 200 questions account for 40 to 60 percent of traffic in most systems. A Redis cache that recognises near-duplicate queries via embedding similarity pays back in weeks.

## What this means for budgeting

If a vendor pitches you on "AI features for 50 euros a month in API costs", they are quoting the smallest line on the bill. Multiply by 20 to 30 to get the real operational cost. That is what production-grade reliability actually costs.

A useful rule of thumb for budgeting a new LLM feature in 2026: take the API estimate, multiply by 25, and that is your first-year monthly run rate. Adjust down as you harden the system over months four through twelve.

If you want help running this analysis on a feature you are about to ship, that is part of what I do in an [AI integration audit](/services). The output is a number you can put in front of your CFO with the workings shown.

The biggest mistake I see is teams treating LLM features as software that happens to have an API call. They are software that happens to have an operational surface most engineering teams have never run before. That surface is where the bill actually lives.
