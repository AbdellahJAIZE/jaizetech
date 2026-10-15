---
title: "LLM API Rate Limits: The Capacity Plan Before Launch Week"
description: "LLM API rate limits fail silently until peak traffic hits. Here's the checklist to measure, monitor, and plan capacity before your next launch."
published: "2026-10-15"
tags: ["LLM API rate limits", "API capacity planning", "LLM observability", "production reliability", "AI infrastructure"]
ogImage: "/images/blog/llm-api-rate-limits-production/cover.jpg"
primaryService: "hardening"
---
Here is the question I ask a team the moment they tell me a marketing push lands in three weeks: at ten times today's traffic, which number do you hit first, and what does a user see in the second you hit it? Most people can answer the first half with a guess. Almost nobody can answer the second half. LLM API rate limits are the ceiling teams discover by accident, usually during the one hour of the year when the traffic is actually worth money.

The failure mode is unglamorous. The provider is healthy, your code is unchanged, the model is the same model it was yesterday. You are simply asking for more tokens per minute than your account is permitted to spend, the API says no, and then your retry logic takes that no and multiplies it. Nothing in your monitoring says "capacity"; it says 429, and 429 looks like a provider problem until you read the docs.

This is a capacity planning problem. It is solvable on a whiteboard in an afternoon, which is a much better place to solve it than in a Slack channel at peak traffic. Below is the checklist I work through when a launch date is already on the calendar.

## Start from your own peak, not the provider's documentation

The number you need is not requests per day. Take the last 30 days of request logs and find the busiest single minute. Daily volume divided by 1,440 will understate your real peak by a factor of five or more, because human traffic arrives in clumps: the hour after an email goes out, the first hour of the European working day, the Monday morning catch-up.

Then measure tokens per request, at p95, not at the mean. A RAG assistant that averages 2,000 input tokens will have a long tail of 15,000-token requests when someone asks a question that retrieves ten long documents. Token-per-minute ceilings are consumed by the tail, which is the same tail that shows up when you investigate [an unexplained cost spike](/en/blog/llm-cost-spike-production).

The third factor is the one teams forget: fan-out. One user action is rarely one API call. A query rewrite, a reranking pass, the answer generation, and a guardrail check is four calls per message. Agents are worse, because the call count per task is variable rather than fixed, which is [a reliability problem of its own](/en/blog/ai-agent-loop-guardrails-production).

Put it together with arithmetic, not vibes. Suppose the campaign brings 12,000 requests in the peak hour, and 40% of those land in the busiest ten minutes. That is roughly 480 requests per minute of user actions. At a fan-out of three calls and a p95 of 6,000 input plus 800 output tokens, you are asking for about 1,440 API calls and close to 10 million tokens per minute. Write those two numbers down. They are the ask you will take to your provider later.

## The three numbers behind your LLM API rate limits

Every major provider enforces separate ceilings, and they are not interchangeable. Requests per minute, input tokens per minute, and output tokens per minute are tracked independently, usually per model and sometimes per region or per deployment. A chat feature with short prompts hits the request ceiling first. A document summarizer with 40-page inputs hits the input token ceiling while using a fraction of its allowed requests. Knowing which of the TPM/RPM limits in production binds first tells you what to optimize, and the answers are different: batching helps one, context trimming helps the other.

![LLM API Rate Limits: The Capacity Plan Before Launch Week](/images/blog/llm-api-rate-limits-production/1.jpg)

The second number lives in the response headers, and in my experience fewer than one team in five logs them. OpenAI returns `x-ratelimit-remaining-requests`, `x-ratelimit-remaining-tokens` and the matching reset values on every call. Anthropic returns `anthropic-ratelimit-requests-remaining` and `anthropic-ratelimit-tokens-remaining`, plus `retry-after` when it rejects you. Log them alongside latency and cost, and your headroom stops being a mystery:

python
resp = client.messages.create(**kwargs)
h = resp.response_headers  # or the raw response in your SDK
log.info("llm_headroom",
    model=model,
    req_remaining=int(h.get("anthropic-ratelimit-requests-remaining", -1)),
    req_limit=int(h.get("anthropic-ratelimit-requests-limit", -1)),
    tok_remaining=int(h.get("anthropic-ratelimit-input-tokens-remaining", -1)),
)

Now you can alert when you have consumed 75% of a window instead of alerting on the first rejection. That is the difference between a warning and an incident, and it belongs in the same dashboard as [the rest of your LLM observability](/en/blog/llm-observability-production-monitoring).

The third number is who else shares the ceiling. Limits apply to an organization, project or deployment key, not to a service. Your nightly eval run, the data team's backfill, the staging environment somebody pointed at the production key, and the live feature all draw from one pool. I have seen a launch degraded by a colleague's one-off script. Separate keys per workload, with their own limits, is a twenty-minute fix that buys you isolation on the day it matters.

## "Catch the 429 and retry" is how one rate limit becomes an outage

Here is the mechanic that turns a brief ceiling-hit into a sustained one. You are at your TPM limit. Four hundred requests get rejected. Your handler retries them after two seconds. Those retried tokens now land in the next window alongside the new organic traffic, so the next window is over the limit too, and it rejects both the new requests and the retries. The queue of pending work grows faster than the window drains. Nothing recovers until traffic falls on its own.

Retries also layer without anyone deciding they should. The official SDKs retry by default (typically twice, with backoff). Your service wrapper retries. Your job scheduler retries the whole job. Your frontend retries on failure, and the user hits refresh. One user action can become a dozen upstream calls during exactly the minute you have no capacity.

What works instead:

- **Respect `retry-after`.** When the provider tells you how long to wait, waiting less is pointless and waiting more is free.
- **Exponential backoff with full jitter**, a cap (30 seconds is usually plenty), and a total deadline per user request. Unjittered backoff resynchronizes your clients into waves.
- **Count your retry layers** and disable all but one. Set the SDK to zero retries if you handle it yourself.
- **Shrink on a token limit, not just wait.** A 429 on TPM is a signal to cut retrieved chunks or truncate history, because the same request will fail again at the same size.
- **Rate limit yourself client side.** A token bucket sized to about 80% of your measured ceiling means you queue internally instead of generating rejections. Requests you never send cost nothing and never storm.

This is a different failure from a provider going down, and it needs a different remedy. [Failing over to a second provider](/en/blog/llm-provider-outage-failover-strategy) is the right answer when Anthropic or OpenAI is degraded. It is the wrong reflex when you are over your own quota, because you will carry the same unbounded retry behaviour to the new endpoint.

## Decide what you shed before you need to shed it

Over the ceiling, something has to not happen. Choosing in the moment means choosing badly, so classify your traffic now into interactive (a user is watching), deferrable (enrichment, summaries, embeddings for documents uploaded ten minutes ago), and internal (evals, backfills, experiments). Under pressure, internal work pauses, deferrable work queues, and interactive work gets whatever is left.

A single chokepoint makes this enforceable. Route every model call through one component that holds the client-side limiter and a priority queue. Request queuing for LLM calls only works if nothing bypasses it, which in practice means one module, no direct SDK imports elsewhere, and a lint rule if your team is large enough to need one.

Then write the degradation ladder, in order, and get the person who owns the customer relationship to sign off on it:

1. Pause internal and batch jobs. Move what you can to the provider's batch endpoint, which has a separate quota pool and a 24-hour window.
2. Serve cached or precomputed answers where the question repeats.
3. Drop to a smaller, faster model for low-stakes paths. A cheaper model with a 10x higher token allowance is capacity, not just savings.
4. Trim context: fewer retrieved chunks, shorter history. This cuts TPM consumption immediately.
5. Bound the queue. Past a depth that implies more than a few seconds of wait, reject fast with an honest message and a retry affordance. A clear "we are at capacity, try again in a minute" beats a 40-second spinner that ends in an error.

Per-tenant fairness belongs in the same component. One enterprise customer's bulk import should not consume the shared ceiling, which is the throughput cousin of [the isolation problems multi-tenant AI features already have](/en/blog/multi-tenant-ai-feature-data-leaks).

## How an LLM API quota increase actually goes

Self-serve tiers mostly move on their own. OpenAI's usage tiers advance based on cumulative spend and time since your first payment, so there is no form to fill in: you qualify or you do not. Azure OpenAI quota is allocated per subscription, per region, per model, and you divide it between your deployments yourself, which means a stranded quota on an unused deployment is a limit you already own. On Bedrock, per-model quotas live in Service Quotas and some are adjustable through a request.

For anything beyond the standard ladder you are talking to a human, and they will ask for the numbers from the first section of this checklist: expected requests and tokens per minute per model, the traffic shape, the use case, and your payment history. Teams that show up with "we need more, it keeps failing" get slower answers than teams that show up with "we need 1,500 RPM and 10M input TPM on this model, peaking weekdays 09:00 to 11:00 CET, here is last month's usage."

Lead time is the part that bites. Plan in weeks, not days, and never make the request in launch week. If you need reserved capacity rather than best-effort access, you are looking at committed options: Azure provisioned throughput units, Anthropic's priority tier, Bedrock provisioned throughput. They trade money and a commitment term for headroom you hold regardless of what other customers are doing, which is worth it for a contractual SLA and overkill for a marketing campaign.

A second provider or a second region, wired up and tested in advance, is also capacity. Two accounts at a comfortable tier beat one account at a stretched tier, and you have the failover path for free.

## The capacity plan to write this week

One page. It takes an afternoon if your logs are decent.

- Measured peak RPM and p95 tokens per request, from real traffic.
- Fan-out factor: API calls per user action, counted in code, not estimated.
- Target multiple (5x, 10x) and the resulting peak RPM and TPM, per model.
- Current limits per model per key, and the headroom percentage at target. Below 100% is the thing you are fixing.
- Every other workload sharing those keys, and which ones get their own key before launch.
- Client-side limiter value, set to roughly 80% of the ceiling.
- Retry policy: one layer, jittered, capped, with a per-request deadline and `retry-after` honoured.
- The shed order, written down and approved.
- Alerts at 75% window consumption and on 429 rate, not just on error rate.
- A load test at 1.5x target for fifteen minutes, against a key with its own spend cap, with the shedding path enabled so you see what users get. Pair this with [a latency breakdown](/en/blog/llm-latency-audit-production), because queueing changes the number your users feel even when nothing fails.
- A kill switch (feature flag) for every non-essential model call.

The test is the part people skip, and it is the only item that converts the plan from a document into a fact.

## Questions that come up the week before a launch

**How do I know which limit I am hitting, requests or tokens?**
The error body usually says, and the headers always do. Log the remaining-requests and remaining-tokens values on every call for a week. Whichever one approaches zero at your peak is your binding constraint, and the two have different fixes.

**Do 429 errors in OpenAI production mean something is wrong with my code?**
Not necessarily. A 429 can mean you exceeded RPM, exceeded TPM, hit a token-per-day cap on some tiers, or have an insufficient-quota billing problem. The last one is not a rate limit at all and no amount of backoff will clear it, so read the error type before you retry.

**Does streaming help with rate limits?**
It helps perceived latency, not capacity. Output tokens count against your ceiling whether you stream them or not. Streaming does make queueing more tolerable, because a response that starts in 900 milliseconds after a short wait reads as fine.

**Can I just raise my own concurrency to push more through?**
No. Concurrency controls how many requests are in flight, while the provider's ceiling is enforced per minute across the window. More concurrency against a fixed ceiling produces more rejections at the same throughput, which is why the limiter belongs on your side.

**Is batching a fix?**
Partly. Batch endpoints have separate, usually generous quotas and are the right home for embeddings, nightly summaries and eval runs. They are not an option for anything a user waits on.

Capacity planning, request queuing and shedding, and the quota conversation with your provider are the reliability controls I add during a **Production Hardening** engagement, a three to six week block alongside evals, monitoring and cost controls. If a traffic spike is already on your calendar and nobody has computed the headroom, the [services page](/en/services) covers the scope and the [contact page](/en/contact) is the faster route to a date.
