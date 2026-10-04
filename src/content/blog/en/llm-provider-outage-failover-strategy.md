---
title: "Your AI Feature Failover Strategy Is Probably a Retry Loop"
description: "Most outages are self-inflicted. Here's the AI feature failover strategy with provider, model and degraded-mode layers that actually survives a provider incident."
published: "2026-10-04"
tags: ["AI failover", "LLM reliability", "circuit breaker", "production engineering", "AI infrastructure"]
ogImage: "/images/blog/llm-provider-outage-failover-strategy/cover.jpg"
primaryService: "hardening"
---
A provider returns HTTP 503 on the chat completions endpoint. Your client has a 60 second timeout and three retries with a one second backoff, so each failing request now occupies a worker for roughly three minutes. Your connection pool fills in under a minute, and requests that have nothing to do with AI start timing out behind it, because they share the same pool. The provider is having a partial outage in one region. Your product is down everywhere. The distance between those two sentences is your **AI feature failover strategy**, or the absence of one.

That asymmetry is the thing worth staring at. The provider degraded by some percentage of requests in one region. You went to zero, and the reason is in your code, not theirs. Most teams discover this while refreshing a status page, which is the worst possible moment to start designing the fallback path.

What follows is the build order I use when hardening a live feature against provider failure: how calls should be bounded, where the second provider goes, how to route across models without breaking your output contract, and what to show users when every path is exhausted. None of it is exotic. All of it has to exist before the incident, because the incident is not when you get to write code.

## The outage is rarely clean, which is the actual problem

Full hard outages are easy mode. The endpoint refuses connections, your error rate goes to 100%, your alerts fire, everyone knows. The expensive failure is partial and slow: elevated error rates on a subset of requests, time-to-first-token drifting from 600ms to nine seconds, streams that open and then stall mid-response, or 200 responses whose content is quietly worse because capacity pressure pushed you onto a degraded path somewhere upstream.

Five things typically go wrong at once inside your own stack during that window. Retries amplify load exactly when the provider is overloaded. Timeouts set per-request rather than per-user-action stack up to something nobody budgeted for. Streaming responses that stall never trigger the timeout at all, because bytes technically arrived. Queued background jobs pile up and then stampede the provider the second it recovers. And the status page lags reality by ten to thirty minutes, so for the first half hour you genuinely do not know whether the problem is you.

If your monitoring cannot distinguish "the provider is slow" from "our retrieval step is slow" within two minutes, you are going to spend the outage guessing. That distinction is a dashboard decision you make in advance, and it is the first thing I check when [reviewing what actually breaks in AI production](/en/blog/what-breaks-in-ai-production).

## "We'll just retry" is not a fallback strategy

Retries solve exactly one failure mode: a transient blip on an otherwise healthy provider. They are the correct tool for a single 429 with a `Retry-After` header. They are actively harmful during a capacity event, where every retry you send is load the provider is already failing to absorb, and where your three attempts just tripled your own latency before failing anyway.

![Your AI Feature Failover Strategy Is Probably a Retry Loop](/images/blog/llm-provider-outage-failover-strategy/1.jpg)

A retry policy that behaves under stress has rules most implementations skip. Retry only on genuinely retryable conditions: connection errors, 429 with backoff, 500, 503, and Anthropic's 529 overload response. Never retry a 400, a context-length error, or a content filter rejection, because the second attempt will fail identically and you paid for the first. Use exponential backoff with full jitter so your own instances stop synchronizing into waves. Cap total attempts by a wall-clock budget rather than a count: if the user-facing action has 8 seconds, one retry fits and two do not. And if the call writes anything (a tool invocation, a database mutation), send an idempotency key, because retrying a half-completed agent step is how you get duplicate records on top of an outage.

Retries are the inner loop. Failover is the outer loop. Conflating them is why teams believe they have resilience when what they have is a slower way to return 500.

## An AI feature failover strategy has three layers: provider, model, degraded mode

Treat them as three independent mechanisms, each with its own trigger.

**Layer 1, provider failover.** The same model family reached through a second vendor. GPT-class models through both OpenAI and Azure OpenAI. Claude through the Anthropic API and Bedrock or Vertex. This is the cheapest layer to build and the highest value, because the model behaviour is identical, so your prompts and your evals carry over untouched. Different control plane, different region, different rate-limit bucket. Build this first.

**Layer 2, model failover.** A different model entirely, from a different vendor, when the whole family is unavailable. This one has a cost you pay up front: the fallback model has to pass your eval set too, with its own prompt version. Tool-calling schemas, structured-output behaviour, system-prompt adherence and refusal patterns all differ across vendors, so a fallback you have never evaluated is a fallback that produces malformed JSON at 03:00. If you keep [prompts versioned and regression-tested](/en/blog/prompt-versioning-regression-testing), this is a tractable amount of work. If you do not, multi-model failover in production is a liability you have not measured yet.

**Layer 3, degraded mode.** What the feature does when no model answers. Not an error page. A deliberately reduced version of the feature, which I will come back to, because it is the layer teams skip and users notice most.

The call path, stripped down:

python
PROVIDERS = [
    ("azure-gpt",      breaker_azure),    # same family, different control plane
    ("openai-gpt",     breaker_openai),
    ("bedrock-claude", breaker_bedrock),  # different model, separately evaluated
]

def complete(req, budget_ms=8000):
    deadline = now_ms() + budget_ms
    for name, breaker in PROVIDERS:
        if not breaker.allows():          # open circuit, skip without calling
            continue
        if now_ms() > deadline - 1500:    # no time left to try honestly
            break
        try:
            return call(name, req, timeout_ms=deadline - now_ms())
        except Retryable as e:
            breaker.record_failure(e)
            continue
        except NonRetryable:
            raise                         # bad request: failing over changes nothing
    return degraded(req)                  # layer 3, always reachable

The important property is that `degraded()` is a normal return value, not an exception handler. If degraded mode lives in a `catch` block, it will be wrong, because nobody tests `catch` blocks.

## The circuit breaker is what stops the amplification

A circuit breaker on your LLM API client is a small state machine wrapped around each provider, and it does the one thing retries cannot: it stops sending traffic to something that is already failing.

Closed is normal operation, with failures counted over a sliding window (say 20 requests). Cross the threshold, roughly 50% failures or any five consecutive timeouts, and the breaker opens. Open means calls return immediately without touching the network, which is the whole point: your workers stay free, your pool stays healthy, and the rest of your product keeps serving. After a cool-down of 20 to 60 seconds the breaker goes half-open and lets exactly one probe request through. Success closes it, failure reopens it with a longer cool-down.

Two details matter more than the thresholds. First, keep a separate breaker per provider and per model, because a Bedrock regional problem should not open the circuit on your Anthropic direct path. Second, treat timeouts as failures and define them properly for streaming: a time-to-first-token timeout around 3 to 5 seconds, plus an inter-token stall timeout, otherwise a stalled stream holds a connection until the client gives up. Most of the pathological latency I find during a [latency audit](/en/blog/llm-latency-audit-production) comes from stalled streams nobody bounded.

Emit a metric on every state transition and alert on breaker-open. That single signal tells you in seconds what a status page tells you in twenty minutes.

## Degraded mode: give people something, and tell them the truth

Users forgive a reduced feature. They do not forgive a spinner that spins for 45 seconds and then shows a generic error, because the spinner made them wait before lying to them.

What a designed degraded mode looks like depends on the feature, but the options are concrete. A RAG assistant can fall back to returning the retrieved source passages with a clear note that the summary is unavailable, which is often most of the value and completely accurate. A classification or extraction path can fall back to a deterministic rule set and flag the output for review. An agent workflow can accept the task, queue it, and email the result when capacity returns. Anything with a cached layer can serve the last good answer with a visible timestamp. And the entry point itself can be soft-disabled: grey out the AI action, say "AI summaries are temporarily unavailable, upstream provider issue", keep the rest of the product fully usable.

A few rules make this work. Fail fast, inside two or three seconds, so the user is not punished for the length of your fallback chain. Say which capability is degraded rather than showing a generic error. Never silently substitute a weaker model on a decision that matters (a medical triage hint, a pricing recommendation, an eligibility check) without labelling it, because an unlabelled quality drop is worse than an honest unavailable.

## Chaos-test it, or you do not have it

Failover code that has never fired does not work. I have not once seen an untested fallback path run correctly the first time in production, and the failures are mundane: the fallback credential was never provisioned, the fallback model's region does not allow the data, the breaker config was wrong in prod, the degraded template renders `undefined`.

Put a fault-injection switch in your provider client, controlled by config, that can force per-provider error rates, hard timeouts, stalled streams and malformed responses. Then run four scenarios on purpose. Primary provider returns 100% 503: does the breaker open within one window and does traffic land on provider two? Primary returns 50% errors: do you flap between providers, and does cost spike? Primary stalls mid-stream: does the inter-token timeout fire or does the request hang? All providers down: does degraded mode render, and does the rest of the app stay up?

Run them in staging, then once in production during your lowest-traffic hour with the team watching. Re-run quarterly and after any provider-SDK upgrade. Your [observability setup](/en/blog/llm-observability-production-monitoring) should show you the whole thing without anyone tailing logs.

## What it costs to build versus what the outage costs

In my experience, provider-level failover plus a circuit breaker is a few days of focused work for someone who has built it before, assuming your LLM calls already go through one client module. If they are scattered across twelve call sites, add time for the abstraction first. Model-level failover is more, because the real work is evaluating the second model, not wiring it up. Degraded-mode UX usually needs design input, which is the part that slips.

Running costs are modest but real: a second provider means a second set of credentials and often a second egress path, the fallback model may have different per-token pricing, and failing over during an incident can push a day's spend above budget. That belongs in your [production LLM cost model](/en/blog/cost-of-production-llm-2026), not in a surprise invoice. Compare it against the alternative, which is a full product outage you cannot shorten, cannot explain, and cannot promise will not repeat, because nothing you own has changed.

## Questions I get about this

**Does a gateway like LiteLLM, Portkey or OpenRouter give me failover for free?**
It gives you provider abstraction and basic retry or fallback routing, which is genuinely useful and saves real work. It does not give you a tested degraded mode, evals on the fallback model, or correct timeout budgets for your user-facing action. It also becomes a dependency of its own: if you self-host the gateway it is now in your critical path, and if you use the hosted version you have added a vendor in front of your vendor.

**Is one provider with a good SLA enough?**
An SLA is a billing credit, not uptime. Service credits do not help the customer whose workflow failed. If the AI feature sits on a revenue path or a support path, build at least layer 1, which is usually the same model reached through a second cloud.

**How do I keep the fallback model from quietly producing worse output?**
Run your eval set against both models on every prompt change, and record which provider and model served each production response. Set a separate quality threshold for the fallback and label degraded answers in the UI. If you cannot trace which model answered a given request, you cannot audit any of this later.

**Should background jobs fail over the same way?**
Usually not. Batch and async work should fail slow instead: let the breaker stay open, keep the queue, resume on recovery with a rate limit so you do not stampede the provider the moment it comes back. Save aggressive failover for interactive requests where a human is waiting.

## Before the next status-page incident

Designing provider failover, model routing, circuit breakers and a degraded-mode UX is deploy-hardening work, and it belongs in the three to six week Production Hardening engagement I run on live AI features, alongside evals, monitoring and latency and cost controls. If your AI feature currently has one provider, one model and a spinner, that is the gap, and it is cheaper to close this month than during an outage. See [what the engagement covers](/en/services) or [tell me what your current call path looks like](/en/contact).
