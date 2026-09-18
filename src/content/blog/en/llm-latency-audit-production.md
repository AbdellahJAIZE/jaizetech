---
title: "LLM Latency in Production: Find the Real Bottleneck"
description: "Most LLM latency production issues aren't the model. Instrument five pipeline stages, set budgets, and fix the real bottleneck this week."
published: "2026-09-18"
tags: ["LLM latency", "AI production", "observability", "performance engineering", "AI engineering"]
ogImage: "/images/blog/llm-latency-audit-production/cover.jpg"
primaryService: "hardening"
---
Your AI feature passes evals. The answers are right. And the ticket in front of you says "it feels slow", with no number attached, from a customer who is not wrong. When you ask the team where the time goes, you get three different guesses: the model, retrieval, "probably the framework". Nobody has measured it, because nobody has a place to look.

I have been through this on enough production systems to know the pattern. Latency is almost never a model problem. It is a pipeline problem, and pipelines can be debugged. This is my LLM latency production audit: break the request into stages you can time separately, set a budget per use case, apply the fixes that cut real seconds, and put monitoring in place so the next regression shows up on a dashboard before it shows up in a support ticket.

Everything here you can do yourself in a week. The instrumentation is a few dozen lines. The hard part is deciding to treat "it feels slow" as a bug with a root cause instead of a property of AI.

## The moment "it feels slow" lands and nobody can say where the time goes

Here is what I typically find on the first day. A chat feature that takes somewhere between 2 and 14 seconds to answer, with no pattern the team can explain. A single trace, if tracing exists at all, that shows one span called `llm_call` wrapping everything. A Slack thread from three weeks ago where someone proposed switching to a faster model, and someone else proposed a bigger vector database, and both proposals are still open because nobody could prove either would help.

The inconsistency is the tell. If the model were the bottleneck, latency would be roughly proportional to output length and fairly stable. Wildly variable latency means something in the path is sometimes cheap and sometimes not: a retrieval call that occasionally hits a cold index, a tool loop that runs one iteration on Monday and five on Tuesday, a retry hidden inside a client library, a reranker that gets 20 documents on one query and 200 on the next.

The team cannot see any of this because they measured the feature the way you measure a normal API: total request time. That number tells you a problem exists and nothing about where. I wrote about the broader punchlist in [what actually breaks when AI hits production](/en/blog/what-breaks-in-ai-production); latency is the item on that list that gets misdiagnosed most often, because the obvious suspect, the model, is usually innocent.

## Set an LLM latency production budget before touching anything

You cannot optimise toward "faster". You can optimise toward a number, and the number depends entirely on what the feature is. The first thing I do on a latency engagement is write down a budget per use case, in milliseconds, and get the product owner to sign it. This sounds bureaucratic. It is the step that stops the team from spending two weeks shaving 300 ms off a background job nobody is waiting for.

![LLM Latency in Production: Find the Real Bottleneck](/images/blog/llm-latency-audit-production/1.jpg)

The budgets I actually use, from experience rather than any published standard:

- **Chat with streaming.** Time to first token under 1 second, ideally under 600 ms. Once tokens are flowing, users tolerate a long answer. Before the first token, every 100 ms is felt.
- **Chat without streaming, or a single-shot answer in a form field.** Total under 3 seconds, and a visible loading state from the first 200 ms. Above 5 seconds users start retrying, which doubles your load and your cost.
- **Voice.** Under 800 ms from end of the user's speech to start of the reply, or the conversation feels broken. I put the component numbers in the [voice AI benchmarks post](/en/blog/voice-ai-b2b-livekit-openai-realtime-benchmarks); this post is about the pipeline around those components, not the components themselves.
- **Background jobs: document extraction, classification, nightly enrichment.** Throughput and cost, not latency. A 20-second document is fine if you process ten thousand of them in parallel.
- **Autocomplete and inline suggestions.** Under 300 ms or do not ship it. This is the one budget where a small model is not a compromise, it is the design.

Write the budget as two numbers: p50 and p95. The p95 is the one users remember. A feature with a 1.5-second median and an 11-second p95 "feels slow", because one in twenty requests is a bad experience and everyone hits one in their first session.

## Instrument the pipeline: five stages, five timers

Once you have a budget, split the request into the stages that actually exist in your code and time each one independently. For nearly every LLM feature I have audited, it is these five:

1. **Network in and out.** Client to your API, your API to the model provider, and back. From the Netherlands, a round trip to a US-East endpoint is in my experience roughly 90 to 120 ms before any work happens; to an EU region, 10 to 30 ms. If your provider offers an EU endpoint and you are not using it, that is 100 ms per call, times the number of calls in the request.
2. **Retrieval.** Embedding the query, the vector search, any keyword search, the reranker. Each of these is a separate timer. The embedding call alone is a network round trip to a model.
3. **Orchestration.** Everything your framework does between steps: building prompts, parsing outputs, deciding which tool to call, serialising state. Teams assume this is zero. It is not, especially in agent frameworks with a lot of abstraction between your code and the HTTP call.
4. **Model call.** Split into time to first token and generation time. These have different causes and different fixes. Time to first token is dominated by prompt length and provider queueing; generation time by output length and model speed.
5. **Streaming and post-processing.** Time from the model's last token to the user's screen: output parsing, guardrail checks, a JSON validation step, a second "formatting" call somebody added in month three.

The implementation does not need a vendor. OpenTelemetry spans with one attribute per stage, exported to whatever you already run, is enough:

python
with tracer.start_as_current_span("retrieval") as span:
    t0 = time.perf_counter()
    q_emb = embed(query)
    span.set_attribute("retrieval.embed_ms", (time.perf_counter() - t0) * 1000)
    t1 = time.perf_counter()
    docs = vector_search(q_emb, k=20)
    span.set_attribute("retrieval.search_ms", (time.perf_counter() - t1) * 1000)
    t2 = time.perf_counter()
    docs = rerank(query, docs)
    span.set_attribute("retrieval.rerank_ms", (time.perf_counter() - t2) * 1000)
    span.set_attribute("retrieval.doc_count", len(docs))

with tracer.start_as_current_span("model") as span:
    t3 = time.perf_counter()
    first_token_at = None
    for chunk in client.stream(prompt):
        if first_token_at is None:
            first_token_at = time.perf_counter()
            span.set_attribute("model.ttft_ms", (first_token_at - t3) * 1000)
        yield chunk
    span.set_attribute("model.gen_ms", (time.perf_counter() - first_token_at) * 1000)
    span.set_attribute("model.prompt_tokens", usage.prompt_tokens)

Record the input sizes alongside the timings: prompt tokens, number of retrieved documents, number of tool iterations. Half the time the root cause is "this stage is fine at 2,000 tokens and terrible at 30,000", and you can only see that if the size is on the same trace as the time.

After a day of real traffic, you have a stacked breakdown per request and, more importantly, per p95 request. In my experience the p95 breakdown surprises the team almost every time. The model is usually 30 to 50 percent of the wall clock. The rest is retrieval, orchestration, and calls that did not need to be sequential.

## Five fixes that cut real time without touching the model

With the breakdown in hand, these are the fixes I reach for first. They are ordered by how often they produce the biggest win, and none of them requires changing the model.

**1. Stream, and stream from the first stage that produces user-visible output.** If you are not streaming, this is the single biggest perceived-latency improvement available and it costs an afternoon. If you are streaming but buffering the whole response to validate it before sending, you are not streaming. Validate incrementally, or validate after the fact and correct on the rare failure.

**2. Cache at three levels.** Prompt caching on the provider side for the static system prompt and the few-shot examples, which cuts time to first token noticeably on long prompts and cuts cost more. An embedding cache keyed on normalised query text, because users ask the same fifty questions. A response cache for genuinely identical requests, with a short TTL, for the FAQ-style traffic that is 10 to 30 percent of most assistants.

**3. Run independent calls in parallel.** Embedding the query and loading user context. Vector search and keyword search. Two tool calls that do not depend on each other. I regularly find chains where four calls run sequentially and two of them could start at time zero. `asyncio.gather` is not exotic; it is just not the default in most framework examples.

**4. Use a smaller model for sub-tasks.** Query rewriting, intent classification, "does this need retrieval at all", output formatting. These do not need the frontier model that writes the final answer. A small model answers a classification prompt in a few hundred milliseconds where the big one takes over a second, and it is cheaper by an order of magnitude. This is the same discipline as [running a continuous eval loop](/en/blog/llm-evaluation-production-continuous-eval): you can only swap the model on a sub-task safely if you have an eval for that sub-task.

**5. Trim the prompt.** Time to first token scales with input tokens. Retrieving 20 chunks and stuffing them all in when the top 5 carry the answer costs you both latency and accuracy. A 12,000-token system prompt that grew by accretion over a year is a latency bug. Measure prompt tokens per request, set a ceiling, and treat exceeding it as a failing test.

Every one of these moves the p50 and the p95 together. Watch for the fixes that only move one: a bigger connection pool that helps the median and does nothing for the tail is not a latency fix, it is a load fix.

## When the fix is re-architecture, not tuning

Sometimes the trace shows a shape that no amount of caching will save. Three patterns come up repeatedly.

**The sequential chain that should be one call.** Rewrite the query, then classify intent, then retrieve, then generate, then summarise, then format: six model calls in series, each with its own network round trip and time to first token. The chain exists because it was built one step at a time, each step fixing a quality problem. Often three of the steps collapse into one well-structured prompt with a schema-constrained output, and the p50 halves. The [prompt versioning post](/en/blog/prompt-versioning-regression-testing) covers how to make that collapse without a silent quality regression.

**Redundant retrieval.** The agent retrieves for the first step, then a sub-agent retrieves again for the same question with slightly different wording, then the "verification" step retrieves a third time. I have seen requests with five retrieval calls and one useful one. Retrieve once, pass the results through the state. This overlaps with the quality side, which I covered in [why RAG breaks in production](/en/blog/rag-breaks-in-production); here the point is purely that each redundant call is 200 to 600 ms you are paying for nothing.

**The chatty tool loop.** An agent that decides one tool call at a time, with a full model call between each decision. Five tools means six model round trips, and each one is a time to first token plus generation. Batch the tool decisions where the model can plan them upfront, cap the iteration count hard, and put the cap in the trace so you see when it hits. If the loop needs more than three iterations for the median request, the task is wrongly decomposed and the fix is in the design, not the latency.

The honest signal that you are in re-architecture territory: the stage that dominates the p95 is orchestration, not any single call. Tuning individual calls will not help, because the problem is how many of them there are.

## Monitoring latency so it does not silently regress

Latency regressions are quiet. Nobody changes the model and announces "this will be slower". Somebody adds a guardrail check. Somebody raises `k` from 5 to 20 to fix a recall complaint. The provider has a slow week. A new customer uploads documents ten times larger than anything in your test set. Each of these adds a few hundred milliseconds, and six months later the feature is twice as slow and nobody can name the day it happened.

The monitoring that catches this is not complicated, but it has to exist per stage, not just per request:

- **A dashboard with p50 and p95 per stage**, stacked, over the last 7 and 30 days. One glance answers "what got slower and when".
- **Alerts on the p95 per stage, not on the total.** A total-latency alert fires after users notice. A retrieval-p95 alert fires when the index gets cold or a customer's corpus grows.
- **Input size distributions next to the timings.** Prompt tokens, documents retrieved, tool iterations. When latency moves, the first question is whether size moved with it.
- **Provider time to first token as its own series**, so you can distinguish "our code got slower" from "the provider is having a day". Both happen; the response is different.
- **A latency assertion in CI.** Replay 50 representative requests against staging on every deploy, fail the build if p95 per stage exceeds the budget by more than a set margin. This is the eval loop applied to speed, and it is the only thing I have found that reliably stops the accretion.

Tie the latency dashboard to the cost dashboard. They share a root cause more often than not: the redundant retrieval call is both slow and paid for; the 12,000-token prompt is both slow and expensive. Fixing one side usually improves the other.

## What to ask a vendor, and what you can measure yourself this week

If a vendor or an agency promises a fast AI feature, three questions separate the ones who have done it from the ones who have read about it. First: what is your time-to-first-token p95, under load, from an EU client? A number with a location and a percentile is an answer; "sub-second" is not. Second: where in the pipeline does your p95 time go? If they cannot show a stage breakdown, they do not have one. Third: what happens to latency when the corpus is ten times bigger and the prompt is twice as long? A vendor who has shipped this has a graph.

What you can do yourself, this week, with the code you already have:

1. Add the five stage timers. One day, including getting them into your existing observability stack.
2. Run a day of real traffic and pull the p95 breakdown. Not the average. The p95.
3. Write the latency budget for your main use case and get it signed off.
4. Apply whichever of the five fixes matches the biggest stage in your p95. Usually streaming or parallelism first.
5. Put a p95-per-stage panel on the dashboard the team already looks at.

If after that the p95 is still outside budget and the biggest stage is orchestration, you are in the re-architecture case, and that is a scoped piece of work rather than a tuning session. The [services page](/en/services) describes what that looks like as an engagement.

## Where this becomes an engagement

This is the core of a **Production Hardening** engagement: three to six weeks in which I instrument the pipeline, set the latency and cost budgets with you, apply the fixes in order of measured impact, and leave behind the per-stage monitoring, alerts, and CI assertions that stop it regressing, alongside the evals and prompt versioning that make the changes safe. If your AI feature works but users say it feels slow and nobody can point at the stage that is eating the time, that is exactly the starting point. Read the scope on the [services page](/en/services), or [get in touch](/en/contact) and we will start with your p95 breakdown.
