---
title: "LLM Cost Spike in Production: The 5 Causes That Explain It"
description: "An LLM cost spike in production is rarely user growth. Here are the five real causes, how to find them fast, and the dashboard that catches the next one."
published: "2026-10-04"
tags: ["LLM cost spike production", "AI kostenbeheersing", "LLM observability", "prompt caching", "AI productie"]
ogImage: "/images/blog/llm-cost-spike-production/cover.jpg"
primaryService: "hardening"
---
Take a bill that went from €3,400 in one month to €11,900 the next, while request volume rose 18%. Divide: cost per request went from about €0.0057 to about €0.0168, nearly triple. That single division is the most useful twenty seconds you will spend on an LLM cost spike in production, because it tells you immediately that this is not a growth story. Something in the system started spending more per unit of work, and the explanation lives in your code, not in your funnel.

I run this triage often enough that the shortlist barely changes. In almost every case the cause is one of five things, and in maybe a third of cases it is two of them compounding. None of them require clever analysis to find. They require someone to look at per-request token counts instead of the monthly total.

Here is the order I look in, the fix for each, and the dashboard I leave behind so finance is not the alerting system.

## "We just have more users" rarely survives the division

Growth is a linear story. Costs that rise linearly with traffic are boring and usually fine. What makes a bill spike is something multiplicative: a longer prompt on every call, an extra turn in a loop, a cache that stopped absorbing reads, a route that moved to a model costing several times more per token.

So before you open a single dashboard, get two numbers for the current period and the previous one: total spend and total billable requests. If cost per request is flat and volume doubled, you have a capacity planning conversation and you should be reading about [what a production LLM feature actually costs to run](/en/blog/cost-of-production-llm-2026) rather than doing incident triage. If cost per request moved, you have a leak and the rest of this applies.

One more split worth doing on day one: input tokens versus output tokens. Output is the expensive side on every major provider, typically several times the input rate, and reasoning tokens from extended-thinking models bill as output even though users never see them. A spike that is almost entirely output tokens points somewhere very different from a spike that is almost entirely input.

## Where an LLM cost spike in production actually comes from

Five causes, in rough order of how often I find them: unbounded context, uncapped retry and agent loops, a default route to the most expensive model, a prompt cache that silently stopped hitting, and traffic nobody counted as traffic. Everything else I have seen (an image-heavy input path, a vendor repricing, a batch backfill left running) is a variant of one of these.

![LLM Cost Spike in Production: The 5 Causes That Explain It](/images/blog/llm-cost-spike-production/1.jpg)

The reason this list is short is that token spend has only three dials: how many tokens go in, how many come out, and how many times you pay for them. Every real cause is a dial that moved. When you frame it that way, triage becomes mechanical instead of speculative.

## Mistake: letting context grow until the bill measures it for you

The classic shape is a chat or agent loop that resends the full conversation on every turn. Turn one sends 2k tokens, turn fifteen sends 30k, and the total tokens billed across a conversation grows with the square of the turn count, not linearly. A product change that pushed average session length from four turns to twelve does not increase context window cost by 3x. It increases it by closer to 9x, and your request count barely moves, which is exactly why the cost per request metric catches it.

RAG systems have their own version. Someone raised `top_k` from 5 to 12 to fix a recall complaint, chunk size was already generous, and now every single query carries four times the retrieved text. The retrieval quality improvement was real. Nobody priced it.

What to check today:

- p50, p95 and max input tokens per request for this week versus four weeks ago. If p95 moved more than p50, a subset of your traffic is dragging the average.
- The longest live conversation in your system. Not the average, the worst one. I have seen single sessions pass 200k input tokens because the history was never truncated and the model's context limit was the only cap in the system.
- Any prompt field that interpolates a whole document, a whole table dump, or a whole previous response.

The fixes, cheapest first. Cap history explicitly: last N turns plus a rolling summary, with N chosen by eval score and not by vibes. Trim retrieved context with a reranker so you pass five strong chunks instead of twelve mediocre ones, which usually improves answer quality too. Put a hard token budget check in the client before the call, and log or reject anything above it rather than quietly paying. And stop sending the full tool schema set on every call when the route only has access to three tools.

## Mistake: retry and agent loops nobody capped

Retries are the fastest way to multiply a bill, because a retry is a full repriced call. An SDK default of three attempts with backoff means a provider degradation that pushes your timeout rate from 0.5% to 20% takes your spend up with it, and the user-visible symptom is latency, not cost. If you have been chasing [a latency regression in the same period](/en/blog/llm-latency-audit-production), check whether your retry rate explains both at once.

Agent loops are worse because they are intentional. A ReAct-style agent with no iteration ceiling will happily spend fifty tool calls deciding it cannot answer. Each of those calls carries the full accumulated scratchpad, so you get the context growth problem and the loop problem simultaneously.

Fix it with limits that exist in code rather than in intention. A `max_iterations` on every agent graph, with a logged terminal state when it trips, so you can see how often agents hit the ceiling. Retries only on genuinely retryable errors: never retry a 400, and treat a content filter refusal as a result, not a failure. A per-request token budget that aborts the loop when exceeded. And a circuit breaker, because during a provider incident the correct behaviour is to degrade the feature, not to buy the same answer six times.

## Mistake: routing everything to the biggest model by default

Default routes are set during the demo, when you want the best possible output and volume is zero. Then volume arrives and nobody revisits it. The gap between a frontier model and a small one is often an order of magnitude per token, which means route selection is usually the single largest lever in LLM cost optimization, larger than any prompt trimming you will do.

The part teams get wrong is swinging to the cheap model everywhere and accepting a quality regression they cannot measure. Do it the other way round. Split your traffic by task, which you can do in an afternoon with your request logs: classification and extraction, short structured responses, long reasoning, user-facing prose. Then move one segment at a time to a smaller model and run your eval suite before and after. If you do not have an eval suite, that is the real finding, and it is the same gap that makes [every other production problem hard to diagnose](/en/blog/what-breaks-in-ai-production).

One honest caveat on cheap models: a smaller model that needs two passes or a longer prompt to get the same result is not cheaper. Measure cost per successful task, not cost per token.

## Mistake: caching that quietly stopped working

Prompt caching is the only optimisation on this list that can break without anyone touching the caching code. The cacheable part of a request is the prefix, so the cache only works if the beginning of your prompt is byte-identical across calls. Insert a timestamp, a user name, a session id or a freshly shuffled set of few-shot examples near the top of the system prompt, and every request becomes a cache miss. Worse, on providers that charge a premium for cache writes, you can end up paying more than you would have with no caching at all.

The other quiet failure is TTL. Anthropic's prompt cache expires five minutes after last use by default, with a one-hour option. A traffic pattern of one request every eight minutes per tenant produces a near-zero hit rate while looking perfectly healthy in your application metrics.

What to verify: your provider's cache read and cache write token counts per request, as a ratio. If cache reads dropped off a cliff on a specific day, diff your prompt templates around that date. Also check whether semantic or exact-match response caching is still in front of the model at all, since a Redis eviction policy change or an expired cache cluster will not raise a single application error. It will just triple your AI API cost.

## Mistake: counting only the traffic that has a user attached

The last one is not really a bug, it is a blind spot. Your cost dashboard measures user requests. Your bill measures all requests. The difference is made up of eval suites running on every CI commit, nightly reindexing jobs that call an embedding or summarisation model on the full corpus, a backfill someone started on a Thursday and forgot, a staging environment pointed at the production API key, and in a few cases abuse: an unauthenticated endpoint being used as a free LLM proxy.

Separate API keys per environment and per job type, today. It takes an hour and it converts "we have no idea where the money went" into a readable breakdown forever. Rate limit any endpoint that reaches a model, including internal ones. And give every background job a spend ceiling, because a reindex that costs €40 is fine and the same reindex looping on a malformed document for nine hours is not.

## The dashboard that catches the next one before finance does

After the leak is plugged, the work that actually prevents a repeat is instrumentation. Provider billing consoles are the wrong tool: they aggregate, they lag by hours to a day, and they cannot tell you which feature spent the money. What you want is cost attribution at the request level, emitted by your own code.

The fields I log on every model call:

- model name and version, prompt template id and version, route or feature name, tenant id
- input tokens, output tokens, cache read tokens, cache write tokens
- computed cost, derived from a price table you own in config, not hardcoded
- retry attempt number, agent iteration count, terminal reason
- environment and job type

From those fields you get the four charts worth having on a wall: cost per request over time, token usage split into input and output, cache hit ratio, and spend by feature. Then set alerts on rates rather than totals. Daily spend above 1.5x the trailing seven-day median, p95 input tokens above your budgeted ceiling, cache hit ratio below its floor, agent iteration ceiling hit more often than some small percentage of calls. Budget alerts at the provider are a backstop, not a detector, because by the time a monthly threshold trips the money is gone. This is the same plumbing that makes quality regressions visible, which is why I treat [cost and observability as one piece of work](/en/blog/llm-observability-production-monitoring) rather than two projects.

Realistically, finding the leak takes a day or two if the logs exist and a week if they do not. Capping loops and fixing cache keys is a few days of work. Re-routing traffic by task with evals behind it is the slow part, two to three weeks, because the eval suite usually has to be built first.

## Questions I get asked during this triage

**I only have provider-level billing. Can I still find the cause?**
Partly. You can get the input/output token split and often the per-model breakdown from the provider, which narrows it to two or three candidates. What you cannot get is per-feature attribution, so the first fix is usually splitting API keys by environment and job, then adding request-level logging. Expect to instrument before you can fully explain.

**Is switching to a cheaper model the fastest fix?**
It is the biggest lever, but rarely the fastest safe one, because you need evals to know what you gave up. If the bill is urgent, cap loops and trim context first. Those are bounded changes with predictable quality impact. Then do routing properly over the following weeks.

**Does prompt caching reduce cost or just latency?**
Both, when the prefix is genuinely stable and reused inside the TTL. Cache reads are a fraction of the normal input rate, while cache writes cost more than an uncached call on some providers. So caching a prompt that is used once per hour with a five-minute TTL makes the bill worse. Check your hit ratio before assuming it helps.

**How do I keep this from happening again after the fix?**
Treat cost as a tested property. Put a token budget assertion in your eval suite so a prompt change that doubles context fails CI, log cost per request, and alert on cost per request rather than on the monthly total.

If your bill already spiked and the logs are not there to explain it, that is the cost-control and monitoring work in a **Production Hardening** engagement: three to six weeks to find the leak, cap the loops, fix the caching and routing, and leave you with evals, request-level cost attribution and alerts that fire before finance does. The scope is on the [services page](/en/services), and if you need an answer by Friday, [send me the shape of the problem](/en/contact) and I will tell you what I would check first.
